import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FieldArray, Formik, useFormikContext } from 'formik';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AppHeader from '@/src/components/AppHeader';
import AppScreen from '@/src/components/AppScreen';
import BottomSheetPicker from '@/src/components/BottomSheetPicker';
import BtnActionSheet from '@/src/components/BtnActionSheet';
import DatePickerModal from '@/src/components/DatePickerModal';
import InputBox from '@/src/components/InputBox';
import InputNumeric from '@/src/components/InputNumeric';
import InputTeksNarasi from '@/src/components/InputTeksNarasi';
import TimePickerModal from '@/src/components/TimePickerModal';

import appmode from '@/src/helpers/ThemesMode';
import { getEquipment } from '@/src/redux/equipmentSlice';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { getKegiatan, getKegiatanOffline, selectKegiatanByEquipmentCategory } from '@/src/redux/kegiatanSlice';
import { getLokasi, getLokasiOffline } from '@/src/redux/lokasiSlice';
import { getLongshift } from '@/src/redux/longshiftSlice';
import { getMaterial, getMaterialOffline } from '@/src/redux/materialSlice';
import { getPenyewa } from '@/src/redux/penyewaSlice';
import { getShift } from '@/src/redux/shiftSlice';
import {
  clearAllValidationErrors,
  initTimesheet,
  setTimesheet,
  submitTimesheet
} from '@/src/redux/timesheetItemSlice';
import { timesheetValidationSchema } from './validation';

function FormikReduxSync() {
  const { values } = useFormikContext();
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setTimesheet(values));
  }, [values, dispatch]);
  return null;
}

const kategoriOptions = [
  { id: 'barging', nama: 'Barging' },
  { id: 'mining', nama: 'Mining' },
  { id: 'rental', nama: 'Rental' },
];

