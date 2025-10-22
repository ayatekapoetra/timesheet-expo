import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { applyTheme } from '@/src/redux/themeSlice';
import { login } from '@/src/redux/authSlice';
import { syncMasterDataOnLogin } from '@/src/redux/syncSlice';
import appmode from '@/src/helpers/ThemesMode';
import AppScreen from '@/src/components/AppScreen';
import LoadingTruck from '@/src/components/LoadingTruck';

const AuthLogin = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showpass, setShowpass] = useState(false);
  const mode = useAppSelector(state => state.themes.value);
  const { error, loading, token } = useAppSelector(state => state.auth);
  const { syncing } = useAppSelector(state => state.sync);
  const [errors, setErrors] = useState(null);
  const [syncMessage, setSyncMessage] = useState(null);
  const [userpass, setUserpass] = useState({
    username: '',
    password: '',
    uuid: '',
  });

  useEffect(() => {
    getUUID();
  }, []);

  useEffect(() => {
    if (token) {
      setSyncMessage('Menyinkronkan data...');
      
      dispatch(syncMasterDataOnLogin())
        .unwrap()
        .then((result) => {
          if (result.skipped) {
            setSyncMessage('Data sudah terbaru');
          } else if (result.offline) {
            setSyncMessage('Mode offline - menggunakan data lokal');
          } else {
            setSyncMessage('Sinkronisasi berhasil');
          }
          
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1000);
        })
        .catch((error) => {
          setSyncMessage('Sinkronisasi gagal - menggunakan data lokal');
          
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1500);
        });
    }
  }, [token]);

  const getUUID = async () => {
    try {
      const uuid = await AsyncStorage.getItem('@DEVICESID');
      if (uuid) {
        setUserpass(prev => ({ ...prev, uuid }));
      } else {
        const uniqueId = Device.osInternalBuildId || 'unknown-device';
        setUserpass(prev => ({ ...prev, uuid: uniqueId }));
        await AsyncStorage.setItem('@DEVICESID', uniqueId);
      }
    } catch (error) {
      setErrors('DEVICE-ID tidak ditemukan');
    }
  };

  const onChangeInput = (text, field) => {
    setUserpass({ ...userpass, [field]: text && text.toLowerCase() });
  };

  const onChangeThemes = useCallback(() => {
    const theme = mode === 'dark' ? 'light' : 'dark';
    dispatch(applyTheme(theme));
  }, [mode, dispatch]);

  const onUserlogin = async () => {
    setErrors(null);

    if (!userpass.username) {
      setErrors('Username anda belum terisi...');
      return;
    }

    if (userpass.username.length <= 2) {
      setErrors('Username anda harus lebih dari 2 karakter...');
      return;
    }

    if (!userpass.password) {
      setErrors('Kata kunci (password) anda belum terisi...');
      return;
    }

    if (userpass.password.length <= 5) {
      setErrors('Kata kunci anda harus lebih dari 5 karakter...');
      return;
    }

    dispatch(login(userpass));
  };

  useEffect(() => {
    if (error) {
      setErrors(error);
    }
  }, [error]);

  if (loading || syncing) {
    return (
      <AppScreen>
        <LoadingTruck message={syncing ? syncMessage : 'Memproses login...'} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView style={styles.scrollView}>
        <View style={styles.themeContainer}>
          <TouchableOpacity onPress={onChangeThemes}>
            <MaterialIcons
              name={mode === 'dark' ? 'light-mode' : 'dark-mode'}
              size={25}
              color={mode === 'dark' ? '#EAB308' : '#A8A29E'}
            />
          </TouchableOpacity>
          <Text style={[styles.themeText, { color: appmode.txtcolor[mode][2] }]}>
            tema
          </Text>
        </View>

        <View style={styles.centerContainer}>
          <Text style={[styles.versionText, { color: appmode.txtcolor[mode][1] }]}>
            version 1.0.1
          </Text>
          <Text style={[styles.titleText, { color: appmode.txtcolor[mode][1] }]}>
            LOGIN
          </Text>

          <Image
            source={require('../../assets/images/login-images.png')}
            style={styles.illustration}
            resizeMode="contain"
          />

          <Text style={[styles.subtitle, { color: appmode.txtcolor[mode][2] }]}>Selamat datang kembali</Text>
          <Text style={[styles.helper, { color: appmode.txtcolor[mode][3] }]}>Masuk untuk melanjutkan pekerjaan harian Anda</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={appmode.txtcolor[mode][2]}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Username"
                placeholderTextColor={appmode.txtcolor[mode][2]}
                value={userpass.username}
                onChangeText={(text) => onChangeInput(text, 'username')}
                style={[
                  styles.input,
                  {
                    color: appmode.txtcolor[mode][1],
                    borderColor: appmode.boxlinecolor[mode][1],
                  },
                ]}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={appmode.txtcolor[mode][2]}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor={appmode.txtcolor[mode][2]}
                value={userpass.password}
                onChangeText={(text) => onChangeInput(text, 'password')}
                secureTextEntry={!showpass}
                style={[
                  styles.input,
                  {
                    color: appmode.txtcolor[mode][1],
                    borderColor: appmode.boxlinecolor[mode][1],
                  },
                ]}
              />
              <TouchableOpacity
                onPress={() => setShowpass(!showpass)}
                style={styles.eyeIcon}>
                <Ionicons
                  name={showpass ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={appmode.txtcolor[mode][2]}
                />
              </TouchableOpacity>
            </View>

            {errors && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={onUserlogin}
              style={[
                styles.loginButton,
                { backgroundColor: appmode.txtcolor[mode][7], shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
              ]}>
              <Text style={styles.loginButtonText}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    height: '100%',
  },
  themeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    gap: 8,
  },
  themeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
  centerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  versionText: {
    fontFamily: 'Poppins-Light',
  },
  titleText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 10,
    letterSpacing: 1,
  },
  illustration: {
    width: '100%',
    height: 200,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginTop: 6,
  },
  helper: {
    fontFamily: 'Poppins-Light',
    fontSize: 13,
    marginTop: 2,
  },
  formContainer: {
    width: '100%',
    marginTop: 20,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 12,
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
  loginButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthLogin;