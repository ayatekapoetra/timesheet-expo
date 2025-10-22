import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import appmode from '../helpers/ThemesMode';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { toggleTheme } from '../redux/themeSlice';
import networkService from '../services/NetworkService';

const AppHeader = ({
  title,
  prevPage,
  onChangeThemes,
  onOffline,
  onSearch,
  onPrevPress,
  offlineCount = null,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const mode = useAppSelector(state => state.themes.value);
  const isAndroid = Platform.OS == 'android'

  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(null);
  const isDark = mode === 'dark';

  const onBackHandle = () => {
    if (onPrevPress) {
      onPrevPress();
    } else {
      router.back();
    }
  };

  const handleOfflinePress = () => {
    if (onOffline) return onOffline();
    router.push('/settings/gagal-kirim-screen');
  };

  React.useEffect(() => {
    let unsub = networkService.subscribe(setIsOnline);
    let timer = setInterval(async () => {
      try {
        const SQLiteService = (await import('@/src/database/SQLiteService')).default;
        const list = await SQLiteService.outboxList();
        setPendingCount(Array.isArray(list) ? list.length : 0);
      } catch (_e) {
        setPendingCount(0);
      }
    }, 7000);
    return () => {
      try { unsub && unsub(); } catch {}
      clearInterval(timer);
    };
  }, []);

  const handleChangeThemes = async () => {
    const setMode = mode === 'dark' ? 'light' : 'dark';
    dispatch(toggleTheme());
    await AsyncStorage.setItem('@color-mode', setMode);
  };



  return (
    <View
      style={[
        styles.container,
        {
          marginTop: isAndroid ? 25 : 0,
          backgroundColor: appmode.container[mode],
          borderBottomColor: appmode.container[mode],
        },
      ]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {prevPage && title ? (
            <TouchableOpacity onPress={onBackHandle}>
              <View style={styles.backButton}>
                <Feather
                  name="chevron-left"
                  size={25}
                  color={appmode.txtcolor[mode][1]}
                />
                <Text
                  style={[
                    styles.titleText,
                    { color: appmode.txtcolor[mode][1] },
                  ]}>
                  {title}
                </Text>
              </View>
            </TouchableOpacity>
          ) : title ? (
            <Text
              style={[
                styles.titleText,
                { color: appmode.txtcolor[mode][1] },
              ]}>
              {title}
            </Text>
          ) : null}
        </View>

         <View style={styles.rightSection}>
          {onSearch && (
            <TouchableOpacity onPress={onSearch} style={styles.iconSpacing}>
              <Ionicons
                name="filter"
                size={25}
                color={appmode.txtcolor[mode][1]}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleOfflinePress} style={styles.iconSpacing}>
            <View>
              <MaterialCommunityIcons
                name={isOnline ? 'cloud-check-outline' : 'cloud-off-outline'}
                size={25}
                color={isOnline ? '#10B981' : '#F59E0B'}
              />
              {((offlineCount ?? pendingCount) ?? null) !== null && (offlineCount ?? pendingCount) > 0 && (
                <View style={[styles.badge, { backgroundColor: '#EF4444' }]}> 
                  <Text style={styles.badgeText}>{(offlineCount ?? pendingCount) > 99 ? '99+' : (offlineCount ?? pendingCount)}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {onChangeThemes && (
            <TouchableOpacity onPress={handleChangeThemes} style={styles.iconSpacing}>
              <MaterialIcons
                name={isDark ? 'dark-mode' : 'light-mode'}
                size={25}
                color={isDark ? '#78716C' : '#EAB308'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    marginTop: 20,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 2,
    alignItems: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: 'Poppins-Light',
    fontSize: 17,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconSpacing: {
    marginLeft: 12,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
export default AppHeader;