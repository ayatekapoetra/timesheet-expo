import appmode from '@/src/helpers/ThemesMode';
import { useAppSelector } from '@/src/redux/hooks';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function InputNumeric({
  label,
  value,
  onChangeText,
  error,
  disabled = false,
  flex = 1,
  placeholder = '0',
}) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode !== 'dark';

  return (
    <View style={{ flex }}>
      <View
        style={[
          styles.container,
          {
            borderColor: error ? '#ef4444' : appmode.boxlinecolor[mode][1],
            backgroundColor: isDark ? '#374151' : '#FFFFFF',
            opacity: disabled ? 0.7 : 1,
          },
        ]}>
        <Text style={[styles.label, { color: appmode.txtcolor[mode][3] }]}>
          {label}
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: appmode.txtcolor[mode][3] },
          ]}
          value={value?.toString() || ''}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor={appmode.txtcolor[mode][2]}
          editable={!disabled}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
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
  input: {
    fontFamily: 'Poppins-Medium',
    fontWeight: '700',
    fontSize: 18,
    padding: 0,
    margin: 0,
  },
  error: {
    fontSize: 10,
    color: '#ef4444',
    marginTop: 4,
    fontFamily: 'Poppins-Light',
  },
});