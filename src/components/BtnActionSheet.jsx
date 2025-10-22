import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppSelector } from '@/src/redux/hooks';
import appmode from '@/src/helpers/ThemesMode';

export default function BtnActionSheet({
  title,
  onPress,
  type = 'primary',
  disabled = false,
  style,
  icon,
  loading = false,
}) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';

  const getButtonStyle = () => {
    const baseStyle = {
      backgroundColor: isDark ? '#374151' : '#FFFFFF',
      borderColor: appmode.boxlinecolor[mode][1],
    };

    switch (type) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: appmode.txtcolor[mode][7],
        };
      case 'secondary':
        return baseStyle;
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#dc2626',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'primary':
        return {
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          color: appmode.txtcolor[mode][1],
        };
      case 'danger':
        return {
          color: '#FFFFFF',
        };
      default:
        return {
          color: appmode.txtcolor[mode][1],
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.buttonText,
          getTextStyle(),
          disabled && styles.disabledText,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});