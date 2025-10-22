import AppHeader from '@/src/components/AppHeader';
import AppScreen from '@/src/components/AppScreen';
import CardTimesheet from '@/src/components/CardTimesheet';
import LoadingTruck from '@/src/components/LoadingTruck';
import TimesheetFilter from '@/src/components/TimesheetFilter';
import ApiFetch from '@/src/helpers/ApiFetch';
import appmode from '@/src/helpers/ThemesMode';
import { useTimesheetByEmployee } from '@/src/hooks/useSQLite';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { clearFilters, setDefaultFilter } from '@/src/redux/timesheetFilterSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('screen');


export default function TimesheetPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(state => state.themes.value);
  const { employee } = useAppSelector(state => state.auth);
  const timesheetFilter = useAppSelector(state => state.timesheetFilter);
  const penyewaData = useAppSelector(state => state.penyewa?.data || []);
  const equipmentData = useAppSelector(state => state.equipment?.data || []);
  const shiftData = useAppSelector(state => state.shift?.data || []);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  
  // Options for filter display
  const mainactOptions = [
    { label: 'Barging', value: 'barging' },
    { label: 'Mining', value: 'mining' },
    { label: 'Rental', value: 'rental' },
  ];
  
  const statusOptions = [
    { label: 'Approved', value: 'A' },
    { label: 'Submitted', value: 'W' },
    { label: 'Retry', value: 'R' },
  ];
  const [error, setError] = useState(null);
  
  // SQLite hook
  const { timesheets: dbTimesheets } = useTimesheetByEmployee(employee?.id);
  
  // Initialize default filter when employee data is available
  useEffect(() => {
    if (employee && !timesheetFilter.karyawan_id) {
      dispatch(setDefaultFilter({ employee }));
    }
  }, [employee, timesheetFilter.karyawan_id, dispatch]);

  // Map API data to match mobile structure
  const mapApiDataToCard = useCallback((apiItem) => {
    const baseDate = apiItem.tanggal || apiItem.date_ops || moment().format('YYYY-MM-DD');
    return {
      // Basic fields
      id: apiItem.id,
      kode: apiItem.kode || '',
      mainact: apiItem.mainact || 'mining',
      date_ops: baseDate,
      tanggal: baseDate,
      
      // IDs
      penyewa_id: apiItem.penyewa_id || 0,
      equipment_id: apiItem.equipment_id || 0,
      shift_id: apiItem.shift_id || 0,
      karyawan_id: apiItem.karyawan_id || 0,
      
      // Equipment and operator
      equip_kode: apiItem.kdunit || apiItem.kode_alat || apiItem.equipment_kode || apiItem.equipment?.kode || '-',
      equipment: apiItem.equipment || {},
      karyawan: apiItem.karyawan || {},
      penyewa: apiItem.penyewa || {},
      pelanggan: {
        nama: apiItem.penyewa?.nama || apiItem.customer || apiItem.nama_pelanggan || '-'
      },
      
      // Time and SMU
      starttime: apiItem.starttime || `${baseDate} 07:00:00`,
      endtime: apiItem.endtime || `${baseDate} 17:00:00`,
      smustart: apiItem.smustart || apiItem.smu_start || '0',
      smufinish: apiItem.smufinish || apiItem.smu_finish || '0',
      
      // Other fields
      bbm: apiItem.bbm || apiItem.fuel || '0',
      longshift: apiItem.longshift || 'ls1',
      keterangan: apiItem.keterangan || '',
      status: apiItem.status || 'draft',
      
      // Related objects
      shift: apiItem.shift || null,
      longshift_obj: apiItem.longshift_obj || null,
      
      // Activities
      kegiatan: Array.isArray(apiItem.kegiatan) ? apiItem.kegiatan : [],
      items: Array.isArray(apiItem.items) ? apiItem.items : [],
      
      // Display fields (for form components)
      operator_nama: apiItem.karyawan?.nama || apiItem.operator_name || '-',
      penyewa_nama: apiItem.penyewa?.nama || apiItem.customer || '-',
      equipment_nama: apiItem.equipment?.kode || apiItem.equip_kode || '-',
      shift_nama: apiItem.shift?.nama || '-',
      photo: apiItem.photo,
      originalData: { ...apiItem }
    };
  }, []);

  useEffect(() => {
    loadTimesheets();
  }, [employee?.id, timesheetFilter, loadTimesheets]);

  const loadTimesheets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to load from WatermelonDB first for offline capability
      if (employee?.id && dbTimesheets.length > 0) {
        setData(dbTimesheets);
        setLoading(false);
        return;
      }
      
      // Build query parameters from filter
      const qstring = {
        karyawan_id: timesheetFilter.karyawan_id,
        site_id: timesheetFilter.site_id,
        startdate: timesheetFilter.startdate,
        enddate: timesheetFilter.enddate,
      };
      
      // Add optional filters only if they have values
      if (timesheetFilter.penyewa_id) {
        qstring.penyewa_id = timesheetFilter.penyewa_id;
      }
      if (timesheetFilter.mainact) {
        qstring.mainact = timesheetFilter.mainact;
      }
      if (timesheetFilter.status) {
        qstring.status = timesheetFilter.status;
      }
      if (timesheetFilter.equipment_id) {
        qstring.equipment_id = timesheetFilter.equipment_id;
      }
      if (timesheetFilter.shift_id) {
        qstring.shift_id = timesheetFilter.shift_id;
      }
      
      console.log('🔍 Loading timesheets with filter:', qstring);
      
      const resp = await ApiFetch.get('/operation/timesheet', { params: qstring });
      
      // Handle response structure: { rows: { data: [...] } }
      const responseData = resp.data.rows?.data || resp.data.rows || resp.data.data || resp.data || [];
      
      console.log(`📊 Found ${responseData.length} timesheets`);
      setData(responseData);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading timesheets:', err);
      setError(err.response?.data?.diagnostic?.message || err.message || 'Gagal memuat data timesheet');
      setLoading(false);
      setData([]);
    }
  }, [timesheetFilter, employee?.id, dbTimesheets]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      // Force refresh from API with current filter
      const qstring = {
        karyawan_id: timesheetFilter.karyawan_id,
        site_id: timesheetFilter.site_id,
        startdate: timesheetFilter.startdate,
        enddate: timesheetFilter.enddate,
      };
      
      // Add optional filters only if they have values
      if (timesheetFilter.penyewa_id) qstring.penyewa_id = timesheetFilter.penyewa_id;
      if (timesheetFilter.mainact) qstring.mainact = timesheetFilter.mainact;
      if (timesheetFilter.status) qstring.status = timesheetFilter.status;
      if (timesheetFilter.equipment_id) qstring.equipment_id = timesheetFilter.equipment_id;
      if (timesheetFilter.shift_id) qstring.shift_id = timesheetFilter.shift_id;
      
      const resp = await ApiFetch.get('/operation/timesheet', { params: qstring });
      const responseData = resp.data.rows?.data || resp.data.rows || resp.data.data || resp.data || [];
      setData(responseData);
    } catch (err) {
      setError(err.response?.data?.diagnostic?.message || err.message || 'Gagal memuat data timesheet');
    } finally {
      setRefreshing(false);
    }
  }, [timesheetFilter]);

  const handleFilter = () => {
    setShowFilter(!showFilter);
  };
  
  const handleFilterApply = (filterData) => {
    console.log('🎯 Filter applied:', filterData);
    // Filter is already in Redux, just trigger reload
    loadTimesheets();
  };

  const handleCardPress = (item) => {
    // Pass the mapped item data as query params
    const mappedItem = mapApiDataToCard(item);
    
    router.push({
      pathname: '/timesheet/[id]',
      params: {
        id: item.id.toString(),
        initialData: JSON.stringify(mappedItem)
      }
    });
  };


  

  const renderTimesheetItem = ({ item, index }) => {
    return (
      <CardTimesheet
        item={mapApiDataToCard(item)}
        onPress={() => handleCardPress(item)}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="document-text-outline"
        size={64}
        color={appmode.txtcolor[mode][2]}
      />
      <Text
        style={[
          styles.emptyTitle,
          { color: appmode.txtcolor[mode][1] },
        ]}>
        Belum Ada TimeSheet
      </Text>
      <Text
        style={[
          styles.emptyText,
          { color: appmode.txtcolor[mode][2] },
        ]}>
        Mulai catat aktivitas harian Anda dengan menekan tombol tambah
      </Text>
    </View>
  );

  if (loading && (!data || data.length === 0)) {
    return (
      <AppScreen>
        <AppHeader
          title="TimeSheet Harian"
          prevPage={true}
          onChangeThemes={true}
          onSearch={handleFilter}
          rightComponent={
            <TouchableOpacity 
              onPress={() => setShowFilter(true)}
              style={[
                styles.headerFilterButton,
                { 
                  backgroundColor: timesheetFilter.isFilterActive ? appmode.txtcolor[mode][7] : 'transparent',
                  borderColor: timesheetFilter.isFilterActive ? appmode.txtcolor[mode][7] : appmode.boxlinecolor[mode][1]
                }
              ]}
            >
              <Ionicons 
                name="filter" 
                size={18} 
                color={timesheetFilter.isFilterActive ? '#FFFFFF' : appmode.txtcolor[mode][3]} 
              />
              {timesheetFilter.isFilterActive && (
                <View style={[styles.filterCountBadge, { backgroundColor: '#FFFFFF' }]}>
                  <Text style={[styles.filterCountText, { color: appmode.txtcolor[mode][7] }]}>
                    {timesheetFilter.filterCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          }
        />
        <LoadingTruck height={height * 0.9} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
       <AppHeader
         title="TimeSheet Harian"
         prevPage={true}
         onChangeThemes={true}
         onSearch={handleFilter}
         rightComponent={
           <TouchableOpacity 
             onPress={() => setShowFilter(true)}
             style={[
               styles.headerFilterButton,
               { 
                 backgroundColor: timesheetFilter.isFilterActive ? appmode.txtcolor[mode][7] : 'transparent',
                 borderColor: timesheetFilter.isFilterActive ? appmode.txtcolor[mode][7] : appmode.boxlinecolor[mode][1]
               }
             ]}
           >
             <Ionicons 
               name="filter" 
               size={18} 
               color={timesheetFilter.isFilterActive ? '#FFFFFF' : appmode.txtcolor[mode][3]} 
             />
             {timesheetFilter.isFilterActive && (
               <View style={[styles.filterCountBadge, { backgroundColor: '#FFFFFF' }]}>
                 <Text style={[styles.filterCountText, { color: appmode.txtcolor[mode][7] }]}>
                   {timesheetFilter.filterCount}
                 </Text>
               </View>
             )}
           </TouchableOpacity>
         }
       />
       {/* Filter Modal - Overlay */}
       <TimesheetFilter
         visible={showFilter}
         onClose={() => setShowFilter(false)}
         onApply={handleFilterApply}
       />
       
       {/* Main Content */}
       <View style={[styles.container, { height: height * 0.85 }]}>
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
             <TouchableOpacity 
               style={[styles.actionButton, styles.formButton, { backgroundColor: appmode.txtcolor[mode][7] }]}
               onPress={() => router.push('/timesheet/create')}>
               <Ionicons name="add" size={20} color="#FFFFFF" />
               <Text style={styles.actionButtonText}>Buat Timesheet</Text>
             </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/timesheet/ai-chat')}
                style={[styles.actionButton, styles.aiButton, { 
                  backgroundColor: 'transparent',
                  borderColor: appmode.boxlinecolor[mode][2],
                  borderWidth: 1
                }]}>
                <Ionicons name="mic" size={20} color={appmode.txtcolor[mode][7]} />
                <Text style={[styles.actionButtonText, { color: appmode.txtcolor[mode][7] }]}>Chat Athi</Text>
              </TouchableOpacity>
            </View>

           {/* Active Filters Display */}
           {timesheetFilter.isFilterActive && (
             <View style={[styles.activeFiltersContainer, { backgroundColor: appmode.boxlinecolor[mode][1] + '10' }]}>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
                 <View style={styles.filterChipsContainer}>
                   {timesheetFilter.startdate && timesheetFilter.enddate && (
                     <View style={[styles.filterChip, { backgroundColor: appmode.txtcolor[mode][7] + '20', borderColor: appmode.txtcolor[mode][7] }]}>
                       <Ionicons name="calendar-outline" size={12} color={appmode.txtcolor[mode][7]} />
                       <Text style={[styles.filterChipText, { color: appmode.txtcolor[mode][7] }]}>
                         {timesheetFilter.startdate} - {timesheetFilter.enddate}
                       </Text>
                     </View>
                   )}
                   {timesheetFilter.mainact && (
                     <View style={[styles.filterChip, { backgroundColor: '#3B82F620', borderColor: '#3B82F6' }]}>
                       <Ionicons name="apps-outline" size={12} color="#3B82F6" />
                       <Text style={[styles.filterChipText, { color: '#3B82F6' }]}>
                         {mainactOptions.find(opt => opt.value === timesheetFilter.mainact)?.label || timesheetFilter.mainact}
                       </Text>
                     </View>
                   )}
                   {timesheetFilter.status && (
                     <View style={[styles.filterChip, { backgroundColor: '#10B98120', borderColor: '#10B981' }]}>
                       <Ionicons name="checkmark-circle-outline" size={12} color="#10B981" />
                       <Text style={[styles.filterChipText, { color: '#10B981' }]}>
                         {statusOptions.find(opt => opt.value === timesheetFilter.status)?.label || timesheetFilter.status}
                       </Text>
                     </View>
                   )}
                   {timesheetFilter.penyewa_id && (
                     <View style={[styles.filterChip, { backgroundColor: '#F59E0B20', borderColor: '#F59E0B' }]}>
                       <Ionicons name="business-outline" size={12} color="#F59E0B" />
                       <Text style={[styles.filterChipText, { color: '#F59E0B' }]}>
                         {penyewaData.find(p => p.id.toString() === timesheetFilter.penyewa_id.toString())?.nama || 'Penyewa'}
                       </Text>
                     </View>
                   )}
                   {timesheetFilter.equipment_id && (
                     <View style={[styles.filterChip, { backgroundColor: '#8B5CF620', borderColor: '#8B5CF6' }]}>
                       <Ionicons name="construct-outline" size={12} color="#8B5CF6" />
                       <Text style={[styles.filterChipText, { color: '#8B5CF6' }]}>
                          {equipmentData.find(e => e.id.toString() === timesheetFilter.equipment_id.toString())?.kode || 'Equipment'}
                       </Text>
                     </View>
                   )}
                   {timesheetFilter.shift_id && (
                     <View style={[styles.filterChip, { backgroundColor: '#EF444420', borderColor: '#EF4444' }]}>
                       <Ionicons name="time-outline" size={12} color="#EF4444" />
                       <Text style={[styles.filterChipText, { color: '#EF4444' }]}>
                         {shiftData.find(s => s.id.toString() === timesheetFilter.shift_id.toString())?.nama || 'Shift'}
                       </Text>
                     </View>
                   )}
                 </View>
               </ScrollView>
               <TouchableOpacity 
                 style={[styles.clearFiltersButton, { borderColor: appmode.boxlinecolor[mode][1] }]}
                 onPress={() => dispatch(clearFilters())}
               >
                 <Ionicons name="close-circle" size={16} color={appmode.txtcolor[mode][6]} />
               </TouchableOpacity>
             </View>
           )}

           {/* Timesheet List */}
           <FlatList
             data={data || []}
            renderItem={renderTimesheetItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[appmode.txtcolor[mode][7]]}
                tintColor={appmode.txtcolor[mode][7]}
              />
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.loadingContainer}>
                  <LoadingTruck height={200} />
                </View>
              ) : (
                renderEmptyState()
              )
            }
            contentContainerStyle={styles.listContainer}
          />

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: appmode.txtcolor[mode][7] },
                ]}
                onPress={loadTimesheets}>
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          )}
         </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    gap: 8,
  },
  formButton: {
    // backgroundColor handled inline
  },
  aiButton: {
    // backgroundColor and border handled inline
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    fontWeight: '600',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filtersScroll: {
    flex: 1,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  clearFiltersButton: {
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  headerFilterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  filterCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterCountText: {
    fontSize: 9,
    fontWeight: '600',
  },
});