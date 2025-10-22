import AppHeader from '@/src/components/AppHeader';
import AppScreen from '@/src/components/AppScreen';
import SimpleErrorModal from '@/src/components/SimpleErrorModal';
import apiFetch from '@/src/helpers/ApiFetch';
import appmode from '@/src/helpers/ThemesMode';
import { useAppSelector } from '@/src/redux/hooks';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { getDistance, orderByDistance } from 'geolib';
import moment from 'moment';
import 'moment/locale/id';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import CameraScreen from './camera-screen';
import MapScreen from './map-screen';

export default function AbsensiPage() {
  const { user, employee } = useAppSelector(state => state.auth);
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';
  const router = useRouter();
  const [serverTime, setServerTime] = useState(null);
  const [nearestInfo, setNearestInfo] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [camType, setCamType] = useState('in');
  const [modal, setModal] = useState({ visible: false, title: '', body: '', variant: 'warning', footerText: 'OK' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCheckIn = async (photo) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Get device unique ID
      const uniqueId = await DeviceInfo.getUniqueId();
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Balanced 
      });
      
      // Create FormData
      const formData = new FormData();
      
      // Add photo
      formData.append('photo', {
        uri: `file://${photo.path}`,
        type: 'image/jpeg',
        name: `checkin_${Date.now()}.jpg`,
      });
      
      // Add pin from employee data
      formData.append('pin', employee?.pin || '');
      formData.append('karyawan_id', employee.id || '');
      
      // Add device_id
      formData.append('device_id', uniqueId);
      
      // Add location data (optional)
      formData.append('latitude', location.coords.latitude.toString());
      formData.append('longitude', location.coords.longitude.toString());
      
      // Submit to API
      const response = await apiFetch.post('/mobile/check-in-mobile/karyawan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: [(data, headers) => {
          delete headers['Content-Type'];
          delete headers['Content-type'];
          return data;
        }],
      });
      
      setModal({ 
        visible: true, 
        title: 'Berhasil', 
        body: 'Check-In berhasil dicatat', 
        variant: 'success', 
        footerText: 'OK' 
      });
      
    } catch (error) {
      
      let errorMessage = 'Gagal melakukan check-in';
      let errorTitle = 'Error';
      
      // Handle backend error format with diagnostic
      if (error?.response?.data?.diagnostic) {
        const diagnostic = error.response.data.diagnostic;
        
        if (diagnostic.message) {
          errorMessage = diagnostic.message;
        }
        if (diagnostic.error) {
          errorTitle = 'Gagal Check-In';
        }
      } 
      // Fallback to standard error formats
      else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      // Network or other errors
      else if (error?.message) {
        errorMessage = error.message;
      }
      
      setModal({ 
        visible: true, 
        title: errorTitle, 
        body: errorMessage, 
        variant: 'danger', 
        footerText: 'Tutup' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (photo) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Get device unique ID
      const uniqueId = await DeviceInfo.getUniqueId();
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Balanced 
      });
      
      // Create FormData
      const formData = new FormData();
      
      // Add photo
      formData.append('photo', {
        uri: `file://${photo.path}`,
        type: 'image/jpeg',
        name: `checkout_${Date.now()}.jpg`,
      });
      
      // Add pin from employee data
      formData.append('pin', employee?.pin || '');
      
      // Add device_id
      formData.append('device_id', uniqueId);
      
      // Add location data (optional)
      formData.append('latitude', location.coords.latitude.toString());
      formData.append('longitude', location.coords.longitude.toString());
      
      // Submit to API (you may need to change endpoint for check-out)
      const response = await apiFetch.post('/mobile/check-out-mobile/karyawan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: [(data, headers) => {
          delete headers['Content-Type'];
          delete headers['Content-type'];
          return data;
        }],
      });
      
      console.log('✅ Check-Out Response:', response.data);
      
      setModal({ 
        visible: true, 
        title: 'Berhasil', 
        body: 'Check-Out berhasil dicatat', 
        variant: 'success', 
        footerText: 'OK' 
      });
      
    } catch (error) {
      
      let errorMessage = 'Gagal melakukan check-out';
      let errorTitle = 'Error';
      
      // Handle backend error format with diagnostic
      if (error?.response?.data?.diagnostic) {
        const diagnostic = error.response.data.diagnostic;
        
        if (diagnostic.message) {
          errorMessage = diagnostic.message;
        }
        if (diagnostic.error) {
          errorTitle = 'Gagal Check-Out';
        }
      } 
      // Fallback to standard error formats
      else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      // Network or other errors
      else if (error?.message) {
        errorMessage = error.message;
      }
      
      setModal({ 
        visible: true, 
        title: errorTitle, 
        body: errorMessage, 
        variant: 'danger', 
        footerText: 'Tutup' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const requestAndOpenCamera = async (type) => {
    try {
      const { Camera } = await import('react-native-vision-camera');

      // 1) Fake GPS check
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setModal({ 
          visible: true, 
          title: 'Peringatan', 
          body: 'Izin lokasi diperlukan untuk melanjutkan', 
          variant: 'warning', 
          footerText: 'Tutup' 
        });
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (current?.mocked) {
        setModal({ 
          visible: true, 
          title: 'System Detect Fake GPS', 
          body: 'Anda tidak diperbolehkan menggunakan fitur ini dengan lokasi tiruan, System akan memberikan notifikasi ke Team HRD dan menyimpan lokasi tiruan anda...', 
          variant: 'danger', 
          footerText: 'bertobatlah' 
        });
        return;
      }

      // 2) Outside radius check
      try {
        const stored = await AsyncStorage.getItem('@koordinatChecklog');
        const list = stored ? JSON.parse(stored) : [];
        const userPoint = { latitude: current.coords.latitude, longitude: current.coords.longitude };
        const candidates = Array.isArray(list) ? list.map(i => ({ latitude: parseFloat(i?.latitude ?? i?.lat), longitude: parseFloat(i?.longitude ?? i?.lng ?? i?.lon ?? i?.long), radius: parseFloat(i?.radius ?? i?.rad) || 0 })).filter(p => isFinite(p.latitude) && isFinite(p.longitude)) : [];
        if (candidates.length > 0) {
          const nearest = orderByDistance(userPoint, candidates)[0];
          const dist = getDistance(userPoint, nearest);
          if (dist > (nearest.radius || 0)) {
            setModal({ 
              visible: true, 
              title: 'Peringatan', 
              body: 'Posisi anda berada diluar lokasi Checklog', 
              variant: 'warning', 
              footerText: 'Tutup' 
            });
            return;
          }
        }
      } catch {}

      // 3) Device id mismatch
      try {
        const uniqueId = await DeviceInfo.getUniqueId();
        
        if (user?.device_id && user.device_id !== uniqueId) {
          setModal({ 
            visible: true, 
            title: 'Peringatan', 
            body: 'Perangkat yang anda gunakan tidak terdaftar dalam pada data perangkat HRD, Hubungi Team HRD untuk melakukan reset perangkat baru jika anda ingin mengganti Perangkat/HP', 
            variant: 'warning', 
            footerText: 'Tutup' 
          });
          return;
        }
      } catch {}

      // Camera permission
      const permission = await Camera.getCameraPermissionStatus();
      if (permission !== 'granted') {
        const result = await Camera.requestCameraPermission();
        if (result !== 'granted') {
          setModal({ 
            visible: true, 
            title: 'Peringatan', 
            body: 'Izin kamera diperlukan untuk melanjutkan', 
            variant: 'warning', 
            footerText: 'Tutup' 
          });
          return;
        }
      }

      setCamType(type);
      setShowCamera(true);
    } catch (e) {
      setModal({ 
        visible: true, 
        title: 'Error', 
        body: 'Gagal membuka kamera', 
        variant: 'danger', 
        footerText: 'Tutup' 
      });
    }
  };
  

  // Set moment locale to Indonesian
  useEffect(() => {
    moment.locale('id');
  }, []);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const response = await apiFetch.get('server-times');

        // Try different possible response formats
        let datetimeValue = null;
        if (response.data?.data?.datetime) {
          datetimeValue = response.data.data.datetime;
        } else if (response.data?.datetime) {
          datetimeValue = response.data.datetime;
        } else if (response.data?.data?.time) {
          datetimeValue = response.data.data.time;
        } else if (response.data?.time) {
          datetimeValue = response.data.time;
        } else if (response.data?.server_time) {
          datetimeValue = response.data.server_time;
        } else if (response.data?.data?.server_time) {
          datetimeValue = response.data.data.server_time;
        } else if (response.data?.waktu) {
          datetimeValue = response.data.waktu;
        } else if (response.data?.data?.waktu) {
          datetimeValue = response.data.data.waktu;
        }

        if (datetimeValue) {
          // Try parsing with moment first (handles various formats)
          const serverDateTime = moment(datetimeValue, ['DD-MM-YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss', moment.ISO_8601]).toDate();
          if (!isNaN(serverDateTime.getTime())) {
            setServerTime(serverDateTime);
          } else {
            console.error('Invalid datetime format:', datetimeValue);
          }
        } else {
          console.error('No datetime field found in response');
        }
      } catch (error) {
        console.error('Failed to fetch server time:', error);
      }
    };
    fetchServerTime();
  }, []);

  useEffect(() => {
    if (!serverTime) return;
    const interval = setInterval(() => {
      setServerTime(prev => moment(prev).add(1, 'seconds').toDate());
    }, 1000);
    return () => clearInterval(interval);
  }, [serverTime]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const user = { latitude: current.coords.latitude, longitude: current.coords.longitude };

        try {
          const stored = await AsyncStorage.getItem('@koordinatChecklog');
          if (stored) {
            const list = JSON.parse(stored);
            const candidates = Array.isArray(list)
              ? list
                  .map((i) => ({
                    latitude: parseFloat(i?.latitude ?? i?.lat),
                    longitude: parseFloat(i?.longitude ?? i?.lng ?? i?.lon ?? i?.long),
                    radius: parseFloat(i?.radius ?? i?.rad) || 0,
                  }))
                  .filter((p) => isFinite(p.latitude) && isFinite(p.longitude))
              : [];
            if (candidates.length > 0 && mounted) {
              const nearest = orderByDistance(user, candidates)[0];
              const distance = getDistance(user, nearest);
              const withinRadius = distance <= (nearest.radius || 0);
              setNearestInfo({ distance, withinRadius });
            }
          }
        } catch {}
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <AppScreen>
      <AppHeader title="Absensi Kehadiran" prevPage={true} onChangeThemes={true} />
      <View style={[styles.container, { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' }]}>
          <View style={styles.clockContainer}>
            <Text style={[styles.clockText, {
              color: appmode.txtcolor[mode][1]
            }]}>
              {serverTime
                ? moment(serverTime).format('HH:mm:ss')
                : 'Memuat waktu server...'
              }
            </Text>
            <Text style={{
              color: appmode.txtcolor[mode][1],
              fontFamily: 'Farsan-Regular',
              fontSize: 24,
            }}>
              {serverTime
                ? moment(serverTime).format('dddd, DD MMMM YYYY')
                : 'Memuat waktu server...'
              }
            </Text>
            {nearestInfo && (
              <Text style={{
                color: nearestInfo.withinRadius ? appmode.txtcolor[mode][6] : appmode.txtcolor[mode][2],
                fontFamily: 'Poppins-Light',
                fontSize: 12,
                marginTop: 4,
              }}>
                Jarak ke lokasi absensi terdekat: {nearestInfo.distance} m {nearestInfo.withinRadius ? '(dalam radius)' : ''}
              </Text>
            )}
          </View>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.checkInButton,
                { backgroundColor: appmode.txtcolor[mode][6], opacity: isSubmitting ? 0.6 : 1 }
              ]}
              onPress={() => requestAndOpenCamera('in')}
              disabled={isSubmitting}
            >
              <Ionicons name="finger-print" size={48} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {isSubmitting && camType === 'in' ? 'Memproses...' : 'Check In'}
              </Text>
              <Text style={styles.actionButtonSubtext}>Masuk Kerja</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.checkOutButton,
                { backgroundColor: appmode.txtcolor[mode][4], opacity: isSubmitting ? 0.6 : 1 },
              ]}
              onPress={() => requestAndOpenCamera('out')}
              disabled={isSubmitting}
            >
              <Ionicons name="exit-outline" size={48} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {isSubmitting && camType === 'out' ? 'Memproses...' : 'Check Out'}
              </Text>
              <Text style={styles.actionButtonSubtext}>Pulang Kerja</Text>
            </TouchableOpacity>
          </View>
            {showCamera ? (
              <View style={{ flex: 1 }}>
                <CameraScreen
                  type={camType}
                  onClose={() => setShowCamera(false)}
                  onCapture={async (photo) => {
                    try {
                      await AsyncStorage.setItem('@last_selfie', JSON.stringify(photo));
                      
                      // Submit check-in/check-out
                      if (camType === 'in') {
                        await handleCheckIn(photo);
                      } else {
                        await handleCheckOut(photo);
                      }
                    } catch (error) {
                      console.error('Error saving/submitting photo:', error);
                      setModal({ 
                        visible: true, 
                        title: 'Error', 
                        body: 'Gagal menyimpan foto', 
                        variant: 'danger', 
                        footerText: 'Tutup' 
                      });
                    }
                    setShowCamera(false);
                  }}
                />
              </View>
            ) : (
              <MapScreen/>
            )}
        <SimpleErrorModal
          visible={modal.visible}
          title={modal.title}
          body={modal.body}
          footerText={modal.footerText}
          variant={modal.variant}
          onClose={() => setModal(p => ({ ...p, visible: false }))}
        />
       </View>
     </AppScreen>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  clockText: {
    fontSize: 42,
    fontFamily: 'Teko-Bold',
    fontWeight: '700'
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    marginBottom: 24,
  },
  actionContainer: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  checkInButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkOutButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  actionButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Light',
  },
  infoCard: {
    flex: 1, 
    margin: 10,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    textAlign: 'center',
    lineHeight: 20,
  },
  mapContainer: {
    height: 320,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
});