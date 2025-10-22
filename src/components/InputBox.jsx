import appmode from '@/src/helpers/ThemesMode';
import { useAppSelector } from '@/src/redux/hooks';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InputBox({
  label,
  value,
  onPress,
  error,
  disabled = false,
  flex = 1,
}) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode !== 'dark';

  const Component = onPress && !disabled ? TouchableOpacity : View;

  return (
    <View style={{ flex }}>
      <Component
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.container,
          {
            borderColor: error
              ? '#ef4444'
              : appmode.boxlinecolor[mode][1],
            backgroundColor: isDark ? '#374151' : '#FFFFFF',
            opacity: disabled ? 0.7 : 1,
          },
        ]}>
        <Text
          style={[
            styles.label,
            { color: appmode.txtcolor[mode][3] },
          ]}>
          {label}
        </Text>
        <Text
          style={[
            styles.value,
            { color: appmode.txtcolor[mode][3] },
          ]}
          numberOfLines={1}>
          {value || '-'}
        </Text>
      </Component>
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderRadius: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    fontWeight: '300',
  },
  value: {
    fontFamily: 'Poppins-Medium',
    fontWeight: '700',
    fontSize: 18,
  },
  error: {
    fontSize: 10,
    color: '#ef4444',
    marginTop: 4,
    fontFamily: 'Poppins-Light',
  },
});