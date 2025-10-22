import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { getEquipment } from '@/src/redux/equipmentSlice';
import appmode from '@/src/helpers/ThemesMode';
import apiFetch from '@/src/helpers/ApiFetch';
import AppScreen from '@/src/components/AppScreen';
import AppHeader from '@/src/components/AppHeader';
import LoadingTruck from '@/src/components/LoadingTruck';
import BtnMenuHome from '@/src/components/BtnMenuHome';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState({ in: '00', acc: '00', checklog: '00' });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);

  const mode = useAppSelector(state => state.themes.value);
  const { user, employee, token } = useAppSelector(state => state.auth);
  const shadowx = Platform.OS === 'ios' ? 3 : 0;
  const isDark = mode === 'light';

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
    }
  }, [token]);

  useEffect(() => {
    syncAllMasterData();
    onHandleCountTimesheet();
    const interval = setInterval(async () => {
      try {
        const SQLiteService = (await import('@/src/database/SQLiteService')).default;
        const list = await SQLiteService.outboxList();
        setOfflineCount(Array.isArray(list) ? list.length : 0);
      } catch (_e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const syncAllMasterData = useCallback(async () => {
    setRefreshing(true);

    try {
      await dispatch(getEquipment()).unwrap();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    syncAllMasterData();
    onHandleCountTimesheet();
  }, [syncAllMasterData]);

  const onHandleCountTimesheet = useCallback(async () => {
    if (!employee?.id) {
      return;
    }

    const qstring = {
      dateStart: moment().startOf('month').format('YYYY-MM-DD'),
      dateEnd: moment().endOf('month').format('YYYY-MM-DD'),
      karyawan_id: employee?.id,
    };

    try {
      const resp = await apiFetch.get(
        `operation/timesheet/${employee.id}/count`,
        { params: qstring },
      );
      const { masuk, acc, checklog } = resp.data.data;
      setCount({
        in: '0'.repeat(2 - `${masuk}`.length) + masuk,
        acc: '0'.repeat(2 - `${acc}`.length) + acc,
        checklog: '0'.repeat(2 - `${checklog}`.length) + checklog,
      });
    } catch (error) {
    }
  }, [employee]);

  const imageScale = Math.max(0.7, 1 - (scrollPosition / 100) * 0.3);
  const imageOpacity = Math.max(0.8, 1 - (scrollPosition / 100) * 0.2);

  if (refreshing && !employee) {
    return (
      <AppScreen>
        <LoadingTruck />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppHeader onChangeThemes={true} offlineCount={offlineCount} onOffline={() => router.push('/settings/gagal-kirim-screen')} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={event => {
          setScrollPosition(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.imageContainer}>
          <View
            style={{
              transform: [{ scale: imageScale }],
              opacity: imageOpacity,
            }}>
            {user?.usertype === 'driver' ? (
              <Image
                source={require('../../assets/images/IMG-DT.png')}
                style={styles.imageDriver}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../../assets/images/IMG-EXCA-BIG.png')}
                style={styles.imageOperator}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        <View style={styles.profileSection}>
          <Text
            style={[
              styles.nameText,
              { color: appmode.txtcolor[mode][1] },
            ]}>
            {employee?.nama || user?.nama_lengkap || '--'}
          </Text>
          <Text
            style={[
              styles.sectionText,
              { color: appmode.txtcolor[mode][1] },
            ]}>
            {employee?.section || user?.usertype || '--'}
          </Text>
          <Text
            style={[
              styles.phoneText,
              { color: appmode.txtcolor[mode][1] },
            ]}>
            {employee?.phone || user?.handphone || '--'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: isDark ? '#374151' : '#ffffff',
                borderColor: appmode.boxlinecolor[mode][1],
                shadowOpacity: shadowx > 0 ? 0.1 : 0,
                elevation: shadowx,
              },
            ]}>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statBadge,
                  { backgroundColor: isDark ? '#1F2937' : '#f3f4f6' },
                ]}>
                <Text
                  style={[
                    styles.statNumber,
                    { color: isDark ? '#60A5FA' : '#2563EB' },
                  ]}>
                  {count.in}
                </Text>
              </View>
              <Text
                style={[
                  styles.statLabel,
                  { color: appmode.txtcolor[mode][1] },
                ]}>
                TimeSheet
              </Text>
              <Text
                style={[
                  styles.statSubLabel,
                  { color: appmode.txtcolor[mode][5] },
                ]}>
                Masuk
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statBadge,
                  { backgroundColor: isDark ? '#064E3B' : '#D1FAE5' },
                ]}>
                <Text
                  style={[
                    styles.statNumber,
                    { color: isDark ? '#34D399' : '#059669' },
                  ]}>
                  {count.checklog}
                </Text>
              </View>
              <Text
                style={[
                  styles.statLabel,
                  { color: appmode.txtcolor[mode][1] },
                ]}>
                Checklog
              </Text>
              <Text
                style={[
                  styles.statSubLabel,
                  { color: appmode.txtcolor[mode][5] },
                ]}>
                Hadir
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statBadge,
                  { backgroundColor: isDark ? '#7C2D12' : '#FED7AA' },
                ]}>
                <Text
                  style={[
                    styles.statNumber,
                    { color: isDark ? '#FB923C' : '#EA580C' },
                  ]}>
                  {count.acc}
                </Text>
              </View>
              <Text
                style={[
                  styles.statLabel,
                  { color: appmode.txtcolor[mode][1] },
                ]}>
                TimeSheet
              </Text>
              <Text
                style={[
                  styles.statSubLabel,
                  { color: appmode.txtcolor[mode][5] },
                ]}>
                Approved
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <View style={styles.menuRow}>
            <BtnMenuHome
              routeTo="/timesheet"
              title="TimeSheet"
              uriPhoto={require('../../assets/images/schedules.png')}
            />
            <View style={{ width: 12 }} />
            <BtnMenuHome
              routeTo="/insentif"
              title="Insentif"
              uriPhoto={require('../../assets/images/money.png')}
            />
            <View style={{ width: 12 }} />
            <BtnMenuHome
              routeTo="/absensi"
              title="Absensi"
              uriPhoto={require('../../assets/images/finger-mechine.png')}
            />
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 200,
    paddingBottom: 8,
  },
  imageDriver: {
    height: 210,
    width: 290,
  },
  imageOperator: {
    height: 200,
    width: '100%',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  nameText: {
    fontSize: 26,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    textTransform: 'capitalize',
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '300',
    fontFamily: 'Poppins-Light',
  },
  statsContainer: {
    marginHorizontal: 12,
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBadge: {
    borderRadius: 50,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Roboto-Medium',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Light',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 80,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
});