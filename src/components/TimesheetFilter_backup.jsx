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
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BottomSheetPicker from './BottomSheetPicker';
import DatePickerModal from './DatePickerModal';

const { width: screenWidth } = Dimensions.get('window');

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

  // Ensure data is arrays
  const safePenyewaData = Array.isArray(penyewaData) ? penyewaData : [];
  const safeEquipmentData = Array.isArray(equipmentData) ? equipmentData : [];
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
    { label: 'Draft', value: 'draft', icon: 'document-text-outline', color: '#9CA3AF' },
    { label: 'Submitted', value: 'submitted', icon: 'send-outline', color: '#3B82F6' },
    { label: 'Approved', value: 'approved', icon: 'checkmark-circle-outline', color: '#10B981' },
    { label: 'Rejected', value: 'rejected', icon: 'close-circle-outline', color: '#EF4444' },
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
    
    if (!value) return 'Pilih...';
    
    if (options) {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    
    if (field === 'penyewa_id') {
      const penyewa = safePenyewaData.find(p => p.id.toString() === value.toString());
      return penyewa ? penyewa.nama : 'Pilih...';
    }

    if (field === 'equipment_id') {
      const equipment = safeEquipmentData.find(e => e.id.toString() === value.toString());
      return equipment ? `${equipment.kode} - ${equipment.nama}` : 'Pilih...';
    }

    if (field === 'shift_id') {
      const shift = safeShiftData.find(s => s.id.toString() === value.toString());
      return shift ? shift.nama : 'Pilih...';
    }
    
    return value;
  };
  
  const getSelectedOption = (options, value) => {
    return options.find(opt => opt.value === value) || options[0];
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
          </View>
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
                <Text style={[styles.fieldLabel, { color: appmode.txtcolor[mode][1] }]}>Penyewa</Text>
              </View>
              <View style={styles.fieldRight}>
                <Text style={[styles.fieldValue, { color: appmode.txtcolor[mode][3] }]}>
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
                <Text style={[styles.fieldLabel, { color: appmode.txtcolor[mode][1] }]}>Equipment</Text>
              </View>
              <View style={styles.fieldRight}>
                <Text style={[styles.fieldValue, { color: appmode.txtcolor[mode][3] }]}>
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
                <Text style={[styles.fieldLabel, { color: appmode.txtcolor[mode][1] }]}>Shift</Text>
              </View>
              <View style={styles.fieldRight}>
                <Text style={[styles.fieldValue, { color: appmode.txtcolor[mode][3] }]}>
                  {getDisplayValue('shift_id')}
                </Text>
                <Ionicons name="chevron-down" size={16} color={appmode.txtcolor[mode][3]} />
              </View>
            </TouchableOpacity>
          </View>
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
                <Text style={[styles.fieldLabel, { color: appmode.txtcolor[mode][1] }]}>Penyewa</Text>
              </View>
              <View style={styles.fieldRight}>
                <Text style={[styles.fieldValue, { color: appmode.txtcolor[mode][3] }]}>
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
                <Text style={[styles.fieldLabel, { color: appmode.txtcolor[mode][1] }]}>Equipment</Text>
              </View>
              <View style={styles.fieldRight}>
                <Text style={[styles.fieldValue, { color: appmode.txtcolor[mode][3] }]}>
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
                <Text style={[styles.fieldLabel, { color: appmode.txtcolor[mode][1] }]}>Shift</Text>
              </View>
              <View style={styles.fieldRight}>
                <Text style={[styles.fieldValue, { color: appmode.txtcolor[mode][3] }]}>
                  {getDisplayValue('shift_id')}
                </Text>
                <Ionicons name="chevron-down" size={16} color={appmode.txtcolor[mode][3]} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Action Buttons */}
        <View style={[styles.footer, { borderTopColor: appmode.boxlinecolor[mode][1] }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton, { borderColor: appmode.boxlinecolor[mode][1] }]}
            onPress={() => {
              Alert.alert(
                'Clear Filter',
                'Apakah Anda yakin ingin menghapus semua filter?',
                [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Ya', onPress: handleClear }
                ]
              );
            }}
          >
            <Ionicons name="refresh-outline" size={16} color={appmode.txtcolor[mode][6]} />
            <Text style={[styles.actionButtonText, { color: appmode.txtcolor[mode][6] }]}>
              Reset
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.applyButton, { backgroundColor: appmode.txtcolor[mode][7] }]}
            onPress={handleApply}
          >
            <Ionicons name="checkmark-outline" size={16} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
              Terapkan {filter.filterCount > 0 && `(${filter.filterCount})`}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Pickers */}
      <BottomSheetPicker
        visible={showPenyewaPicker}
        title="Pilih Penyewa"
        data={[
          { label: 'Semua Penyewa', value: '' },
          ...safePenyewaData.map(p => ({ label: p.nama, value: p.id.toString() }))
        ]}
        selectedValue={filter.penyewa_id}
        onSelect={(value) => {
          handleFieldChange('penyewa_id', value);
          setShowPenyewaPicker(false);
        }}
        onClose={() => setShowPenyewaPicker(false)}
      />
      
      <BottomSheetPicker
        visible={showEquipmentPicker}
        title="Pilih Equipment"
        data={[
          { label: 'Semua Equipment', value: '' },
          ...safeEquipmentData.map(e => ({
            label: `${e.kode} - ${e.nama}`,
            value: e.id.toString()
          }))
        ]}
        selectedValue={filter.equipment_id}
        onSelect={(value) => {
          handleFieldChange('equipment_id', value);
          setShowEquipmentPicker(false);
        }}
        onClose={() => setShowEquipmentPicker(false)}
      />
      
      <BottomSheetPicker
        visible={showShiftPicker}
        title="Pilih Shift"
        data={[
          { label: 'Semua Shift', value: '' },
          ...safeShiftData.map(s => ({ label: s.nama, value: s.id.toString() }))
        ]}
        selectedValue={filter.shift_id}
        onSelect={(value) => {
          handleFieldChange('shift_id', value);
          setShowShiftPicker(false);
        }}
        onClose={() => setShowShiftPicker(false)}
      />
      
      <DatePickerModal
        visible={showStartDatePicker}
        selectedDate={filter.startdate}
        onSelect={(date) => {
          handleFieldChange('startdate', date);
          setShowStartDatePicker(false);
        }}
        onClose={() => setShowStartDatePicker(false)}
      />

      <DatePickerModal
        visible={showEndDatePicker}
        selectedDate={filter.enddate}
        onSelect={(date) => {
          handleFieldChange('enddate', date);
          setShowEndDatePicker(false);
        }}
        onClose={() => setShowEndDatePicker(false)}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    width: screenWidth * 0.95,
    maxHeight: '85%',
    flex: 1,
    flexDirection: 'column',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
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
    paddingBottom: 20,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // User Info Card
  userInfoCard: {
    margin: 20,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userSite: {
    fontSize: 14,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Quick Filters
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
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Date Range
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
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    minWidth: '45%',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Status Grid
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Advanced Fields
  advancedField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13,
    maxWidth: 150,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  clearButton: {
    borderWidth: 1,
  },
  applyButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TimesheetFilter;