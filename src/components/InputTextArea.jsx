import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useAppSelector } from '@/src/redux/hooks';
import appmode from '@/src/helpers/ThemesMode';

export default function InputTextArea({
  label,
  value,
  onChangeText,
  error,
  disabled = false,
  placeholder = 'Tulis keterangan...',
  numberOfLines = 4,
}) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'dark';

  return (
    <View>
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
            { 
              color: appmode.txtcolor[mode][3],
              height: numberOfLines * 20,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={appmode.txtcolor[mode][2]}
          editable={!disabled}
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderRadius: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    fontWeight: '300',
    marginBottom: 4,
  },
  input: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
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