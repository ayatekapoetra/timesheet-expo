import AppHeader from '@/src/components/AppHeader';
import AppScreen from '@/src/components/AppScreen';
import appmode from '@/src/helpers/ThemesMode';
import { logout } from '@/src/redux/authSlice';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { applyTheme } from '@/src/redux/themeSlice';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const menuItems = [
  {
    key: 1,
    title: 'Profile Saya',
    icon: 'circle-user',
    uri: '/settings/profile-saya-screen',
  },
  {
    key: 2,
    title: 'Keamanan Akun',
    icon: 'lock',
    uri: '/keamanan-akun',
  },
  {
    key: 3,
    title: 'Notifikasi',
    icon: 'bell',
    uri: '/notifikasi',
  },
  {
    key: 4,
    title: 'Internal Memo',
    icon: 'bullhorn',
    uri: '/internal-memo',
  },
  {
    key: 5,
    title: 'Gagal Kirim',
    icon: 'satellite-dish',
    uri: '/settings/gagal-kirim-screen',
  },
  {
    key: 6,
    title: 'Riwayat Kehadiran',
    icon: 'clock-rotate-left',
    uri: '/riwayat-kehadiran',
  },
  {
    key: 7,
    title: 'Ganti Thema',
    icon: 'palette',
    uri: '#theme',
  },
  {
    key: 8,
    title: 'Download Data Options',
    icon: 'download',
    uri: '/settings/download-data-screen',
  },
  {
    key: 10,
    title: 'Keluar',
    icon: 'power-off',
    uri: '#logout',
  },
];

export default function SettingPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const mode = useAppSelector(state => state.themes.value);
  const { user, employee } = useAppSelector(state => state.auth);
  const isDark = mode === 'light';

  const handleMenuPress = async (item) => {
    if (item.uri === '#logout') {
      Alert.alert(
        'Keluar',
        'Apakah Anda yakin ingin keluar dari aplikasi?',
        [
          {
            text: 'Batal',
            style: 'cancel',
          },
          {
            text: 'Keluar',
            onPress: async () => {
              await dispatch(logout());
              router.replace('/auth/login');
            },
          },
        ]
      );
    } else if (item.uri === '#theme') {
      const newTheme = mode === 'dark' ? 'light' : 'dark';
      dispatch(applyTheme(newTheme));
      await AsyncStorage.setItem('@color-mode', newTheme);
    } else {
      router.push(item.uri);
    }
  };

  return (
    <AppScreen>
      <AppHeader onChangeThemes={true} />
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' },
        ]}>
        <View style={styles.profileSection}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: appmode.boxcolor[mode][1] },
            ]}>
            <FontAwesome6
              name="user"
              size={40}
              color={appmode.txtcolor[mode][1]}
            />
          </View>
          <Text
            style={[
              styles.profileName,
              { color: appmode.txtcolor[mode][1] },
            ]}>
            {employee?.nama || user?.nama_lengkap || 'User'}
          </Text>
          <Text
            style={[
              styles.profileRole,
              { color: appmode.txtcolor[mode][2] },
            ]}>
            {employee?.section || user?.usertype || ''}
          </Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => handleMenuPress(item)}
              style={[
                styles.menuItem,
                {
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  borderColor: appmode.boxlinecolor[mode][1],
                },
              ]}>
              <View style={styles.menuLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isDark
                        ? '#1F2937'
                        : appmode.container[mode],
                    },
                  ]}>
                  <FontAwesome6
                    name={item.icon}
                    size={20}
                    color={appmode.txtcolor[mode][1]}
                  />
                </View>
                <Text
                  style={[
                    styles.menuText,
                    { color: appmode.txtcolor[mode][1] },
                  ]}>
                  {item.title}
                </Text>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={16}
                color={appmode.txtcolor[mode][2]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: appmode.txtcolor[mode][2] },
            ]}>
            Version 1.0.1
          </Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  profileRole: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
  },
  menuContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
  },
});