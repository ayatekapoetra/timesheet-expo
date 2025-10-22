import AppHeader from '@/src/components/AppHeader';
import AppScreen from '@/src/components/AppScreen';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { submitTimesheet } from '@/src/redux/timesheetItemSlice';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';

export default function GagalKirimScreen() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.themes.value);
  const isDark = mode === 'light';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  const loadOutbox = async () => {
    setLoading(true);
    try {
      const SQLiteService = (await import('@/src/database/SQLiteService')).default;
      const all = await SQLiteService.outboxList();
      setItems(all || []);
    } catch (_e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const generateDummyTimesheet = async () => {
    try {
      const SQLiteService = (await import('@/src/database/SQLiteService')).default;
      for (let i = 0; i < 5; i++) {
        const payload = {
          kode: `TS-DUMMY-${1000 + i}`,
          tanggal: '2025-10-18',
          kategori: 'Mining',
          penyewa_id: 48,
          equipment_id: 48,
          shift_id: 1,
          operator_id: 1601,
          smustart: 2000 + i * 10,
          smufinish: 2100 + i * 10,
          usedsmu: 100,
          bbm: 0,
          keterangan: 'Dummy offline payload',
          status: 'draft',
          kegiatan: [
            {
              id: `keg_${Date.now()}_${i}`,
              kegiatan_id: 1,
              kegiatan_nama: 'Hauling',
              material_id: 1,
              material_nama: 'OB',
              lokasi_asal_id: 1,
              lokasi_asal_nama: 'PIT 1',
              lokasi_tujuan_id: 2,
              lokasi_tujuan_nama: 'SP',
              starttime: '2025-10-18 07:00',
              endtime: '2025-10-18 09:00',
              smustart: 2000,
              smufinish: 2010,
              quantity: 10,
              timetot: 2,
            },
          ],
        };
        const key = `timesheet_${Date.now()}_${Math.random()}`;
        await SQLiteService.outboxEnqueue('timesheet', key, payload);
      }
      await loadOutbox();
      Alert.alert('Sukses', 'Dummy data berhasil ditambahkan ke antrian');
    } catch (e) {
      Alert.alert('Error', 'Gagal membuat dummy data');
    }
  };

  useEffect(() => { loadOutbox(); }, []);

  return (
    <AppScreen>
      <AppHeader title="Gagal Kirim" prevPage={true} onChangeThemes={true} />
      <ScrollView 
        style={[styles.container, { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadOutbox} />}
      > 
        {items.map((it) => (
          <View key={it.id} style={[styles.card, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: '#e5e7eb' }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.feature, { color: '#6b7280' }]}>{it.feature}</Text>
              <Text style={[styles.status, { color: it.status === 'pending' ? '#F59E0B' : '#10B981' }]}>{it.status}</Text>
            </View>
            <Text style={[styles.payload, { color: '#9ca3af' }]} numberOfLines={3}>{it.payload}</Text>
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: '#2563eb', opacity: resendingId === it.id ? 0.6 : 1 }]}
                disabled={!!resendingId}
                onPress={async () => {
                  try {
                    setResendingId(it.id);
                    const SQLiteService = (await import('@/src/database/SQLiteService')).default;
                    const payload = JSON.parse(it.payload);
                    const result = await dispatch(submitTimesheet(payload));
                    if (result.meta.requestStatus === 'fulfilled') {
                      await SQLiteService.outboxDelete(it.id);
                      await loadOutbox();
                      Alert.alert('Sukses', 'Data berhasil dikirim ulang');
                    } else {
                      // Jadwalkan ulang next retry +10 menit dan simpan pesan error
                      const now = Math.floor(Date.now()/1000);
                      const nextRetryAt = now + 600;
                      await SQLiteService.db.runAsync(
                        `UPDATE outbox SET next_retry_at = ?, err_message = ?, retry_count = retry_count + 1, updated_at = strftime('%s','now') WHERE id = ?`,
                        [nextRetryAt, result.payload || result.error?.message || 'Gagal kirim', it.id]
                      );
                      await loadOutbox();
                      Alert.alert('Gagal', result.payload || 'Gagal kirim, akan dicoba lagi nanti');
                    }
                  } catch (_e) {
                    Alert.alert('Error', 'Terjadi kesalahan saat kirim ulang');
                  } finally {
                    setResendingId(null);
                  }
                }}
              >
                <Text style={styles.btnText}>{resendingId === it.id ? 'Mengirim...' : 'Kirim Ulang'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnOutline, { borderColor: '#ef4444' }]} onPress={async () => { try { const SQLiteService = (await import('@/src/database/SQLiteService')).default; await SQLiteService.outboxDelete(it.id); loadOutbox(); } catch (_e) {} }}>
                <Text style={[styles.btnTextOutline, { color: '#ef4444' }]}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {(!items || items.length === 0) && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#6b7280' }}>Tidak ada data antrian</Text>
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({

  container: { flex: 1, padding: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  feature: { fontSize: 12 },
  status: { fontSize: 12, fontWeight: '700' },
  payload: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnOutline: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  btnTextOutline: { fontWeight: '700' },
});