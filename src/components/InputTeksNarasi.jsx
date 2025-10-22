import appmode from '@/src/helpers/ThemesMode';
import { useAppSelector } from '@/src/redux/hooks';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function InputTeksNarasi({
  label,
  value,
  onChangeText,
  placeholder = 'Masukkan teks',
  error,
  required = false,
  multiline = true,
  numberOfLines = 4,
  editable = true,
  maxLength,
}) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode != 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.label,
            { color: appmode.txtcolor[mode][1] },
          ]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>
      
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#374151' : '#FFFFFF',
            borderColor: error 
              ? '#dc2626' 
              : appmode.boxlinecolor[mode][1],
            color: appmode.txtcolor[mode][1],
          },
          multiline && styles.multilineInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={appmode.txtcolor[mode][2]}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        maxLength={maxLength}
        textAlignVertical="top"
      />
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
      
      {maxLength && (
        <Text
          style={[
            styles.charCount,
            { color: appmode.txtcolor[mode][2] },
          ]}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
  },
  required: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    minHeight: 50,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
    fontFamily: 'Roboto-Regular',
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    textAlign: 'right',
    marginTop: 4,
  },
});