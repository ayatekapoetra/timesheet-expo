import appmode from '@/src/helpers/ThemesMode';
import {
  getEquipment
} from '@/src/redux/equipmentSlice';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import {
  getPenyewa
} from '@/src/redux/penyewaSlice';
import {
  getShift
} from '@/src/redux/shiftSlice';
import {
  clearFilters,
  setDefaultFilter,
  updateFilter
} from '@/src/redux/timesheetFilterSlice';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BottomSheetPicker from './BottomSheetPicker';
import DatePickerModal from './DatePickerModal';



const TimesheetFilter = ({ visible, onClose, onApply }) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';
  
  // Get filter state from Redux
  const filter = useAppSelector(state => state.timesheetFilter);
  const { employee } = useAppSelector(state => state.auth);
  
  // Get master data with safe defaults
  const penyewaData = useAppSelector(state => state.penyewa?.data || []);
  const equipmentData = useAppSelector(state => state.equipment?.data || []);
  const shiftData = useAppSelector(state => state.shift?.data || []);



  // Ensure data is arrays and provide fallback data if needed
  const safePenyewaData = Array.isArray(penyewaData) ? penyewaData : [];
  const safeEquipmentData = Array.isArray(equipmentData) && equipmentData.length > 0 ? equipmentData : [
    { id: '1', kode: 'EXC-001', kategori: 'HE', nama: 'Excavator 1' },
    { id: '2', kode: 'DT-001', kategori: 'DT', nama: 'Dump Truck 1' },
    { id: '3', kode: 'EXC-002', kategori: 'HE', nama: 'Excavator 2' },
    { id: '4', kode: 'DT-002', kategori: 'DT', nama: 'Dump Truck 2' },
  ];
  const safeShiftData = Array.isArray(shiftData) ? shiftData : [];
  
  // Local state for UI
  const [showPenyewaPicker, setShowPenyewaPicker] = useState(false);
  const [showEquipmentPicker, setShowEquipmentPicker] = useState(false);
  const [showShiftPicker, setShowShiftPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  
  // Quick filter options
  const quickDateFilters = [
    { label: 'Hari Ini', value: 'today', icon: 'today-outline' },
    { label: '7 Hari', value: 'week', icon: 'calendar-outline' },
    { label: '30 Hari', value: 'month', icon: 'calendar-number-outline' },
    { label: 'Custom', value: 'custom', icon: 'options-outline' },
  ];
  
  // Options for pickers
  const mainactOptions = [
    { label: 'Semua Kategori', value: '', icon: 'apps-outline', color: '#6B7280' },
    { label: 'Barging', value: 'barging', icon: 'boat-outline', color: '#3B82F6' },
    { label: 'Mining', value: 'mining', icon: 'construct-outline', color: '#10B981' },
    { label: 'Rental', value: 'rental', icon: 'business-outline', color: '#F59E0B' },
  ];
  
  const statusOptions = [
    { label: 'Semua Status', value: '', icon: 'list-outline', color: '#6B7280' },
    { label: 'Submitted', value: 'W', icon: 'send-outline', color: '#3B82F6' },
    { label: 'Approved', value: 'A', icon: 'checkmark-circle-outline', color: '#10B981' },
    { label: 'Pending', value: 'R', icon: 'close-circle-outline', color: '#EF4444' },
  ];
  
  // Initialize default filter when component mounts
  useEffect(() => {
    if (employee && !filter.karyawan_id) {
      dispatch(setDefaultFilter({ employee }));
    }
  }, [employee, filter.karyawan_id, dispatch]);
  
  // Load master data
  useEffect(() => {
    dispatch(getPenyewa());
    dispatch(getEquipment());
    dispatch(getShift());
  }, [dispatch]);
  
  // Animate modal
  useEffect(() => {
    if (visible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animatedValue]);
  
  const handleFieldChange = (field, value) => {
    dispatch(updateFilter({ field, value }));
  };
  
  const handleApply = () => {
    onApply(filter);
    onClose();
  };
  
  const handleClear = () => {
    dispatch(clearFilters());
  };
  
  const handleQuickDateFilter = (value) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch (value) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'custom':
        setShowStartDatePicker(true);
        return;
    }
    
    handleFieldChange('startdate', startDate.toISOString().split('T')[0]);
    handleFieldChange('enddate', endDate.toISOString().split('T')[0]);
  };
  
  const getDisplayValue = (field, options = null) => {
    const value = filter[field];
    
    if (!value) return '';
    
    if (options) {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    
    if (field === 'penyewa_id') {
      const penyewa = safePenyewaData.find(p => p.id.toString() === value.toString());
      return penyewa ? penyewa.nama : '';
    }

    if (field === 'equipment_id') {
      const equipment = safeEquipmentData.find(e => e.id.toString() === value.toString());
      return equipment ? equipment.kode || equipment.nama || '' : '';
    }

    if (field === 'shift_id') {
      const shift = safeShiftData.find(s => s.id.toString() === value.toString());
      return shift ? shift.nama : '';
    }
    
    return value;
  };
  
  if (!visible) return null;
  
  const modalTransform = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
  };
  
  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }]}>
      <Animated.View style={[styles.content, modalTransform, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: appmode.boxlinecolor[mode][1] }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: appmode.txtcolor[mode][7] + '20' }]}>
              <Ionicons name="filter-outline" size={20} color={appmode.txtcolor[mode][7]} />
            </View>
            <View>
              <Text style={[styles.title, { color: appmode.txtcolor[mode][1] }]}>
                Filter Timesheet
              </Text>
              <Text style={[styles.subtitle, { color: appmode.txtcolor[mode][3] }]}>
                {filter.filterCount} filter aktif
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: appmode.boxlinecolor[mode][1] + '20' }]}>
            <Ionicons name="close" size={20} color={appmode.txtcolor[mode][3]} />
          </TouchableOpacity>
        </View>
        
        {/* Filter Content */}
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* User Info Card */}
          <View style={[styles.userInfoCard, { backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}>
            <View style={styles.userInfoRow}>
              <View style={[styles.avatarContainer, { backgroundColor: appmode.txtcolor[mode][7] }]}>
                <Text style={styles.avatarText}>
                  {employee?.nama?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: appmode.txtcolor[mode][1] }]}>
                  {employee?.nama || 'User'}
                </Text>
                <Text style={[styles.userSite, { color: appmode.txtcolor[mode][3] }]}>
                  {employee?.cabang?.nama || 'Site'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.badgeText}>Default</Text>
              </View>
            </View>
          </View>

          {/* Quick Date Filters */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: appmode.txtcolor[mode][1] }]}>
              <Ionicons name="time-outline" size={16} color={appmode.txtcolor[mode][7]} />
              {' '}Periode Waktu
            </Text>
            <View style={styles.quickFilterGrid}>
              {quickDateFilters.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.quickFilterItem,
                    {
                      backgroundColor: filter.startdate && filter.enddate && item.value !== 'custom'
                        ? appmode.txtcolor[mode][7] + '20'
                        : appmode.boxlinecolor[mode][1] + '10',
                      borderColor: filter.startdate && filter.enddate && item.value !== 'custom'
                        ? appmode.txtcolor[mode][7]
                        : appmode.boxlinecolor[mode][1]
                    }
                  ]}
                  onPress={() => handleQuickDateFilter(item.value)}
                >
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={filter.startdate && filter.enddate && item.value !== 'custom'
                      ? appmode.txtcolor[mode][7]
                      : appmode.txtcolor[mode][3]}
                  />
                  <Text style={[
                    styles.quickFilterText,
                    {
                      color: filter.startdate && filter.enddate && item.value !== 'custom'
                        ? appmode.txtcolor[mode][7]
                        : appmode.txtcolor[mode][3]
                    }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom Date Range */}
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: appmode.boxlinecolor[mode][1] }]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={16} color={appmode.txtcolor[mode][7]} />
                <View style={styles.dateContent}>
                  <Text style={[styles.dateLabel, { color: appmode.txtcolor[mode][3] }]}>Dari</Text>
                  <Text style={[styles.dateValue, { color: appmode.txtcolor[mode][1] }]}>
                    {filter.startdate || 'Pilih tanggal'}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.dateSeparator}>
                <Ionicons name="arrow-forward" size={16} color={appmode.txtcolor[mode][3]} />
              </View>
              
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: appmode.boxlinecolor[mode][1] }]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={16} color={appmode.txtcolor[mode][7]} />
                <View style={styles.dateContent}>
                  <Text style={[styles.dateLabel, { color: appmode.txtcolor[mode][3] }]}>Sampai</Text>
                  <Text style={[styles.dateValue, { color: appmode.txtcolor[mode][1] }]}>
                    {filter.enddate || 'Pilih tanggal'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: appmode.txtcolor[mode][1] }]}>
              <Ionicons name="apps-outline" size={16} color={appmode.txtcolor[mode][7]} />
              {' '}Kategori Kegiatan
            </Text>
            <View style={styles.categoryGrid}>
              {mainactOptions.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: filter.mainact === item.value ? item.color + '20' : appmode.boxlinecolor[mode][1] + '10',
                      borderColor: filter.mainact === item.value ? item.color : appmode.boxlinecolor[mode][1]
                    }
                  ]}
                  onPress={() => handleFieldChange('mainact', item.value)}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={filter.mainact === item.value ? item.color : appmode.txtcolor[mode][3]}
                  />
                  <Text style={[
                    styles.categoryText,
                    {
                      color: filter.mainact === item.value ? item.color : appmode.txtcolor[mode][3]
                    }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status Filter */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: appmode.txtcolor[mode][1] }]}>
              <Ionicons name="checkmark-circle-outline" size={16} color={appmode.txtcolor[mode][7]} />
              {' '}Status
            </Text>
            <View style={styles.statusGrid}>
              {statusOptions.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.statusItem,
                    {
                      backgroundColor: filter.status === item.value ? item.color + '20' : appmode.boxlinecolor[mode][1] + '10',
                      borderColor: filter.status === item.value ? item.color : appmode.boxlinecolor[mode][1]
                    }
                  ]}
                  onPress={() => handleFieldChange('status', item.value)}
                >
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={filter.status === item.value ? item.color : appmode.txtcolor[mode][3]}
                  />
                  <Text style={[
                    styles.statusText,
                    {
                      color: filter.status === item.value ? item.color : appmode.txtcolor[mode][3]
                    }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Advanced Filters */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: appmode.txtcolor[mode][1] }]}>
              <Ionicons name="settings-outline" size={16} color={appmode.txtcolor[mode][7]} />
              {' '}Filter Lanjutan
            </Text>

            {/* Penyewa */}
            <TouchableOpacity
              style={[styles.advancedField, { borderColor: appmode.boxlinecolor[mode][1] }]}
              onPress={() => setShowPenyewaPicker(true)}
            >
              <View style={styles.fieldLeft}>
                <Ionicons name="business-outline" size={16} color={appmode.txtcolor[mode][7]} />
                <Text style={[{ color: appmode.txtcolor[mode][1] }]}>Penyewa</Text>
              </View>
              <View style={styles.fieldRight}>
                <Text style={[{ color: appmode.txtcolor[mode][3] }]}>
                  {getDisplayValue('penyewa_id')}
                </Text>
                <Ionicons name="chevron-down" size={16} color={appmode.txtcolor[mode][3]} />
              </View>
            </TouchableOpacity>

            {/* Equipment */}
            <TouchableOpacity
              style={[styles.advancedField, { borderColor: appmode.boxlinecolor[mode][1] }]}
              onPress={() => setShowEquipmentPicker(true)}
            >
              <View style={styles.fieldLeft}>
                <Ionicons name="construct-outline" size={16} color={appmode.txtcolor[mode][7]} />
                <Text style={[{ color: appmode.txtcolor[mode][1] }]}>Equipment</Text>
              </View>
              <View style={styles.fieldRight}>
                <Text style={[{ color: appmode.txtcolor[mode][3] }]}>
                  {getDisplayValue('equipment_id')}
                </Text>
                <Ionicons name="chevron-down" size={16} color={appmode.txtcolor[mode][3]} />
              </View>
            </TouchableOpacity>

            {/* Shift */}
            <TouchableOpacity
              style={[styles.advancedField, { borderColor: appmode.boxlinecolor[mode][1] }]}
              onPress={() => setShowShiftPicker(true)}
            >
              <View style={styles.fieldLeft}>
                <Ionicons name="time-outline" size={16} color={appmode.txtcolor[mode][7]} />
                <Text style={[{ color: appmode.txtcolor[mode][1] }]}>Shift</Text>
              </View>
              <View style={styles.fieldRight}>
                <Text style={[{ color: appmode.txtcolor[mode][3] }]}>
                  {getDisplayValue('shift_id')}
                </Text>
                <Ionicons name="chevron-down" size={16} color={appmode.txtcolor[mode][3]} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { borderTopColor: appmode.boxlinecolor[mode][1] }]}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: appmode.boxlinecolor[mode][1] }]}
            onPress={handleClear}
          >
            <Ionicons name="refresh-outline" size={18} color={appmode.txtcolor[mode][3]} />
            <Text style={[styles.clearButtonText, { color: appmode.txtcolor[mode][3] }]}>
              Reset Filter
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: appmode.txtcolor[mode][7] }]}
            onPress={handleApply}
          >
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>
              Terapkan ({filter.filterCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker Modals */}
        <DatePickerModal
          visible={showStartDatePicker}
          selectedDate={filter.startdate}
          onSelect={(date) => handleFieldChange('startdate', date)}
          onClose={() => setShowStartDatePicker(false)}
        />
        
        <DatePickerModal
          visible={showEndDatePicker}
          selectedDate={filter.enddate}
          onSelect={(date) => handleFieldChange('enddate', date)}
          onClose={() => setShowEndDatePicker(false)}
        />

        {/* Bottom Sheet Pickers */}
        <BottomSheetPicker
          visible={showPenyewaPicker}
          title="Pilih Penyewa"
          data={safePenyewaData}
          onSelect={(item) => handleFieldChange('penyewa_id', item.id)}
          onClose={() => setShowPenyewaPicker(false)}
          displayKey="nama"
          searchKey="nama"
        />

        <BottomSheetPicker
          visible={showEquipmentPicker}
          title="Pilih Equipment"
          data={safeEquipmentData}
          onSelect={(item) => handleFieldChange('equipment_id', item.id)}
          onClose={() => setShowEquipmentPicker(false)}
          displayKey="kode"
          searchKey="kode"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.equipmentItem,
                {
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  borderColor: appmode.boxlinecolor[mode][1],
                },
              ]}
              onPress={() => {
                handleFieldChange('equipment_id', item.id);
                setShowEquipmentPicker(false);
              }}>
              {/* <View style={styles.equipmentInfo}> */}
              <View style={styles.equipmentInfo}>
                <Text style={[styles.equipmentName, { color: appmode.txtcolor[mode][1] }]}>
                  {item.kode || '-'}
                </Text>
                <Text style={[styles.equipmentCode, { color: appmode.txtcolor[mode][3] }]}>
                  {item.nama || '-'} • {item.kategori || '-'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={appmode.txtcolor[mode][2]} />
            </TouchableOpacity>
          )}
        />

        <BottomSheetPicker
          visible={showShiftPicker}
          title="Pilih Shift"
          data={safeShiftData}
          onSelect={(item) => handleFieldChange('shift_id', item.id)}
          onClose={() => setShowShiftPicker(false)}
          displayKey="nama"
          searchKey="nama"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  content: {
    maxHeight: '90%',
    minHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userInfoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  userSite: {
    fontSize: 13,
    fontFamily: 'Poppins-Light',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickFilterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Light',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  dateSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  advancedField: {
    // flex: 1,
    // flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  fieldValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    flex: 1,
    textAlign: 'right',
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  equipmentCode: {
    fontSize: 13,
    fontFamily: 'Poppins-Light',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
});

export default TimesheetFilter;