import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/src/components/AppScreen';
import AppHeader from '@/src/components/AppHeader';
import { useAppSelector, useAppDispatch } from '@/src/redux/hooks';
import appmode from '@/src/helpers/ThemesMode';
import moment from 'moment';
import {
  downloadAllMasterData,
  downloadSpecificData,
  clearDownloadStatus,
} from '@/src/redux/downloadSlice';
import { forceSyncMasterData } from '@/src/redux/syncSlice';



export default function DownloadDataScreen() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';
  
  const {
    downloadStatus,
    isDownloading,
    lastSyncTime,
    errors,
  } = useAppSelector(state => state.download);
  
  const { 
    lastSyncTime: globalLastSync,
    syncing: globalSyncing 
  } = useAppSelector(state => state.sync);

  const [refreshing, setRefreshing] = useState(false);
  const [spinAnim] = useState(new Animated.Value(0));

  // Data items yang akan didownload
  const dataItems = [
    { key: 'kategori', name: 'Kategori', icon: 'grid-outline' },
    { key: 'cabang', name: 'Cabang', icon: 'business-outline' },
    { key: 'penyewa', name: 'Penyewa', icon: 'people-outline' },
    { key: 'equipment', name: 'Equipment', icon: 'car-outline' },
    { key: 'shift', name: 'Shift', icon: 'time-outline' },
    { key: 'longshift', name: 'Longshift', icon: 'calendar-outline' },
    { key: 'kegiatan', name: 'Kegiatan', icon: 'list-outline' },
    { key: 'material', name: 'Material', icon: 'cube-outline' },
    { key: 'lokasi', name: 'Lokasi', icon: 'location-outline' },
    { key: 'koordinatChecklog', name: 'Koordinat Checklog', icon: 'navigate-circle-outline' },
    { key: 'timesheet', name: 'Timesheet Saya', icon: 'document-text-outline' },
  ];

  useEffect(() => {
    dispatch(clearDownloadStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isDownloading) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }
  }, [isDownloading, spinAnim]);

  const handleDownloadAll = async () => {
    try {
      setRefreshing(true);
      await dispatch(forceSyncMasterData()).unwrap();
      Alert.alert('Sukses', 'Semua data berhasil diperbaharui');
    } catch (error) {
      Alert.alert('Error', error || 'Gagal memperbaharui data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadItem = async (itemKey) => {
    try {
      await dispatch(downloadSpecificData(itemKey)).unwrap();
      Alert.alert('Sukses', `${itemKey} berhasil didownload`);
    } catch (_error) {
      Alert.alert('Error', `Gagal mendownload ${itemKey}`);
    }
  };

  const handleRetryItem = (itemKey) => {
    handleDownloadItem(itemKey);
  };

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(clearDownloadStatus());
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'loading': return '#3b82f6';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'loading': return 'sync';
      case 'pending': return 'time';
      default: return 'time';
    }
  };

  const renderSpinningIcon = (status) => {
    if (status === 'loading') {
      const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });
      return (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="sync" size={20} color="#3b82f6" />
        </Animated.View>
      );
    }
    return <Ionicons name={getStatusIcon(status)} size={20} color={getStatusColor(status)} />;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'Berhasil';
      case 'error': return 'Gagal';
      case 'loading': return 'Mengunduh...';
      case 'pending': return 'Menunggu';
      default: return 'Menunggu';
    }
  };

  const renderDataItem = (item) => {
    const status = downloadStatus[item.key] || 'pending';
    const count = downloadStatus[`${item.key}_count`] || 0;
    const error = errors[item.key];

    return (
      <View
        key={item.key}
        style={[
          styles.dataItem,
          {
            backgroundColor: isDark ? '#374151' : '#FFFFFF',
            borderColor: appmode.boxlinecolor[mode][1],
          },
        ]}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemLeft}>
            <Ionicons
              name={item.icon}
              size={24}
              color={appmode.txtcolor[mode][7]}
              style={styles.itemIcon}
            />
            <Text style={[styles.itemName, { color: appmode.txtcolor[mode][7] }]}>
              {item.name}
            </Text>
          </View>
          
          <View style={styles.itemRight}>
            {renderSpinningIcon(status)}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: getStatusColor(status),
                  width: status === 'loading' ? '50%' : status === 'success' ? '100%' : '0%',
                },
              ]}
            />
          </View>
        </View>

        {/* Status and Count */}
        <View style={styles.itemInfo}>
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            {getStatusText(status)}
          </Text>
          {count > 0 && (
            <Text style={[styles.countText, { color: appmode.txtcolor[mode][5] }]}>
              {count} data
            </Text>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: '#ef4444' }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: '#ef4444' }]}
              onPress={() => handleRetryItem(item.key)}
            >
              <Ionicons name="refresh" size={16} color="white" />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Button */}
        {status !== 'loading' && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                borderColor: appmode.boxlinecolor[mode][1],
              },
            ]}
            onPress={() => handleDownloadItem(item.key)}
          >
            <Text style={[styles.actionText, { color: appmode.txtcolor[mode][7] }]}>
              {status === 'success' ? 'Update' : 'Download'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <AppScreen>
      <AppHeader title="Download Data" prevPage={true} onChangeThemes={true} offlineCount={0} onOffline={() => {}} />
      
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#1f2937' : '#f2f4f7' },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Last Sync Info */}
        <View
          style={[
            styles.syncInfo,
            {
              backgroundColor: isDark ? '#374151' : '#FFFFFF',
            },
          ]}
        >
          <View style={styles.syncHeader}>
            <Ionicons
              name="sync-outline"
              size={20}
              color={appmode.txtcolor[mode][7]}
            />
            <Text style={[styles.syncTitle, { color: appmode.txtcolor[mode][7] }]}>
              Informasi Sinkronisasi
            </Text>
          </View>
          
          {(globalLastSync || lastSyncTime) ? (
            <>
              <Text style={[styles.syncTime, { color: appmode.txtcolor[mode][5] }]}>
                Terakhir sync: {moment(globalLastSync || lastSyncTime).format('DD MMM YYYY HH:mm:ss')}
              </Text>
              <Text style={[styles.syncDesc, { color: appmode.txtcolor[mode][5] }]}>
                Data akan otomatis diperbaharui saat login (TTL: 24 jam)
              </Text>
            </>
          ) : (
            <Text style={[styles.syncTime, { color: appmode.txtcolor[mode][5] }]}>
              Belum pernah melakukan sinkronisasi
            </Text>
          )}
        </View>

        {/* Download All Button */}
        <TouchableOpacity
          style={[
            styles.downloadAllButton,
            {
              backgroundColor: (isDownloading || globalSyncing) ? '#9ca3af' : '#10b981',
            },
          ]}
          onPress={handleDownloadAll}
          disabled={isDownloading || globalSyncing}
        >
          {(isDownloading || globalSyncing) ? (
            <>
              <Animated.View style={{ transform: [{ rotate: spinAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }) }] }}>
                <Ionicons name="sync" size={20} color="white" />
              </Animated.View>
              <Text style={styles.downloadAllText}>Memperbaharui Data...</Text>
            </>
          ) : (
            <>
              <Ionicons name="refresh-outline" size={20} color="white" />
              <Text style={styles.downloadAllText}>Perbaharui Semua Data</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Data Items List */}
        <View style={styles.dataList}>
          <Text style={[styles.sectionTitle, { color: appmode.txtcolor[mode][7] }]}>
            Data Master
          </Text>
          {dataItems.map(renderDataItem)}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  syncInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  syncTime: {
    fontSize: 14,
    marginLeft: 28,
  },
  syncDesc: {
    fontSize: 12,
    marginLeft: 28,
    marginTop: 4,
    fontStyle: 'italic',
  },
  downloadAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  downloadAllText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dataList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  dataItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  countText: {
    fontSize: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  spinningIcon: {
    // Note: React Native doesn't support CSS animations
    // We'll handle spinning with state in a real implementation
  },
});