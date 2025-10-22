import AppHeader from '@/src/components/AppHeader';
import AppScreen from '@/src/components/AppScreen';
import appmode from '@/src/helpers/ThemesMode';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';

export default function ProfileSayaScreen() {
  const [form, setForm] = useState({});
  const handleChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const handleSave = () => {
    const payload = {
      email: form.email ?? employee?.email,
      phone: form.phone ?? employee?.phone,
      alamat: form.alamat ?? employee?.alamat,
      pendidikan: form.pendidikan ?? employee?.pendidikan,
    };
    dispatch(require('@/src/redux/authSlice').updateEmployeeLocal(payload));
    setOpenEdit(false);
  };
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.themes.value);
  const { user, employee } = useAppSelector((s) => s.auth);
  const isDark = mode === 'light';
  const [openEdit, setOpenEdit] = useState(false);

  

  const profile = useMemo(() => ({
    name: employee?.nama || user?.nama_lengkap || user?.name || '-',
    username: user?.username || '-',
    email: user?.email || '-',
    phone: employee?.phone || '-',
    code: employee?.nik || '-',
    jabatan: employee?.jabatan || user?.usertype || '-',
    ktp: employee?.ktp || '-',
    branch: employee?.cabang?.nama || '-',
    company: employee?.bisnis?.name || '-',
    join: employee?.tgl_gabung ? moment(employee?.tgl_gabung).format('DD MMM YYYY') : '-',
    status: employee?.sts_karyawan || '-',
    alamat: employee?.alamat || '-',
    nm_bank: employee?.nm_bank || '-',
    an_rekening: employee?.an_rekening || '-',
    no_rekening: employee?.no_rekening || '-',
    t4_lahir: employee?.t4_lahir || '-',
    tgl_lahir: employee?.tgl_lahir ? moment(employee?.tgl_lahir).format('DD MMM YYYY') : '-',
    sts_nikah: employee?.sts_nikah || '-',
    pendidikan: employee?.pendidikan || '-',
    tanggungan: employee?.tanggungan?.toString?.() || employee?.tanggungan || '-',
    agama: employee?.agama || '-',
  }), [user, employee]);

  return (
    <AppScreen>
      <AppHeader title="Profil Saya" prevPage={true} onChangeThemes={true} />
      <ScrollView style={[styles.container, { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' }]}>
        <View style={styles.headerCard}>
          <View style={[styles.avatar, { backgroundColor: appmode.boxcolor[mode][1] }]}>
            <FontAwesome6 name="user" size={48} color={appmode.txtcolor[mode][1]} />
          </View>
          <Text style={[styles.name, { color: appmode.txtcolor[mode][1] }]}>{profile.name}</Text>
          <Text style={[styles.role, { color: appmode.txtcolor[mode][2] }]}>{profile.jabatan}</Text>
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: isDark ? '#374151' : appmode.container[mode] }]}>
              <Ionicons name="call-outline" size={14} color={appmode.txtcolor[mode][2]} />
              <Text style={[styles.tagText, { color: appmode.txtcolor[mode][2] }]}>{profile.phone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickRow}>
          <View style={[styles.quickCard, { backgroundColor: isDark ? '#111827' : '#ffffff', borderColor: appmode.boxlinecolor[mode][1] }]}>
            <Text style={[styles.quickLabel, { color: appmode.txtcolor[mode][2] }]}>Employee Code</Text>
            <Text style={[styles.quickValue, { color: appmode.txtcolor[mode][1] }]}>{profile.code}</Text>
          </View>
          <View style={[styles.quickCard, { backgroundColor: isDark ? '#111827' : '#ffffff', borderColor: appmode.boxlinecolor[mode][1] }]}>
            <Text style={[styles.quickLabel, { color: appmode.txtcolor[mode][2] }]}>Cabang</Text>
            <Text style={[styles.quickValue, { color: appmode.txtcolor[mode][1] }]}>{profile.branch}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appmode.txtcolor[mode][1] }]}>Informasi Akun</Text>
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#111827' : '#ffffff', borderColor: appmode.boxlinecolor[mode][1] }]}>
            <Row icon="id-card" label="Username" value={profile.username} mode={mode} />
            <Row icon="envelope" label="Email" value={profile.email} mode={mode} />
            <Row icon="building" label="Perusahaan" value={profile.company} mode={mode} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appmode.txtcolor[mode][1] }]}>Informasi Bank</Text>
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#111827' : '#ffffff', borderColor: appmode.boxlinecolor[mode][1] }]}>
            <Row icon="building-columns" label="Bank" value={profile.nm_bank} mode={mode} />
            <Row icon="id-badge" label="Atas Nama" value={profile.an_rekening} mode={mode} />
            <Row icon="hashtag" label="No. Rekening" value={profile.no_rekening} mode={mode} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appmode.txtcolor[mode][1] }]}>Informasi Karyawan</Text>
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#111827' : '#ffffff', borderColor: appmode.boxlinecolor[mode][1] }]}>
            <Row icon="user-tie" label="Jabatan" value={profile.jabatan} mode={mode} />
            <Row icon="users" label="No. Identitas" value={profile.ktp} mode={mode} />
            <Row icon="circle-check" label="Status" value={profile.status} mode={mode} />
            <Row icon="location-dot" label="Alamat" value={profile.alamat} mode={mode} />
            <Row icon="calendar" label="Join Date" value={profile.join} mode={mode} />
            <Row icon="location-dot" label="Tempat Lahir" value={profile.t4_lahir} mode={mode} />
            <Row icon="calendar" label="Tanggal Lahir" value={profile.tgl_lahir} mode={mode} />
            <Row icon="ring" label="Status Nikah" value={profile.sts_nikah} mode={mode} />
            <Row icon="graduation-cap" label="Pendidikan" value={profile.pendidikan} mode={mode} />
            <Row icon="children" label="Tanggungan" value={profile.tanggungan} mode={mode} />
            <Row icon="hands-praying" label="Agama" value={profile.agama} mode={mode} />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]} onPress={() => setOpenEdit(true)}>
            <FontAwesome6 name="pen" size={14} color="#fff" />
            <Text style={styles.primaryText}>Edit Profil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <Modal visible={openEdit} transparent animationType="slide" onRequestClose={() => setOpenEdit(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
          <View style={[styles.modalCardTop, { backgroundColor: isDark ? '#111827' : '#ffffff', borderColor: appmode.boxlinecolor[mode][1] }]}>
            <Text style={[styles.modalTitle, { color: appmode.txtcolor[mode][1] }]}>Edit Profil</Text>

            <Field label="Email" valueKey="email" defaultValue={profile.email} mode={mode} onChange={handleChange} />
            <Field label="No. HP" valueKey="phone" defaultValue={profile.phone} mode={mode} onChange={handleChange} />
            <Field label="Alamat" valueKey="alamat" defaultValue={profile.alamat} mode={mode} multiline onChange={handleChange} />
            <Field label="Pendidikan" valueKey="pendidikan" defaultValue={profile.pendidikan || ''} mode={mode} onChange={handleChange} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: appmode.boxlinecolor[mode][1] }]} onPress={() => setOpenEdit(false)}>
                <Text style={[styles.modalBtnText, { color: appmode.txtcolor[mode][1] }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnPrimary, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]} onPress={() => handleSave()}>
                <Text style={styles.modalBtnPrimaryText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </AppScreen>
  );
}

