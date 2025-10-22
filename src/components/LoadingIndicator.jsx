import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/src/redux/hooks';
import appmode from '@/src/helpers/ThemesMode';

const LoadingIndicator = ({ 
  size = 'small', 
  color, 
  text, 
  fullScreen = false,
  transparent = false 
}) => {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';
  
  const indicatorColor = color || appmode.txtcolor[mode][7];
  
  if (fullScreen) {
    return (
      <View style={[
        styles.fullScreenContainer,
        { backgroundColor: transparent ? 'rgba(0,0,0,0.5)' : (isDark ? '#1F2937' : '#f2f4f7') }
      ]}>
        <View style={[
          styles.loadingBox,
          { backgroundColor: isDark ? '#374151' : '#FFFFFF' }
        ]}>
          <ActivityIndicator size="large" color={indicatorColor} />
          {text && (
            <Text style={[styles.loadingText, { color: appmode.txtcolor[mode][7] }]}>
              {text}
            </Text>
          )}
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={indicatorColor} />
      {text && (
        <Text style={[styles.inlineText, { color: appmode.txtcolor[mode][5] }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

export const LoadingOverlay = ({ visible, text }) => {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';
  
  if (!visible) return null;
  
  return (
    <View style={styles.overlay}>
      <View style={[
        styles.overlayBox,
        { backgroundColor: isDark ? '#374151' : '#FFFFFF' }
      ]}>
        <ActivityIndicator size="large" color={appmode.txtcolor[mode][7]} />
        {text && (
          <Text style={[styles.overlayText, { color: appmode.txtcolor[mode][7] }]}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

export const LoadingButton = ({ loading, text, loadingText }) => {
  const mode = useAppSelector(state => state.themes.value);
  
  return (
    <View style={styles.buttonContent}>
      {loading && (
        <ActivityIndicator 
          size="small" 
          color="#FFFFFF" 
          style={styles.buttonSpinner} 
        />
      )}
      <Text style={styles.buttonText}>
        {loading ? (loadingText || 'Loading...') : text}
      </Text>
    </View>
  );
};

export const EmptyState = ({ 
  icon = 'folder-open-outline', 
  title, 
  description,
  actionText,
  onAction 
}) => {
  const mode = useAppSelector(state => state.themes.value);
  
  return (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={icon} 
        size={64} 
        color={appmode.txtcolor[mode][3]} 
      />
      {title && (
        <Text style={[styles.emptyTitle, { color: appmode.txtcolor[mode][7] }]}>
          {title}
        </Text>
      )}
      {description && (
        <Text style={[styles.emptyDescription, { color: appmode.txtcolor[mode][5] }]}>
          {description}
        </Text>
      )}
      {actionText && onAction && (
        <TouchableOpacity 
          style={[styles.emptyAction, { borderColor: appmode.txtcolor[mode][7] }]}
          onPress={onAction}
        >
          <Text style={[styles.emptyActionText, { color: appmode.txtcolor[mode][7] }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingBox: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  inlineText: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Light',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayBox: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  overlayText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSpinner: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 300,
  },
  emptyAction: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
});

export default LoadingIndicator;
