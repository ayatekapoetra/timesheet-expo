import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AppScreen from '@/src/components/AppScreen';
import AppHeader from '@/src/components/AppHeader';
import { useAppSelector } from '@/src/redux/hooks';
import appmode from '@/src/helpers/ThemesMode';

export default function PenugasanPage() {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';

  return (
    <AppScreen>
      <AppHeader onChangeThemes={true} />
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
            Tugas & Penugasan
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: appmode.txtcolor[mode][2] },
            ]}>
            Halaman ini menampilkan daftar tugas yang diberikan kepada Anda
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
  },
});