function Field({ label, valueKey, defaultValue, mode, multiline, onChange }) {
  const [val, setVal] = useState(defaultValue || '');
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, color: appmode.txtcolor[mode][2], marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={val}
        onChangeText={(t) => { setVal(t); onChange?.(valueKey, t); }}
        multiline={!!multiline}
        numberOfLines={multiline ? 3 : 1}
        style={{
          borderWidth: 1,
          borderColor: appmode.boxlinecolor[mode][1],
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 10 : 8,
          color: appmode.txtcolor[mode][1],
          backgroundColor: mode === 'light' ? '#111827' : '#ffffff'
        }}
        placeholder={label}
        placeholderTextColor={appmode.txtcolor[mode][2]}
      />
    </View>
  );
}

function Row({ icon, label, value, mode }) {
  const isDark = mode === 'light';
  return (
    <View style={styles.row}>
      <View style={[styles.rowIconBox, { backgroundColor: isDark ? '#1F2937' : appmode.container[mode] }]}>
        <FontAwesome6 name={icon} size={14} color={appmode.txtcolor[mode][1]} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: appmode.txtcolor[mode][2] }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: appmode.txtcolor[mode][1] }]}>{value || '-'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 20, fontFamily: 'Poppins-Medium', fontWeight: '600' },
  role: { fontSize: 14, fontFamily: 'Poppins-Light' },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagText: { fontSize: 12 },
  quickRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  quickCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14 },
  quickLabel: { fontSize: 12 },
  quickValue: { fontSize: 16, fontFamily: 'Poppins-Medium', marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-Medium', marginBottom: 10 },
  infoCard: { borderWidth: 1, borderRadius: 12, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowContent: { marginLeft: 12, flex: 1 },
  rowLabel: { fontSize: 12 },
  rowValue: { fontSize: 15, fontFamily: 'Poppins-Medium', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 20 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, flex: 1, justifyContent: 'center' },
  primaryText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-Medium' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, flex: 1, justifyContent: 'center', borderWidth: 1 },
  secondaryText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  spacer: { height: 40 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-start', padding: 16, paddingTop: 40 },
  modalCard: { borderWidth: 1, borderRadius: 12, padding: 16 },
  modalCardTop: { borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 20 }, 
  modalTitle: { fontSize: 16, fontFamily: 'Poppins-Medium', marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8, justifyContent: 'flex-end' },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  modalBtnText: { fontFamily: 'Poppins-Medium', fontSize: 14 },
  modalBtnPrimary: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  modalBtnPrimaryText: { color: '#fff', fontFamily: 'Poppins-Medium', fontSize: 14 }
});