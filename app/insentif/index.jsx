import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/src/components/AppScreen';
import AppHeader from '@/src/components/AppHeader';
import { useAppSelector } from '@/src/redux/hooks';
import appmode from '@/src/helpers/ThemesMode';

export default function InsentifPage() {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';

  return (
    <AppScreen>
      <AppHeader title="Insentif" prevPage={true} onChangeThemes={true} />
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' },
        ]}>
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: appmode.txtcolor[mode][1] },
            ]}>
            Insentif & Bonus
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: appmode.txtcolor[mode][2] },
            ]}>
            Perhitungan insentif berdasarkan kinerja
          </Text>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: isDark ? '#374151' : '#FFFFFF',
                borderColor: appmode.boxlinecolor[mode][1],
              },
            ]}>
            <View style={styles.summaryHeader}>
              <Ionicons
                name="wallet"
                size={32}
                color={appmode.txtcolor[mode][7]}
              />
              <Text
                style={[
                  styles.summaryTitle,
                  { color: appmode.txtcolor[mode][1] },
                ]}>
                Total Insentif Bulan Ini
              </Text>
            </View>
            <Text
              style={[
                styles.summaryAmount,
                { color: appmode.txtcolor[mode][6] },
              ]}>
              Rp 0
            </Text>
            <Text
              style={[
                styles.summaryNote,
                { color: appmode.txtcolor[mode][2] },
              ]}>
              Berdasarkan perhitungan timesheet dan kehadiran
            </Text>
          </View>

          <View style={styles.detailContainer}>
            <Text
              style={[
                styles.sectionTitle,
                { color: appmode.txtcolor[mode][1] },
              ]}>
              Rincian Perhitungan
            </Text>
            
            <View
              style={[
                styles.detailCard,
                {
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  borderColor: appmode.boxlinecolor[mode][1],
                },
              ]}>
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: appmode.txtcolor[mode][2] },
                  ]}>
                  Insentif Kehadiran
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: appmode.txtcolor[mode][1] },
                  ]}>
                  Rp 0
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: appmode.txtcolor[mode][2] },
                  ]}>
                  Insentif Produktivitas
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: appmode.txtcolor[mode][1] },
                  ]}>
                  Rp 0
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: appmode.txtcolor[mode][2] },
                  ]}>
                  Bonus Lembur
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: appmode.txtcolor[mode][1] },
                  ]}>
                  Rp 0
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 20,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 32,
    fontFamily: 'Roboto-Medium',
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryNote: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
  },
  detailContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  detailCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
});