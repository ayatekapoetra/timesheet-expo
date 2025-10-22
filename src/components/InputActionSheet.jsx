import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/src/redux/hooks';
import appmode from '@/src/helpers/ThemesMode';

export default function InputActionSheet({
  label,
  value,
  onPress,
  error,
  required = false,
  icon,
  placeholder = 'Pilih opsi',
  editable = true,
}) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';

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
      
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#374151' : '#FFFFFF',
            borderColor: error 
              ? '#dc2626' 
              : appmode.boxlinecolor[mode][1],
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={appmode.txtcolor[mode][2]} 
            style={styles.icon} 
          />
        )}
        <Text
          style={[
            styles.inputText,
            {
              color: value 
                ? appmode.txtcolor[mode][1] 
                : appmode.txtcolor[mode][2],
            },
          ]}>
          {value || placeholder}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={16} 
          color={appmode.txtcolor[mode][2]} 
        />
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>
          {error}
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
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
    fontFamily: 'Roboto-Regular',
  },
});