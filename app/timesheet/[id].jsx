import AppHeader from '@/src/components/AppHeader';
import AppScreen from '@/src/components/AppScreen';
import BottomSheetPicker from '@/src/components/BottomSheetPicker';
import DatePickerModal from '@/src/components/DatePickerModal';
import InputBox from '@/src/components/InputBox';
import InputNumeric from '@/src/components/InputNumeric';
import InputTeksNarasi from '@/src/components/InputTeksNarasi';
import TimePickerModal from '@/src/components/TimePickerModal';
import ApiFetch from '@/src/helpers/ApiFetch';
import appmode from '@/src/helpers/ThemesMode';
import { URIPATH } from '@/src/helpers/UriPath';
import { getEquipment } from '@/src/redux/equipmentSlice';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { getKegiatan } from '@/src/redux/kegiatanSlice';
import { getLokasi } from '@/src/redux/lokasiSlice';
import { getMaterial } from '@/src/redux/materialSlice';
import { getPenyewa } from '@/src/redux/penyewaSlice';
import { getShift } from '@/src/redux/shiftSlice';
import {
  addKegiatan,
  removeKegiatan,
  setTimesheet,
  updateField,
  updateKegiatan
} from '@/src/redux/timesheetItemSlice';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import moment from 'moment';
import 'moment/locale/id';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImageView from 'react-native-image-viewing';