export default function CreateTimesheetPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';
  const { form, submitting, validationErrors } = useAppSelector(state => state.timesheetItem);
  const { employee } = useAppSelector(state => state.auth);
  const { data: penyewaList, loading: penyewaLoading } = useAppSelector(state => state.penyewa);
  const { data: equipmentList, loading: equipmentLoading } = useAppSelector(state => state.equipment);
  const { data: shiftList, loading: shiftLoading } = useAppSelector(state => state.shift);
  const { data: longshiftList, loading: longshiftLoading } = useAppSelector(state => state.longshift);
  const { data: kegiatanList, loading: kegiatanLoading } = useAppSelector(state => state.kegiatan);
  const { data: lokasiList, loading: lokasiLoading } = useAppSelector(state => state.lokasi);
  const { data: materialList, loading: materialLoading } = useAppSelector(state => state.material);

  const isAnyDataLoading = penyewaLoading || equipmentLoading || shiftLoading || longshiftLoading || kegiatanLoading || lokasiLoading || materialLoading;


  // Modal state
  const [isSubmitting, setSubmitting] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [localValidationErrors, setLocalValidationErrors] = useState({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPicker, setShowPicker] = useState({
    penyewa: false,
    equipment: false,
    shift: false,
    longshift: false,
    activity: false,
  });

  const [kegiatanPicker, setKegiatanPicker] = useState({
    visible: false,
    kegiatanId: '',
    type: 'kegiatan',
    source: 'offline',
  });

  const [offlineKegiatan, setOfflineKegiatan] = useState([]);
  const [offlineMaterial, setOfflineMaterial] = useState([]);
  const [offlineLokasi, setOfflineLokasi] = useState([]);

  const [showTimePicker, setShowTimePicker] = useState({
    visible: false,
    kegiatanId: '',
    type: 'starttime',
  });

  const formatFieldName = (field) => {
    if (field.includes('kegiatan')) {
      const match = field.match(/kegiatan\[(\d+)\]\.(.+)/);
      if (match) {
        const idx = parseInt(match[1]) + 1;
        const subField = match[2];
        const fieldMap = {
          'kegiatan_id': 'Jenis Kegiatan',
          'material_id': 'Material',
          'lokasi_asal_id': 'Lokasi Asal',
          'lokasi_tujuan_id': 'Lokasi Tujuan',
          'starttime': 'Waktu Mulai',
          'endtime': 'Waktu Selesai',
          'ritase': 'Jumlah Ritase',
          'smustart': 'HM/KM Start',
          'smufinish': 'HM/KM Finish',
        };
        return `Kegiatan ${idx} - ${fieldMap[subField] || subField}`;
      }
    }
    
    const fieldMap = {
      'tanggal': 'Tanggal',
      'activity': 'Activity',
      'penyewa_id': 'Nama Penyewa',
      'equipment_id': 'Equipment',
      'shift_id': 'Shift',
      'smustart': 'SMU Start',
      'smufinish': 'SMU Finish',
      'bbm': 'Refuel BBM',
    };
    return fieldMap[field] || field;
  };

  const loadMasterData = async () => {
    const networkService = (await import('@/src/services/NetworkService')).default;
    const isOnline = await networkService.checkConnection();

    const SQLiteService = (await import('@/src/database/SQLiteService')).default;
    const [kg, mt, lk] = await Promise.all([
      SQLiteService.getKegiatan(),
      SQLiteService.getMaterial(),
      SQLiteService.getLokasi(),
    ]);
    
    setOfflineKegiatan(kg || []);
    setOfflineMaterial(mt || []);
    setOfflineLokasi(lk || []);

    dispatch(getKegiatanOffline());
    dispatch(getMaterialOffline());
    dispatch(getLokasiOffline());

    dispatch(getPenyewa());
    dispatch(getEquipment());
    dispatch(getShift());
    dispatch(getLongshift());

    if (isOnline) {
      dispatch(getKegiatan());
      dispatch(getLokasi());
      dispatch(getMaterial());
    }
  };

  useEffect(() => {
    dispatch(initTimesheet());
    loadMasterData();
    
    return () => {
      dispatch(clearAllValidationErrors());
    };
  }, []);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Set employee and cabang data when employee is available
    // Only run once when employee is first loaded
    if (employee?.id && !isInitializedRef.current) {
      const initialData = {
        tanggal: new Date().toISOString().split('T')[0],
        operator_id: employee.id.toString(),
        operator_nama: employee.nama || '',
        karyawan_id: employee.id.toString(),
        karyawan: employee,
        cabang_id: employee.cabang?.id?.toString() || '',
        cabang_nama: employee.cabang?.nama || '',
        cabang: employee.cabang || null,
        activity: '',
        overtime: 'ls0',
        penyewa_id: '',
        penyewa_nama: '',
        penyewa: null,
        equipment_id: '',
        equipment_nama: '',
        equipment_kategori: '',
        equipment: null,
        shift_id: '',
        shift_nama: '',
        shift: null,
        longshift_id: 0,
        longshift_nama: '',
        smustart: 0,
        smufinish: 0,
        usedsmu: 0,
        bbm: 0,
        equipment_tool: 'Bucket',
        keterangan: '',
        photo: '',
        foto: [],
        kegiatan: [{
          id: `temp_${Date.now()}`,
          kegiatan_id: '', 
          kegiatan_nama: '',
          material_id: '', 
          material_nama: '',
          lokasi_asal_id: '', 
          lokasi_asal_nama: '',
          lokasi_tujuan_id: '', 
          lokasi_tujuan_nama: '',
          starttime: '', 
          endtime: '', 
          smustart: 0, 
          smufinish: 0,
          ritase: 0, 
          seq: 1
        }],
      };
      
      dispatch(setTimesheet(initialData));
      isInitializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee?.id]);

  const handleFormSubmit = async (values, { setSubmitting, validateForm, setFieldTouched }) => {
    try {
      // Touch all fields to show validation errors
      const allFields = [
        'tanggal', 'kategori', 'penyewa_id', 'equipment_id', 'shift_id',
        'smustart', 'smufinish', 'bbm'
      ];
      
      allFields.forEach(field => {
        setFieldTouched(field, true);
      });

      // Touch kegiatan fields
      values.kegiatan.forEach((_, index) => {
        setFieldTouched(`kegiatan[${index}].kegiatan_id`, true);
        setFieldTouched(`kegiatan[${index}].lokasi_asal_id`, true);
        setFieldTouched(`kegiatan[${index}].starttime`, true);
        setFieldTouched(`kegiatan[${index}].endtime`, true);
        setFieldTouched(`kegiatan[${index}].ritase`, true);
      });

      // Validate form before submission
      const errors = await validateForm();
      
      // If there are validation errors, show modal
      if (Object.keys(errors).length > 0) {
        setLocalValidationErrors(errors);
        setShowValidationError(true);
        return;
      }

      // If no errors, proceed with submission
      const result = await dispatch(submitTimesheet(values));
      
      if (result.meta.requestStatus === 'fulfilled') {
        Alert.alert('Berhasil', 'TimeSheet berhasil disimpan', [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]);
      } else {
        const errorMessage = result.payload || 'Gagal menyimpan TimeSheet';
        Alert.alert('Error', errorMessage);
      }

    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan TimeSheet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik 
      initialValues={form} 
      onSubmit={handleFormSubmit} 
      validationSchema={timesheetValidationSchema} 
      enableReinitialize 
      validateOnChange={true} 
      validateOnBlur={true}
    >
      {({ 
        handleSubmit: formikHandleSubmit, 
        values, 
        setFieldValue, 
        setFieldTouched,
        errors, 
        touched, 
        validateForm 
      }) => {
        console.log('VALUES---', values);
        console.log('ERRORS---', errors);
        
        return (
          <AppScreen>
            <FormikReduxSync />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoid}
            >
              <AppHeader
                title="Buat TimeSheet"
                prevPage={true}
                onChangeThemes={true}
                rightComponent={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isAnyDataLoading && (
                      <View style={{ marginRight: 8 }}>
                        <Ionicons name="sync" size={20} color={appmode.txtcolor[mode][7]} />
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        loadMasterData();
                      }}
                      style={{ padding: 8 }}
                    >
                      <Ionicons name="refresh" size={24} color={appmode.txtcolor[mode][7]} />
                    </TouchableOpacity>
                  </View>
                }
              />
              
              <>
                <ScrollView
                  style={[
                    styles.container,
                    { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' },
                  ]}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled">

                  {/* Employee Info Header */}
                  <View style={[styles.employeeHeader, { backgroundColor: isDark ? '#374151' : '#FFFFFF' }]}>
                    <View style={styles.employeeLeft}>
                      <Text style={[styles.employeeName, { color: appmode.txtcolor[mode][7] }]}>
                        {employee?.nama || 'Operator'}
                      </Text>
                      <Text style={[styles.employeeSection, { color: appmode.txtcolor[mode][7] }]}>
                        {employee?.section || ''}
                      </Text>
                    </View>
                    <View style={styles.employeeRight}>
                      <Text style={[styles.employeeBisnis, { color: appmode.txtcolor[mode][7] }]}>
                        {employee?.bisnis?.initial || ''}
                      </Text>
                      <Text style={[styles.employeeCabang, { color: appmode.txtcolor[mode][7] }]}>
                        {employee?.cabang?.nama || ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.content}>
                    {/* Row: Tanggal & Kategori */}
                    <View style={styles.row}>
                      <InputBox
                        label="Tanggal :"
                        value={values.tanggal ? moment(values.tanggal).format('DD MMM YYYY') : '-'}
                        onPress={() => setShowDatePicker(true)}
                        error={touched.tanggal && errors.tanggal}
                        flex={1}
                      />
                      <View style={{ width: 8 }} />
                      <InputBox
                        label="Kategori :"
                        value={values.activity || '-'}
                        onPress={() => setShowPicker({ ...showPicker, activity: true })}
                        error={touched.activity && errors.activity}
                        flex={1}
                      />
                    </View>

                    {/* Cabang (Read-only) */}
                    <View style={styles.inputSpacing}>
                      <InputBox
                        label="Nama Cabang :"
                        value={values.cabang_nama || employee?.cabang?.nama || '-'}
                        disabled
                      />
                    </View>

                    {/* Penyewa */}
                    <View style={styles.inputSpacing}>
                      <InputBox
                        label="Nama Penyewa :"
                        value={values.penyewa_nama || '-'}
                        onPress={() => setShowPicker({ ...showPicker, penyewa: true })}
                        error={touched.penyewa_id && errors.penyewa_id}
                      />
                    </View>

                    {/* Row: Equipment & Shift */}
                    <View style={styles.row}>
                      <InputBox
                        label="Equipment :"
                        value={values.equipment_nama || '-'}
                        onPress={() => setShowPicker({ ...showPicker, equipment: true })}
                        error={touched.equipment_id && errors.equipment_id}
                        flex={1}
                      />
                      <View style={{ width: 8 }} />
                      <InputBox
                        label="Shift :"
                        value={values.shift_nama || '-'}
                        onPress={() => setShowPicker({ ...showPicker, shift: true })}
                        error={touched.shift_id && errors.shift_id}
                        flex={1}
                      />
                    </View>

                    {/* Longshift */}
                    <View style={styles.inputSpacing}>
                      <InputBox
                        label="Longshift :"
                        value={values.longshift_nama || '-'}
                        onPress={() => setShowPicker({ ...showPicker, longshift: true })}
                      />
                    </View>

                    {/* Row: SMU Start & Finish */}
                    <View style={styles.row}>
                      <InputNumeric
                        label="SMU Start :"
                        value={values.smustart}
                        onChangeText={(text) => {
                          const value = parseFloat(text) || 0;
                          setFieldValue('smustart', value);
                          setFieldTouched('smustart', true);
                          const usedSmu = (values.smufinish || 0) - value;
                          setFieldValue('usedsmu', usedSmu);
                        }}
                        error={touched.smustart && errors.smustart}
                        flex={1}
                        placeholder="0"
                      />
                      <View style={{ width: 8 }} />
                      <InputNumeric
                        label="SMU Finish :"
                        value={values.smufinish}
                        onChangeText={(text) => {
                          const value = parseFloat(text) || 0;
                          setFieldValue('smufinish', value);
                          setFieldTouched('smufinish', true);
                          const usedSmu = value - (values.smustart || 0);
                          setFieldValue('usedsmu', usedSmu);
                        }}
                        error={touched.smufinish && errors.smufinish}
                        flex={1}
                        placeholder="0"
                      />
                    </View>

                    {/* Row: Used SMU & BBM */}
                    <View style={styles.row}>
                      <InputNumeric
                        label="Used SMU :"
                        value={values.usedsmu}
                        onChangeText={() => { }}
                        disabled
                        flex={1}
                        placeholder="0"
                      />
                      <View style={{ width: 8 }} />
                      <InputNumeric
                        label="Refuel BBM (Liter) :"
                        value={values.bbm}
                        onChangeText={(text) => {
                          const value = parseFloat(text) || 0;
                          setFieldValue('bbm', value);
                          setFieldTouched('bbm', true);
                        }}
                        error={touched.bbm && errors.bbm}
                        flex={1}
                        placeholder="0"
                      />
                    </View>

                    {/* Equipment Tool */}
                    <View style={styles.inputSpacing}>
                      <InputBox
                        label="Equipment Tool :"
                        value={values.equipment_tool || 'Bucket'}
                        onPress={() => {
                          // TODO: Show tool picker
                        }}
                      />
                    </View>

                    {/* Kegiatan Section */}
                    <FieldArray name="kegiatan">
                      {({ push, remove }) => (
                        <View style={styles.kegiatanSection}>
                          {values.kegiatan.map((item, index) => (
                            <View
                              key={item.id}
                              style={[
                                styles.kegiatanItem,
                                {
                                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                                  borderColor: appmode.boxlinecolor[mode][1],
                                },
                              ]}>
                              <View style={styles.kegiatanHeader}>
                                <Text
                                  style={[
                                    styles.kegiatanTitle,
                                    { color: appmode.txtcolor[mode][1] },
                                  ]}>
                                  Kegiatan #{index + 1}
                                </Text>
                                {values.kegiatan.length > 1 && (
                                  <TouchableOpacity onPress={() => remove(index)}>
                                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                                  </TouchableOpacity>
                                )}
                              </View>

                              <View style={styles.kegiatanContent}>
                                <View style={styles.inputSpacing}>
                                  <InputBox
                                    label="Jenis Kegiatan :"
                                    value={item.kegiatan_nama || '-'}
                                    onPress={() => {
                                      setKegiatanPicker((prev) => ({
                                        visible: true,
                                        kegiatanId: item.id,
                                        type: 'kegiatan',
                                        source: prev.source,
                                      }));
                                    }}
                                    error={touched.kegiatan?.[index]?.kegiatan_id && errors.kegiatan?.[index]?.kegiatan_id}
                                  />
                                </View>

                                <View style={styles.inputSpacing}>
                                  <InputBox
                                    label="Material :"
                                    value={item.material_nama || '-'}
                                    onPress={() => {
                                      setKegiatanPicker((prev) => ({
                                        visible: true,
                                        kegiatanId: item.id,
                                        type: 'material',
                                        source: prev.source,
                                      }));
                                    }}
                                    error={touched.kegiatan?.[index]?.material_id && errors.kegiatan?.[index]?.material_id}
                                  />
                                </View>

                                <View style={styles.inputSpacing}>
                                  <InputBox
                                    label="Lokasi Asal :"
                                    value={item.lokasi_asal_nama || '-'}
                                    onPress={() => {
                                      setKegiatanPicker((prev) => ({
                                        visible: true,
                                        kegiatanId: item.id,
                                        type: 'lokasi_asal',
                                        source: prev.source,
                                      }));
                                    }}
                                    error={touched.kegiatan?.[index]?.lokasi_asal_id && errors.kegiatan?.[index]?.lokasi_asal_id}
                                  />
                                </View>

                                <View style={styles.inputSpacing}>
                                  <InputBox
                                    label="Lokasi Tujuan :"
                                    value={item.lokasi_tujuan_nama || '-'}
                                    onPress={() => {
                                      setKegiatanPicker((prev) => ({
                                        visible: true,
                                        kegiatanId: item.id,
                                        type: 'lokasi_tujuan',
                                        source: prev.source,
                                      }));
                                    }}
                                    error={touched.kegiatan?.[index]?.lokasi_tujuan_id && errors.kegiatan?.[index]?.lokasi_tujuan_id}
                                  />
                                </View>

                                <View style={styles.timeRow}>
                                  <View style={styles.timeInputContainer}>
                                    <InputBox
                                      label="Waktu Mulai :"
                                      value={item.starttime ? moment(item.starttime, 'YYYY-MM-DD HH:mm').format('HH:mm') : '-'}
                                      onPress={() => {
                                        setShowTimePicker({ visible: true, kegiatanId: item.id, type: 'starttime' });
                                      }}
                                      error={touched.kegiatan?.[index]?.starttime && errors.kegiatan?.[index]?.starttime}
                                      flex={1}
                                    />
                                  </View>
                                  <View style={styles.timeSeparatorContainer}>
                                    <Text style={[styles.timeSeparator, { color: appmode.txtcolor[mode][1] }]}>s/d</Text>
                                  </View>
                                  <View style={styles.timeInputContainer}>
                                    <InputBox
                                      label="Waktu Selesai :"
                                      value={item.endtime ? moment(item.endtime, 'YYYY-MM-DD HH:mm').format('HH:mm') : '-'}
                                      onPress={() => {
                                        setShowTimePicker({ visible: true, kegiatanId: item.id, type: 'endtime' });
                                      }}
                                      error={touched.kegiatan?.[index]?.endtime && errors.kegiatan?.[index]?.endtime}
                                      flex={1}
                                    />
                                  </View>
                                </View>

                                <View style={styles.row}>
                                  <InputNumeric
                                    label="HM/KM Start :"
                                    value={item.smustart || 0}
                                    onChangeText={(text) => {
                                      const value = parseFloat(text) || 0;
                                      const next = [...values.kegiatan];
                                      next[index] = { ...item, smustart: value };
                                      setFieldValue('kegiatan', next);
                                      setFieldTouched(`kegiatan[${index}].smustart`, true);
                                    }}
                                    error={touched.kegiatan?.[index]?.smustart && errors.kegiatan?.[index]?.smustart}
                                    flex={1}
                                    placeholder="0"
                                  />
                                  <View style={{ width: 8 }} />
                                  <InputNumeric
                                    label="HM/KM Finish :"
                                    value={item.smufinish || 0}
                                    onChangeText={(text) => {
                                      const value = parseFloat(text) || 0;
                                      const next = [...values.kegiatan];
                                      next[index] = { ...item, smufinish: value };
                                      setFieldValue('kegiatan', next);
                                      setFieldTouched(`kegiatan[${index}].smufinish`, true);
                                    }}
                                    error={touched.kegiatan?.[index]?.smufinish && errors.kegiatan?.[index]?.smufinish}
                                    flex={1}
                                    placeholder="0"
                                  />
                                </View>

                                <View style={styles.inputSpacing}>
                                  <InputNumeric
                                    label="Jumlah Ritase :"
                                    value={item.ritase}
                                    onChangeText={(text) => {
                                      const value = parseFloat(text) || 0;
                                      const next = [...values.kegiatan];
                                      next[index] = { ...item, ritase: value };
                                      setFieldValue('kegiatan', next);
                                      setFieldTouched(`kegiatan[${index}].ritase`, true);
                                    }}
                                    error={touched.kegiatan?.[index]?.ritase && errors.kegiatan?.[index]?.ritase}
                                    placeholder="0"
                                  />
                                </View>
                              </View>
                            </View>
                          ))}

                          <TouchableOpacity
                            style={[
                              styles.addButton,
                              { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: appmode.txtcolor[mode][7] },
                            ]}
                            onPress={() => push({
                              id: `temp_${Date.now()}_${Math.random()}`,
                              kegiatan_id: '', kegiatan_nama: '',
                              material_id: '', material_nama: '',
                              lokasi_asal_id: '', lokasi_asal_nama: '',
                              lokasi_tujuan_id: '', lokasi_tujuan_nama: '',
                              starttime: '',
                              endtime: '',
                              smustart: values.smustart, smufinish: values.smufinish,
                              ritase: 0, seq: values.kegiatan.length + 1
                            })}>
                            <Ionicons name="add-circle" size={24} color={appmode.txtcolor[mode][7]} />
                            <Text style={[styles.addButtonText, { color: appmode.txtcolor[mode][7] }]}> Tambah Kegiatan</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </FieldArray>

                    {/* Keterangan */}
                    <View style={styles.inputSpacing}>
                      <InputTeksNarasi
                        label="Keterangan"
                        value={values.keterangan || ''}
                        onChangeText={(text) => {
                          setFieldValue('keterangan', text);
                        }}
                        placeholder="Tulis keterangan tambahan (opsional)..."
                      />
                    </View>

                    {/* Photo Upload Placeholder */}
                    <View style={[styles.inputSpacing, {marginBottom: 80}]}>
                      <InputBox
                        label="Foto :"
                        value={values.foto && values.foto.length > 0 ? `${values.foto.length} foto` : 'Belum ada foto'}
                        onPress={() => {
                          // TODO: Show image picker
                          Alert.alert('Info', 'Fitur upload foto akan segera tersedia');
                        }}
                      />
                    </View>
                  </View>
                </ScrollView>

                {/* Sticky Submit Button */}
                <View style={[styles.stickyButton, { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' }]}>
                  <BtnActionSheet
                    title={submitting ? "Menyimpan..." : "Simpan TimeSheet"}
                    onPress={formikHandleSubmit}
                    type="primary"
                    disabled={submitting}
                  />
                </View>
              </>

              {/* Bottom Sheet Pickers */}
              <BottomSheetPicker
                visible={showPicker.penyewa}
                title="Pilih Penyewa"
                data={penyewaList || []}
                onSelect={(item) => {
                  setFieldValue('penyewa_id', item.id.toString());
                  setFieldValue('penyewa_nama', item.nama);
                  setFieldValue('penyewa', item);
                  setFieldTouched('penyewa_id', true);
                }}
                onClose={() => setShowPicker({ ...showPicker, penyewa: false })}
                displayKey="nama"
                searchKey="nama"
              />

              <BottomSheetPicker
                visible={showPicker.equipment}
                title="Pilih Equipment"
                data={equipmentList || []}
                onSelect={(item) => {
                  setFieldValue('equipment_id', item.id.toString());
                  setFieldValue('equipment_nama', item.kode);
                  setFieldValue('equipment_kategori', item.kategori);
                  setFieldValue('equipment', item);
                  setFieldTouched('equipment_id', true);
                }}
                onClose={() => setShowPicker({ ...showPicker, equipment: false })}
                displayKey="kode"
                searchKey="kode"
              />

              <BottomSheetPicker
                visible={showPicker.shift}
                title="Pilih Shift"
                data={shiftList || []}
                onSelect={(item) => {
                  setFieldValue('shift_id', item.id.toString());
                  setFieldValue('shift_nama', item.nama);
                  setFieldValue('shift', item);
                  setFieldTouched('shift_id', true);
                }}
                onClose={() => setShowPicker({ ...showPicker, shift: false })}
                displayKey="nama"
                searchKey="nama"
              />

              <BottomSheetPicker
                visible={showPicker.longshift}
                title="Pilih Longshift"
                data={longshiftList || []}
                onSelect={(item) => {
                  setFieldValue('longshift_id', item.id);
                  setFieldValue('longshift_nama', item.nama);
                  setFieldValue('overtime', item.kode || 'ls0');
                }}
                onClose={() => setShowPicker({ ...showPicker, longshift: false })}
                displayKey="nama"
                searchKey="nama"
              />

              <BottomSheetPicker
                visible={kegiatanPicker.visible}
                title={
                  kegiatanPicker.type === 'kegiatan'
                    ? 'Pilih Jenis Kegiatan'
                    : kegiatanPicker.type === 'material'
                      ? 'Pilih Material'
                      : kegiatanPicker.type === 'lokasi_asal'
                        ? 'Pilih Lokasi Asal'
                        : 'Pilih Lokasi Tujuan'
                }
                data={(() => {
                  if (kegiatanPicker.type === 'kegiatan') {
                    return selectKegiatanByEquipmentCategory(
                      { kegiatan: { data: kegiatanPicker.source === 'online' ? (kegiatanList || []) : (offlineKegiatan || []) } },
                      values.equipment_kategori
                    );
                  } else if (kegiatanPicker.type === 'material') {
                    return kegiatanPicker.source === 'online' ? (materialList || []) : (offlineMaterial || []);
                  } else {
                    let lokasiData = kegiatanPicker.source === 'online' ? (lokasiList || []) : (offlineLokasi || []);
                    return lokasiData;
                  }
                })()}
                enableSourceSwitch={true}
                sourceMode={kegiatanPicker.source}
                onChangeSource={async (mode) => {
                  setKegiatanPicker((prev) => ({ ...prev, source: mode }));
                  if (mode === 'offline') {
                    const SQLiteService = (await import('@/src/database/SQLiteService')).default;
                    const [kg, mt, lk] = await Promise.all([
                      SQLiteService.getKegiatan(),
                      SQLiteService.getMaterial(),
                      SQLiteService.getLokasi(),
                    ]);
                    setOfflineKegiatan(kg || []);
                    setOfflineMaterial(mt || []);
                    setOfflineLokasi(lk || []);
                  } else {
                    dispatch(getKegiatan());
                    dispatch(getMaterial());
                    dispatch(getLokasi());
                  }
                }}
                onSelect={(item) => {
                  const idx = values.kegiatan.findIndex(k => k.id === kegiatanPicker.kegiatanId);
                  if (idx !== -1) {
                    const updated = { ...values.kegiatan[idx] };
                    if (kegiatanPicker.type === 'kegiatan') {
                      updated.kegiatan_id = item.id.toString();
                      updated.kegiatan_nama = item.nama;
                      updated.activity = item.nama;
                      setFieldTouched(`kegiatan[${idx}].kegiatan_id`, true);
                    } else if (kegiatanPicker.type === 'material') {
                      updated.material_id = item.id.toString();
                      updated.material_nama = item.nama;
                    } else if (kegiatanPicker.type === 'lokasi_asal') {
                      updated.lokasi_asal_id = item.id.toString();
                      updated.lokasi_asal_nama = item.nama;
                      setFieldTouched(`kegiatan[${idx}].lokasi_asal_id`, true);
                    } else {
                      updated.lokasi_tujuan_id = item.id.toString();
                      updated.lokasi_tujuan_nama = item.nama;
                    }
                    const next = [...values.kegiatan];
                    next[idx] = updated;
                    setFieldValue('kegiatan', next);
                  }
                }}
                onClose={() => setKegiatanPicker({ visible: false, kegiatanId: '', type: 'kegiatan', source: kegiatanPicker.source })}
                displayKey="nama"
                searchKey="nama"
              />

              <BottomSheetPicker
                visible={showPicker.activity}
                title="Pilih Kategori"
                data={kategoriOptions}
                onSelect={(item) => {
                  setFieldValue('activity', item.id);
                  setFieldTouched('activity', true);
                }}
                onClose={() => setShowPicker({ ...showPicker, activity: false })}
                displayKey="nama"
                searchKey="nama"
              />

              <DatePickerModal
                visible={showDatePicker}
                selectedDate={values.tanggal}
                onSelect={(date) => {
                  setFieldValue('tanggal', date);
                  setFieldTouched('tanggal', true);
                }}
                onClose={() => setShowDatePicker(false)}
              />

              <TimePickerModal
                visible={showTimePicker.visible}
                selectedTime={
                  values.kegiatan.find(k => k.id === showTimePicker.kegiatanId)?.[showTimePicker.type] || ''
                }
                title={showTimePicker.type === 'starttime' ? 'Waktu Mulai' : 'Waktu Selesai'}
                showDateSelector={true}
                timesheetDate={values.tanggal}
                onSelect={(time) => {
                  const kegiatan = values.kegiatan.find(k => k.id === showTimePicker.kegiatanId);
                  if (kegiatan) {
                    const idx = values.kegiatan.findIndex(k => k.id === showTimePicker.kegiatanId);
                    const next = [...values.kegiatan];
                    // Format: "YYYY-MM-DD HH:mm"
                    const formattedTime = moment(time).format('YYYY-MM-DD HH:mm');
                    next[idx] = { ...kegiatan, [showTimePicker.type]: formattedTime };
                    setFieldValue('kegiatan', next);
                    setFieldTouched(`kegiatan[${idx}].${showTimePicker.type}`, true);
                  }
                }}
                onClose={() => setShowTimePicker({ visible: false, kegiatanId: '', type: 'starttime' })}
              />

              {/* Validation Error Modal */}
              <Modal
                visible={showValidationError}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowValidationError(false)}>
                
                <View style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                }}>
                  <View style={{
                    backgroundColor: isDark ? '#374151' : '#FFFFFF',
                    borderRadius: 12,
                    padding: 20,
                    width: '100%',
                    maxWidth: 400,
                    maxHeight: '70%',
                  }}>
                    {/* Header */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: isDark ? '#F9FAFB' : '#111827',
                        fontFamily: 'Poppins-Medium',
                        marginBottom: 4,
                      }}>
                        Validasi Error
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        fontFamily: 'Poppins-Light',
                      }}>
                        Mohon lengkapi data yang diperlukan
                      </Text>
                    </View>

                    {/* Error List */}
                    <ScrollView style={{ maxHeight: 300, marginBottom: 16 }}>
                      {Object.entries(localValidationErrors).map(([field, error], index) => (
                        <View key={index} style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          backgroundColor: isDark ? '#1F2937' : '#FEF2F2',
                          borderRadius: 6,
                          borderLeftWidth: 3,
                          borderLeftColor: '#ef4444',
                        }}>
                          <Ionicons 
                            name="alert-circle" 
                            size={16} 
                            color="#ef4444" 
                            style={{ marginRight: 8, marginTop: 2 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontSize: 12,
                              color: isDark ? '#9CA3AF' : '#6B7280',
                              fontFamily: 'Poppins-Light',
                              marginBottom: 2,
                            }}>
                              {formatFieldName(field)}
                            </Text>
                            <Text style={{
                              fontSize: 13,
                              color: isDark ? '#F9FAFB' : '#111827',
                              fontFamily: 'Poppins-Medium',
                            }}>
                              {typeof error === 'string' ? error : JSON.stringify(error)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>

                    {/* Close Button */}
                    <TouchableOpacity
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: '#ef4444',
                        alignItems: 'center',
                      }}
                      onPress={() => setShowValidationError(false)}>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#FFFFFF',
                        fontFamily: 'Poppins-Medium',
                      }}>
                        Tutup
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

            </KeyboardAvoidingView>
          </AppScreen>
        )
      }}
    </Formik>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  employeeLeft: {
    flex: 1,
  },
  employeeName: {
    fontSize: 22,
    fontFamily: 'Poppins-Medium',
    fontWeight: '700',
  },
  employeeSection: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
  },
  employeeRight: {
    alignItems: 'flex-end',
  },
  employeeBisnis: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    textAlign: 'right',
  },
  employeeCabang: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    textAlign: 'right',
  },
  content: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeSeparatorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  timeSeparator: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  inputSpacing: {
    marginBottom: 20,
  },
  kegiatanSection: {
    marginVertical: 20,
  },
  kegiatanItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  kegiatanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kegiatanTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  kegiatanContent: {
    // Nested content in kegiatan card
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  stickyButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});