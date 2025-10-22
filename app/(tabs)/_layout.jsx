import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '@/src/redux/hooks';

export default function TabLayout() {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#ef981e' : '#f09d27',
        tabBarInactiveTintColor: isDark ? '#C4C4C4' : '#404441',
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#F5F5F5',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 11,
          marginBottom: 4,
        },
      }}>
      <Tabs.Screen
        name="penugasan"
        options={{
          title: 'TugasKu',
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? 'clipboard-check' : 'clipboard-check-outline'}
              size={focused ? 32 : 28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Menu Utama',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'apps' : 'apps-outline'}
              size={focused ? 32 : 28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Pengaturan',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={focused ? 32 : 28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}