export default function DetailTimesheetPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { initialData } = useLocalSearchParams();
  
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';

  const { loading } = useAppSelector(state => state.timesheet);
  const { form, submitting } = useAppSelector(state => state.timesheetItem);
  const { employee } = useAppSelector(state => state.auth);
  const { data: penyewaList } = useAppSelector(state => state.penyewa);
  const { data: equipmentList } = useAppSelector(state => state.equipment);
  const { data: shiftList } = useAppSelector(state => state.shift);
  const { data: kegiatanList } = useAppSelector(state => state.kegiatan);
  const { data: lokasiList } = useAppSelector(state => state.lokasi);
  const { data: materialList } = useAppSelector(state => state.material);

  const [isEditing, setIsEditing] = useState(false);
  const [timesheet, setTimesheetData] = useState(null);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPicker, setShowPicker] = useState({
    penyewa: false,
    equipment: false,
    shift: false,
    kategori: false,
  });
  
  const [kegiatanPicker, setKegiatanPicker] = useState({
    visible: false,
    kegiatanId: '',
    type: 'kegiatan',
  });
  
  const [showTimePicker, setShowTimePicker] = useState({
    visible: false,
    kegiatanId: '',
    type: 'starttime',
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  const kategoriOptions = [
    { id: 'barging', nama: 'Barging' },
    { id: 'mining', nama: 'Mining' },
    { id: 'rental', nama: 'Rental' },
  ];

  // console.log('FORM_______', form);
  

  // Parse and dispatch initial data if available
  useEffect(() => {
    if (initialData && !hasInitialData) {
      try {
        const params = JSON.parse(initialData);
        
        // Dispatch to Redux store
        dispatch(setTimesheet(params));
        setTimesheetData(params);
        
        // Initialize photos from existing data
        console.log('📸 Initial photo data:', {
          photo: params.photo,
          foto: params.foto
        });
        
        // Handle photo - bisa berupa string URL atau array
        if (params.photo) {
          if (typeof params.photo === 'string') {
            // Photo adalah string URL
            console.log('📸 Photo is string URL:', params.photo);
            setUploadedPhotos([{ uri: params.photo }]);
          } else if (Array.isArray(params.photo)) {
            // Photo adalah array
            const normalizedPhotos = params.photo.map(photo => {
              if (typeof photo === 'string') {
                return { uri: photo.startsWith('http') ? photo : `${URIPATH.apiphoto}${photo}` };
              } else if (photo.url) {
                return { uri: photo.url.startsWith('http') ? photo.url : `${URIPATH.apiphoto}${photo.url}` };
              } else if (photo.uri) {
                return photo;
              }
              return photo;
            });
            console.log('📸 Normalized photos:', normalizedPhotos);
            setUploadedPhotos(normalizedPhotos);
          }
        } else if (params.foto) {
          if (typeof params.foto === 'string') {
            // Foto adalah string URL
            console.log('📸 Foto is string URL:', params.foto);
            setUploadedPhotos([{ uri: params.foto }]);
          } else if (Array.isArray(params.foto)) {
            // Foto adalah array
            const normalizedPhotos = params.foto.map(photo => {
              if (typeof photo === 'string') {
                return { uri: photo.startsWith('http') ? photo : `${URIPATH.apiphoto}${photo}` };
              } else if (photo.url) {
                return { uri: photo.url.startsWith('http') ? photo.url : `${URIPATH.apiphoto}${photo.url}` };
              } else if (photo.uri) {
                return photo;
              }
              return photo;
            });
            setUploadedPhotos(normalizedPhotos);
          }
        } else {
          setUploadedPhotos([]);
        }
        
        setHasInitialData(true);
      } catch (error) {
      }
    }
  }, [initialData, hasInitialData, dispatch]);

  // Set locale to Indonesian
  useEffect(() => {
    moment.locale('id');
  }, []);

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Load dropdown data when entering edit mode
  useEffect(() => {
    if (isEditing) {
      dispatch(getPenyewa());
      dispatch(getEquipment());
      dispatch(getShift());
      dispatch(getKegiatan());
      dispatch(getLokasi());
      dispatch(getMaterial());
    }
  }, [isEditing, dispatch]);

  
  // Refresh data from server
  const onRefresh = useCallback(async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Tidak dapat memuat ulang data saat offline');
      return;
    }

    setRefreshing(true);
    try {
      const timesheetId = form?.id || timesheet?.id;
      if (!timesheetId) {
        setRefreshing(false);
        return;
      }

      // Fetch fresh data from API
      const response = await ApiFetch.get(`operation/timesheet/${timesheetId}`);
      
      if (response.data && response.data.data) {
        const freshData = response.data.data;
        
        // Update local state
        setTimesheetData(freshData);
        dispatch(setTimesheet(freshData));
        
        // Handle photo - bisa berupa string URL atau array
        if (freshData.photo) {
          if (typeof freshData.photo === 'string') {
            // Photo adalah string URL
            setUploadedPhotos([{ uri: freshData.photo }]);
          } else if (Array.isArray(freshData.photo)) {
            // Photo adalah array
            const normalizedPhotos = freshData.photo.map(photo => {
              if (typeof photo === 'string') {
                return { uri: photo.startsWith('http') ? photo : `${URIPATH.apiphoto}${photo}` };
              } else if (photo.url) {
                return { uri: photo.url.startsWith('http') ? photo.url : `${URIPATH.apiphoto}${photo.url}` };
              } else if (photo.uri) {
                return photo;
              }
              return photo;
            });
            setUploadedPhotos(normalizedPhotos);
          }
        } else if (freshData.foto) {
          if (typeof freshData.foto === 'string') {
            // Foto adalah string URL
            setUploadedPhotos([{ uri: freshData.foto }]);
          } else if (Array.isArray(freshData.foto)) {
            // Foto adalah array
            const normalizedPhotos = freshData.foto.map(photo => {
              if (typeof photo === 'string') {
                return { uri: photo.startsWith('http') ? photo : `${URIPATH.apiphoto}${photo}` };
              } else if (photo.url) {
                return { uri: photo.url.startsWith('http') ? photo.url : `${URIPATH.apiphoto}${photo.url}` };
              } else if (photo.uri) {
                return photo;
              }
              return photo;
            });
            setUploadedPhotos(normalizedPhotos);
          }
        } else {
          setUploadedPhotos([]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat ulang data timesheet');
    } finally {
      setRefreshing(false);
    }
  }, [isOnline, form, timesheet, dispatch]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Update form with current photos before saving
      dispatch(updateField({ field: 'foto', value: uploadedPhotos }));
      
      // Get current form data
      const currentFormData = form;
      const timesheetId = currentFormData.id || timesheet?.id;
      
      if (!timesheetId) {
        Alert.alert('Error', 'ID timesheet tidak ditemukan');
        setIsSaving(false);
        return;
      }

      // Prepare data for API submission
      const submitData = {
        ...currentFormData,
        activity: currentFormData.mainact,
        foto: uploadedPhotos,
        id: timesheetId,
      };

      // Create FormData for multipart submission (including photos)
      // In React Native, FormData is available globally
      const dataForm = new FormData();

      Object.entries(submitData).forEach(([key, value]) => {
        // Handle photos with proper React Native file format
        if (key === 'foto') {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach((photo, index) => {
              if (photo && photo.uri) {
                // React Native FormData file object format
                // Try different approaches for photo format
                let photoFile;
                
                if (photo.uri.startsWith('file://')) {
                  // Local file - use as-is
                  photoFile = {
                    uri: photo.uri,
                    type: 'image/jpeg',
                    name: photo.fileName || photo.name || `photo_${index}.jpg`,
                  };
                } else {
                  // Asset from ImagePicker - ensure proper format
                  photoFile = {
                    uri: photo.uri,
                    type: photo.type || 'image/jpeg',
                    name: photo.fileName || photo.name || `photo_${index}.jpg`,
                  };
                }
                
                dataForm.append(`photo`, photoFile);
              }
            });
          }
        }
        // Handle arrays (like kegiatan)
        else if (Array.isArray(value)) {
          dataForm.append(key, JSON.stringify(value));
        }
        // Handle primitive values
        else if (value !== null && value !== undefined && value !== '') {
          dataForm.append(key, value.toString());
        }
      });
      
      // Check if photos are included
      const photoParts = dataForm._parts.filter(([key]) => key.includes('foto'));

      // Call the update API endpoint with proper FormData headers
      const response = await ApiFetch.post(
        `operation/timesheet/${timesheetId}/mytimesheet`,
        dataForm,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data', // Explicitly set for React Native
          },
          // Important: Disable automatic transformation for FormData
          transformRequest: [(data, headers) => {
            // Remove Content-Type header to let React Native set it with boundary
            delete headers['Content-Type'];
            delete headers['Content-type'];
            return data;
          }],
        }
       );
       
       setIsEditing(false);
       setIsSaving(false);
       
       // Refresh data after successful save
       await onRefresh();
       
       Alert.alert(
         'Berhasil',
         'Timesheet berhasil diperbarui. Data telah dimuat ulang.',
         [
           {
             text: 'OK',
           },
         ]
       );
      
    } catch (error) {
      
      let errorMessage = error?.message || 'Gagal memperbarui timesheet';
      
      if (error?.response?.status === 404) {
        errorMessage = 'Endpoint tidak ditemukan. Pastikan backend server sudah di-restart dan route sudah terdaftar.';
      } else if (error?.response?.status === 500) {
        const serverError = error?.response?.data;
        
        if (serverError?.message) {
          errorMessage = `Server error: ${serverError.message}`;
        } else if (serverError?.error) {
          errorMessage = `Server error: ${serverError.error}`;
        } else if (serverError?.errors) {
          // Handle validation errors
          const validationErrors = Object.values(serverError.errors).flat().join(', ');
          errorMessage = `Validation error: ${validationErrors}`;
        } else {
          errorMessage = 'Server error (500). Periksa backend logs untuk detail error.';
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error?.response?.data?.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error?.response?.data?.error;
      }
      
      setIsSaving(false);
      
      Alert.alert(
        'Error',
        `${errorMessage} (Status: ${error?.response?.status || 'Unknown'})`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Re-enable edit mode on error
              setIsEditing(true);
            },
          },
        ]
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus timesheet ini? Tindakan ini tidak dapat dibatalkan.',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Get the timesheet ID from form or timesheet data
      const timesheetId = form?.id || timesheet?.id;
      
      if (!timesheetId) {
        Alert.alert('Error', 'ID timesheet tidak ditemukan');
        return;
      }

      // Additional validation: Check if timesheet can be deleted
      const currentStatus = timesheet?.status || form?.status;
      if (currentStatus === 'A' || currentStatus === 'approved') {
        Alert.alert('Error', 'Timesheet yang sudah disetujui tidak dapat dihapus');
        return;
      }

      // Call DELETE API
      const response = await ApiFetch.delete(`/operation/timesheet/${timesheetId}`);

      // If we reach here, the delete was successful
      Alert.alert(
        'Berhasil',
        'Timesheet berhasil dihapus',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to timesheet list
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Delete timesheet error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menghapus timesheet');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      A: '#2B8F0C',
      W: '#f09d27',
      R: '#dc2626',
      pending: '#f09d27',
      approved: '#2B8F0C',
      rejected: '#dc2626',
      draft: '#96a2b4',
    };

    return {
      backgroundColor: statusColors[status] || '#96a2b4',
      color: '#FFFFFF',
    };
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      A: 'APPROVED',
      W: 'WAITING APPROVAL',
      R: 'RETRY APPROVAL',
      pending: 'WAITING APPROVAL',
      approved: 'APPROVED',
      rejected: 'RETRY APPROVAL',
      draft: 'DRAFT',
    };
    return statusLabels[status] || status?.toUpperCase() || 'DRAFT';
  };

  // Photo handling functions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Error', 'Izin kamera diperlukan untuk mengambil foto');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.back, // Use back camera
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = result.assets[0];
        // Replace existing photo - only allow 1 photo
        setUploadedPhotos([newPhoto]);
        
        // Update form data with single photo
        dispatch(updateField({ field: 'foto', value: [newPhoto] }));
        
        Alert.alert('Berhasil', 'Foto timesheet berhasil diperbarui');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil foto');
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        Alert.alert('Error', 'Izin galeri diperlukan untuk memilih foto');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = result.assets[0];
        // Replace existing photo - only allow 1 photo
        setUploadedPhotos([newPhoto]);
        
        // Update form data with single photo
        dispatch(updateField({ field: 'foto', value: [newPhoto] }));
        
        Alert.alert('Berhasil', 'Foto timesheet berhasil diperbarui');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih foto');
    }
  };

  const removePhoto = () => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus foto timesheet ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setUploadedPhotos([]);
            dispatch(updateField({ field: 'foto', value: [] }));
            Alert.alert('Berhasil', 'Foto timesheet berhasil dihapus');
          },
        },
      ]
    );
  };

  const renderPhotoItem = ({ item }) => {
    // Handle different photo URI formats
    let photoUri = item.uri;
    
    // If item is a string URL, use it directly
    if (typeof item === 'string') {
      photoUri = item;
    }
    // If item has url property (common from backend)
    else if (item.url) {
      photoUri = item.url;
    }
    // If item has uri property (local file)
    else if (item.uri) {
      photoUri = item.uri;
    }
    
    // If it's a relative path, convert to full URL
    if (photoUri && !photoUri.startsWith('http') && !photoUri.startsWith('file://') && !photoUri.startsWith('data:')) {
      photoUri = `${URIPATH.apiphoto}${photoUri}`;
    }
    
    console.log('🖼️ Rendering photo with URI:', photoUri);
    
    return (
      <View style={styles.singlePhotoContainer}>
        <Image 
          source={{ uri: photoUri }} 
          style={[styles.singlePhoto, { borderColor: isDark ? '#4b5563' : '#d1d5db' }]} 
        />
        {isEditing && (
          <TouchableOpacity
            style={styles.removePhotoButton}
            onPress={() => removePhoto()}>
            <Ionicons name="close-circle" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !hasInitialData && !timesheet) {
    return (
      <AppScreen>
        <AppHeader title="Detail TimeSheet" prevPage={true} onChangeThemes={true} />
        <View style={styles.loadingContainer}>
          <Text
            style={[
              styles.loadingText,
              { color: appmode.txtcolor[mode][1] },
            ]}>
            Memuat data...
          </Text>
        </View>
      </AppScreen>
    );
  }

  const currentStatus = timesheet?.status || form?.status;
  const statusStyle = getStatusBadge(currentStatus);
  
  
  return (
    <AppScreen>
      <AppHeader title="Detail TimeSheet" prevPage={true} onChangeThemes={true} />
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            enabled={isOnline && !isEditing}
            colors={['#2563eb']}
            tintColor="#2563eb"
            title={isOnline ? "Tarik untuk memuat ulang..." : "Offline"}
            titleColor={isDark ? '#9ca3af' : '#6b7280'}
          />
        }>

        {/* Employee Info Header */}
        <View style={[styles.employeeHeader, { backgroundColor: isDark ? '#374151' : '#FFFFFF' }]}>
          <View style={styles.employeeLeft}>
            <Text style={[styles.employeeName, { color: appmode.txtcolor[mode][7] }]}>
              {form.operator_nama || 'Operator'}
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
              {form.cabang_nama || employee?.cabang?.nama || ''}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Status & Actions */}
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, statusStyle]}>
              <Text style={styles.statusText}>
                {getStatusLabel(timesheet?.status || form?.status)}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {!isEditing && (timesheet?.status !== 'A' && timesheet?.status !== 'approved' && form?.status !== 'A' && form?.status !== 'approved') && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.editButton,
                      { backgroundColor: appmode.txtcolor[mode][7] },
                    ]}
                    onPress={handleEdit}>
                    <Ionicons name="create" size={16} color="#FFFFFF" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      { 
                        backgroundColor: isDeleting ? '#9ca3af' : '#dc2626',
                        opacity: isDeleting ? 0.6 : 1,
                      },
                    ]}
                    onPress={handleDelete}
                    disabled={isDeleting}>
                    {isDeleting ? (
                      <Ionicons name="hourglass-outline" size={16} color="#FFFFFF" />
                    ) : (
                      <Ionicons name="trash" size={16} color="#FFFFFF" />
                    )}
                    <Text style={styles.deleteButtonText}>
                      {isDeleting ? 'Menghapus...' : 'Hapus'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {isEditing && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      { backgroundColor: '#6b7280' },
                    ]}
                    onPress={handleCancel}>
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                    <Text style={styles.cancelButtonText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      { 
                        backgroundColor: isSaving ? '#9ca3af' : appmode.txtcolor[mode][7],
                        opacity: isSaving ? 0.7 : 1,
                      },
                    ]}
                    onPress={handleSave}
                    disabled={isSaving || submitting}>
                    {isSaving ? (
                      <Ionicons name="hourglass-outline" size={16} color="#FFFFFF" />
                    ) : (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                    <Text style={styles.saveButtonText}>
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

           {/* Row: Tanggal & Kategori */}
           <View style={styles.row}>
             <InputBox
               label="Tanggal :"
               value={form.date_ops || form.tanggal ? moment(form.date_ops || form.tanggal).format('DD MMM YYYY') : 'Tidak ada tanggal'}
               onPress={isEditing ? () => setShowDatePicker(true) : undefined}
               disabled={!isEditing}
               flex={1}
             />
             <View style={{ width: 8 }} />
              <InputBox
                label="Kategori :"
                value={form.mainact?.toUpperCase() || 'MINING'}
                onPress={isEditing ? () => setShowPicker({ ...showPicker, kategori: true }) : undefined}
                disabled={!isEditing}
                flex={1}
              />
           </View>

           {/* Cabang */}
           <View style={styles.inputSpacing}>
             <InputBox
               label="Nama Cabang :"
               value={form.cabang_nama || employee?.cabang?.nama || 'Tidak ada cabang'}
               disabled
             />
           </View>

          {/* Penyewa */}
          <View style={styles.inputSpacing}>
             <InputBox
               label="Nama Penyewa :"
               value={form.penyewa_nama || '-'}
               onPress={isEditing ? () => setShowPicker({ ...showPicker, penyewa: true }) : undefined}
               disabled={!isEditing}
             />
          </View>

          {/* Row: Equipment & Shift */}
          <View style={styles.row}>
             <InputBox
               label="Equipment :"
               value={form.equipment_nama || '-'}
               onPress={isEditing ? () => setShowPicker({ ...showPicker, equipment: true }) : undefined}
               disabled={!isEditing}
               flex={1}
             />
             <View style={{ width: 8 }} />
             <InputBox
               label="Shift :"
               value={form.shift_nama || '-'}
               onPress={isEditing ? () => setShowPicker({ ...showPicker, shift: true }) : undefined}
               disabled={!isEditing}
               flex={1}
             />
          </View>

          {/* Operator */}
          <View style={styles.inputSpacing}>
             <InputBox
               label="Operator :"
               value={form.operator_nama || '-'}
               disabled
             />
          </View>

          {/* Row: SMU Start & Finish */}
          <View style={styles.row}>
            <InputNumeric
              label="SMU Start :"
              value={form.smustart}
              onChangeText={(value) => {
                if (isEditing) {
                  dispatch(updateField({ field: 'smustart', value: parseFloat(value) || 0 }));
                }
              }}
              disabled={!isEditing}
              flex={1}
              placeholder="0"
            />
            <View style={{ width: 8 }} />
            <InputNumeric
              label="SMU Finish :"
              value={form.smufinish}
              onChangeText={(value) => {
                if (isEditing) {
                  dispatch(updateField({ field: 'smufinish', value: parseFloat(value) || 0 }));
                }
              }}
              disabled={!isEditing}
              flex={1}
              placeholder="0"
            />
          </View>

          {/* Row: Used SMU & BBM */}
          <View style={styles.row}>
            <InputNumeric
              label="Used SMU :"
              value={form.usedsmu}
              onChangeText={() => {}}
              disabled
              flex={1}
              placeholder="0"
            />
            <View style={{ width: 8 }} />
            <InputNumeric
              label="Refuel BBM (Liter) :"
              value={form.bbm}
              onChangeText={(value) => {
                if (isEditing) {
                  dispatch(updateField({ field: 'bbm', value: parseFloat(value) || 0 }));
                }
              }}
              disabled={!isEditing}
              flex={1}
              placeholder="0"
            />
          </View>

          {/* Kegiatan Section */}
          <View style={styles.kegiatanSection}>
            <Text style={[styles.kegiatanSectionTitle, { color: appmode.txtcolor[mode][1] }]}>
              Data Kegiatan ({form.kegiatan?.length || 0} items)
            </Text>
            {form.kegiatan && form.kegiatan.length > 0 ? (
              form.kegiatan.map((item, index) => (
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
                    {isEditing && form.kegiatan.length > 1 && (
                      <TouchableOpacity
                        onPress={() => dispatch(removeKegiatan(item.id))}>
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.kegiatanContent}>
                    {/* Row: Nama Kegiatan & Material */}
                    <View style={styles.row}>
                       <InputBox
                         label="Nama Kegiatan :"
                         value={item.kegiatan?.nama || '-'}
                         onPress={isEditing ? () => setKegiatanPicker({
                           visible: true,
                           kegiatanId: item.id,
                           type: 'kegiatan',
                         }) : undefined}
                         disabled={!isEditing}
                         flex={1}
                       />
                       <View style={{ width: 8 }} />
                       <InputBox
                         label="Nama Material :"
                         value={item.material?.nama || '-'}
                         onPress={isEditing ? () => setKegiatanPicker({
                           visible: true,
                           kegiatanId: item.id,
                           type: 'material',
                         }) : undefined}
                         disabled={!isEditing}
                         flex={1}
                       />
                    </View>

                    {/* Row: Lokasi Asal & Lokasi Tujuan */}
                    <View style={styles.row}>
                       <InputBox
                         label="Lokasi Asal :"
                         value={item.lokasi?.nama || '-'}
                         onPress={isEditing ? () => setKegiatanPicker({
                           visible: true,
                           kegiatanId: item.id,
                           type: 'lokasi_asal',
                         }) : undefined}
                         disabled={!isEditing}
                         flex={1}
                       />
                       <View style={{ width: 8 }} />
                       <InputBox
                         label="Lokasi Tujuan :"
                         value={item.lokasiTujuan?.nama || '-'}
                         onPress={isEditing ? () => setKegiatanPicker({
                           visible: true,
                           kegiatanId: item.id,
                           type: 'lokasi_tujuan',
                         }) : undefined}
                         disabled={!isEditing}
                         flex={1}
                       />
                    </View>

                     {/* Row: Waktu Mulai & Selesai */}
                     <View style={styles.timeRow}>
                       <View style={styles.timeInputContainer}>
                         <InputBox
                           label="Waktu Mulai :"
                           value={item.starttime ? moment(item.starttime, 'YYYY-MM-DD HH:mm').format('HH:mm') : '-'}
                           onPress={isEditing ? () => setShowTimePicker({
                             visible: true,
                             kegiatanId: item.id,
                             type: 'starttime',
                           }) : undefined}
                           disabled={!isEditing}
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
                           onPress={isEditing ? () => setShowTimePicker({
                             visible: true,
                             kegiatanId: item.id,
                             type: 'endtime',
                           }) : undefined}
                           disabled={!isEditing}
                           flex={1}
                         />
                       </View>
                     </View>

                    {/* Row: SMU Start & SMU Finish */}
                    <View style={styles.row}>
                      <InputNumeric
                        label="SMU Start :"
                        value={item.smustart || 0}
                        onChangeText={(value) => {
                          if (isEditing) {
                            dispatch(updateKegiatan({
                              id: item.id,
                              field: 'smustart',
                              value: parseFloat(value) || 0
                            }));
                          }
                        }}
                        disabled={!isEditing}
                        flex={1}
                        placeholder="0"
                      />
                      <View style={{ width: 8 }} />
                      <InputNumeric
                        label="SMU Finish :"
                        value={item.smufinish || 0}
                        onChangeText={(value) => {
                          if (isEditing) {
                            dispatch(updateKegiatan({
                              id: item.id,
                              field: 'smufinish',
                              value: parseFloat(value) || 0
                            }));
                          }
                        }}
                        disabled={!isEditing}
                        flex={1}
                        placeholder="0"
                      />
                    </View>

                    {/* Row: Seq & Ritase */}
                    <View style={styles.row}>
                      <InputNumeric
                        label="Seq :"
                        value={item.seq || 0}
                        onChangeText={(value) => {
                          if (isEditing) {
                            dispatch(updateKegiatan({
                              id: item.id,
                              field: 'seq',
                              value: parseFloat(value) || 0
                            }));
                          }
                        }}
                        disabled={!isEditing}
                        flex={1}
                        placeholder="0"
                      />
                      <View style={{ width: 8 }} />
                       <InputNumeric
                         label="Ritase :"
                         value={item.ritase || 0}
                         onChangeText={(value) => {
                           if (isEditing) {
                             dispatch(updateKegiatan({
                               id: item.id,
                               field: 'ritase',
                               value: parseFloat(value) || 0
                             }));
                           }
                         }}
                         disabled={!isEditing}
                         flex={1}
                         placeholder="0"
                       />
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.noDataText, { color: appmode.txtcolor[mode][3] }]}>
                Tidak ada data kegiatan
              </Text>
            )}

            {isEditing && (
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: isDark ? '#374151' : '#FFFFFF',
                    borderColor: appmode.txtcolor[mode][7],
                  },
                ]}
                onPress={() => dispatch(addKegiatan())}>
                <Ionicons name="add-circle" size={24} color={appmode.txtcolor[mode][7]} />
                <Text style={[styles.addButtonText, { color: appmode.txtcolor[mode][7] }]}>
                  Tambah Kegiatan
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Keterangan */}
          <View style={styles.inputSpacing}>
            <InputTeksNarasi
              label="Keterangan"
              value={form.keterangan || ''}
              onChangeText={(text) => {
                if (isEditing) {
                  dispatch(updateField({ field: 'keterangan', value: text }));
                }
              }}
              editable={isEditing}
              placeholder="Tidak ada keterangan"
            />
          </View>

           {/* Photo Upload */}
           <View style={[styles.inputSpacing, {marginBottom: 80}]}>
             <View style={styles.photoSection}>
               <View style={styles.photoHeader}>
                 <Text style={[styles.photoLabel, { color: appmode.txtcolor[mode][1] }]}>
                   Foto Timesheet
                 </Text>
                 {isEditing && (
                   <TouchableOpacity
                     style={[styles.addPhotoButton, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]}
                     onPress={() => setShowPhotoOptions(true)}>
                     <Ionicons name="camera" size={20} color="#FFFFFF" />
                   </TouchableOpacity>
                 )}
               </View>
               
               {(form.photo || uploadedPhotos.length > 0) ? (
                 <View style={styles.singlePhotoContainer}>
                   <TouchableOpacity 
                     onPress={() => {
                       setImageViewerIndex(0);
                       setImageViewerVisible(true);
                     }}
                     activeOpacity={0.9}>
                     <Image 
                       source={{ uri: form.photo || uploadedPhotos[0]?.uri }} 
                       style={[styles.singlePhoto, { borderColor: isDark ? '#4b5563' : '#d1d5db' }]} 
                     />
                     <View style={styles.zoomIndicator}>
                       <Ionicons name="expand" size={20} color="#FFFFFF" />
                     </View>
                   </TouchableOpacity>
                   {isEditing && (
                     <TouchableOpacity
                       style={styles.removePhotoButton}
                       onPress={() => {
                         Alert.alert(
                           'Konfirmasi',
                           'Apakah Anda yakin ingin menghapus foto timesheet ini?',
                           [
                             { text: 'Batal', style: 'cancel' },
                             {
                               text: 'Hapus',
                               style: 'destructive',
                               onPress: () => {
                                 setUploadedPhotos([]);
                                 dispatch(updateField({ field: 'foto', value: [] }));
                                 dispatch(updateField({ field: 'photo', value: null }));
                                 Alert.alert('Berhasil', 'Foto timesheet berhasil dihapus');
                               },
                             },
                           ]
                         );
                       }}>
                       <Ionicons name="close-circle" size={24} color="#ef4444" />
                     </TouchableOpacity>
                   )}
                 </View>
               ) : (
                 <View style={[styles.noPhotoContainer, { borderColor: isDark ? '#4b5563' : '#d1d5db' }]}>
                   <Ionicons name="image" size={48} color={isDark ? '#9ca3af' : '#6b7280'} />
                   <Text style={[styles.noPhotoText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                     Belum ada foto timesheet
                   </Text>
                   {isEditing && (
                     <TouchableOpacity
                       style={[styles.uploadFirstPhotoButton, { borderColor: isDark ? '#4b5563' : '#d1d5db' }]}
                       onPress={() => setShowPhotoOptions(true)}>
                       <Ionicons name="add-circle" size={20} color={isDark ? '#3b82f6' : '#2563eb'} />
                       <Text style={[styles.uploadFirstPhotoText, { color: isDark ? '#3b82f6' : '#2563eb' }]}>
                         Tambah Foto Timesheet
                       </Text>
                     </TouchableOpacity>
                   )}
                 </View>
               )}
             </View>
           </View>
         </View>
       </ScrollView>

       {/* Bottom Sheet Pickers */}
       <BottomSheetPicker
         visible={showPicker.penyewa}
         title="Pilih Penyewa"
         data={penyewaList || []}
         onSelect={(item) => {
           dispatch(updateField({ field: 'penyewa_id', value: item.id }));
           dispatch(updateField({ field: 'penyewa_nama', value: item.nama }));
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
           dispatch(updateField({ field: 'equipment_id', value: item.id }));
           dispatch(updateField({ field: 'equipment_nama', value: item.kode }));
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
           dispatch(updateField({ field: 'shift_id', value: item.id }));
           dispatch(updateField({ field: 'shift_nama', value: item.nama }));
         }}
         onClose={() => setShowPicker({ ...showPicker, shift: false })}
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
         data={
           kegiatanPicker.type === 'kegiatan' 
             ? (kegiatanList || []) 
             : kegiatanPicker.type === 'material'
             ? (materialList || [])
             : (lokasiList || [])
         }
         onSelect={(item) => {
           if (kegiatanPicker.type === 'kegiatan') {
             dispatch(updateKegiatan({
               id: kegiatanPicker.kegiatanId,
               field: 'kegiatan_id',
               value: item.id,
             }));
             dispatch(updateKegiatan({
               id: kegiatanPicker.kegiatanId,
               field: 'kegiatan_nama',
               value: item.nama,
             }));
           } else if (kegiatanPicker.type === 'material') {
             dispatch(updateKegiatan({
               id: kegiatanPicker.kegiatanId,
               field: 'material_id',
               value: item.id,
             }));
             dispatch(updateKegiatan({
               id: kegiatanPicker.kegiatanId,
               field: 'material_nama',
               value: item.nama,
             }));
           } else if (kegiatanPicker.type === 'lokasi_asal') {
             dispatch(updateKegiatan({
               id: kegiatanPicker.kegiatanId,
               field: 'lokasi_asal_id',
               value: item.id,
             }));
             dispatch(updateKegiatan({
               id: kegiatanPicker.kegiatanId,
               field: 'lokasi_asal_nama',
               value: item.nama,
             }));
           } else {
             dispatch(updateKegiatan({
               id: kegiatanPicker.kegiatanId,
               field: 'lokasi_tujuan_id',
               value: item.id,
             }));
             dispatch(updateKegiatan({
               id: kegiatanPicker.kegiatanId,
               field: 'lokasi_tujuan_nama',
               value: item.nama,
             }));
           }
         }}
         onClose={() => setKegiatanPicker({ visible: false, kegiatanId: '', type: 'kegiatan' })}
         displayKey="nama"
         searchKey="nama"
       />

       <BottomSheetPicker
         visible={showPicker.kategori}
         title="Pilih Kategori"
         data={kategoriOptions}
         onSelect={(item) => {
           dispatch(updateField({ field: 'mainact', value: item.id }));
         }}
         onClose={() => setShowPicker({ ...showPicker, kategori: false })}
         displayKey="nama"
         searchKey="nama"
       />

       <DatePickerModal
         visible={showDatePicker}
         selectedDate={form.date_ops || form.tanggal}
         onSelect={(date) => {
           dispatch(updateField({ field: 'tanggal', value: date }));
           dispatch(updateField({ field: 'date_ops', value: date }));
         }}
         onClose={() => setShowDatePicker(false)}
       />

         <TimePickerModal
           visible={showTimePicker.visible}
           selectedTime={
             form.kegiatan.find(k => k.id === showTimePicker.kegiatanId)?.[showTimePicker.type] || ''
           }
           title={showTimePicker.type === 'starttime' ? 'Waktu Mulai' : 'Waktu Selesai'}
           showDateSelector={true}
           timesheetDate={form.tanggal}
           onSelect={(time) => {
             const kegiatan = form.kegiatan.find(k => k.id === showTimePicker.kegiatanId);
             if (kegiatan) {
               dispatch(updateKegiatan({
                 id: showTimePicker.kegiatanId,
                 field: showTimePicker.type,
                 value: moment(time).format('YYYY-MM-DD HH:mm'),
               }));
             }
           }}
           onClose={() => setShowTimePicker({ visible: false, kegiatanId: '', type: 'starttime' })}
         />

        {/* Photo Options Modal */}
        {showPhotoOptions && (
          <View style={styles.photoOptionsOverlay}>
            <View style={[styles.photoOptionsModal, { backgroundColor: isDark ? '#374151' : '#FFFFFF' }]}>
              <View style={styles.photoOptionsHeader}>
                <Text style={[styles.photoOptionsTitle, { color: appmode.txtcolor[mode][1] }]}>
                  Pilih Sumber Foto
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPhotoOptions(false)}>
                  <Ionicons name="close" size={24} color={appmode.txtcolor[mode][3]} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.photoOptionButton, { borderColor: isDark ? '#4b5563' : '#d1d5db' }]}
                onPress={takePhoto}>
                <Ionicons name="camera" size={24} color={isDark ? '#3b82f6' : '#2563eb'} />
                <Text style={[styles.photoOptionText, { color: appmode.txtcolor[mode][1] }]}>
                  📷 Ambil Foto Timesheet
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.photoOptionButton, { borderColor: isDark ? '#4b5563' : '#d1d5db' }]}
                onPress={pickImage}>
                <Ionicons name="image" size={24} color={isDark ? '#3b82f6' : '#2563eb'} />
                <Text style={[styles.photoOptionText, { color: appmode.txtcolor[mode][1] }]}>
                  🖼️ Pilih dari Galeri
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.photoCancelButton, { backgroundColor: '#6b7280' }]}
                onPress={() => setShowPhotoOptions(false)}>
                <Text style={styles.photoCancelText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Image Viewer untuk Zoom */}
        <ImageView
          images={[
            { uri: form.photo || uploadedPhotos[0]?.uri || '' }
          ].filter(img => img.uri)}
          imageIndex={imageViewerIndex}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
          FooterComponent={({ imageIndex }) => (
            <View style={styles.imageViewerFooter}>
              <Text style={styles.imageViewerFooterText}>
                Foto Timesheet
              </Text>
              <Text style={styles.imageViewerFooterSubtext}>
                Pinch untuk zoom • Double tap untuk zoom
              </Text>
            </View>
          )}
        />
     </AppScreen>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  // Employee Header Styles
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
    fontSize: 18,
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
  // Kegiatan Styles
  kegiatanSection: {
    marginVertical: 20,
  },
  kegiatanSectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
    marginBottom: 16,
  },
  kegiatanItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  kegiatanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kegiatanTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  kegiatanContent: {
    // Nested content in kegiatan card
  },
  noDataText: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
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
  // Status Badge Styles
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
  },
  // Photo Styles
  photoSection: {
    marginTop: 8,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  addPhotoButton: {
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 6,
  },
  photoContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  singlePhotoContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  singlePhoto: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: 70, // Adjusted for centered single photo
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noPhotoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  noPhotoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    marginTop: 8,
    marginBottom: 16,
  },
  uploadFirstPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  uploadFirstPhotoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  // Photo Options Modal
  photoOptionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  photoOptionsModal: {
    width: '90%',
    maxWidth: 320,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  photoOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  photoOptionsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  photoOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  photoOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
  },
  photoCancelButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  photoCancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
});