import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/src/redux/hooks';
import appmode from '@/src/helpers/ThemesMode';

const { height } = Dimensions.get('window');

export default function ValidationErrorModal({
  visible,
  errors,
  onClose,
}) {
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'light';

  const formatErrorMessages = (errorObj) => {
    if (!errorObj || typeof errorObj !== 'object') {
      return [];
    }

    const messages = [];
    
    Object.entries(errorObj).forEach(([field, message]) => {
      // Format field name to be more readable
      const formattedField = field
        .replace(/_/g, ' ')
        .replace(/\./g, ' -> ')
        .replace(/kegiatan (\d+) -> (.+)/i, 'Kegiatan #$1 -> $2')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      messages.push({
        field: formattedField,
        message: typeof message === 'string' ? message : 'Field ini wajib diisi'
      });
    });

    return messages;
  };

  const errorMessages = formatErrorMessages(errors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#1F2937' : '#f2f4f7',
            },
          ]}>
          <View
            style={[
              styles.header,
              {
                backgroundColor: isDark ? '#374151' : '#FFFFFF',
                borderBottomColor: appmode.boxlinecolor[mode][1],
              },
            ]}>
            <View style={styles.headerContent}>
              <Ionicons
                name="warning"
                size={24}
                color="#ef4444"
                style={styles.errorIcon}
              />
              <Text
                style={[
                  styles.title,
                  { color: appmode.txtcolor[mode][1] },
                ]}>
                Validasi Gagal
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={appmode.txtcolor[mode][1]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text
              style={[
                styles.subtitle,
                { color: appmode.txtcolor[mode][7] },
              ]}>
              Mohon perbaiki error berikut sebelum menyimpan:
            </Text>

            <ScrollView 
              style={styles.errorList}
              showsVerticalScrollIndicator={false}
            >
              {errorMessages.map((error, index) => (
                <View
                  key={index}
                  style={[
                    styles.errorItem,
                    {
                      backgroundColor: isDark ? '#374151' : '#FFFFFF',
                      borderColor: '#ef4444',
                    },
                  ]}>
                  <View style={styles.errorItemContent}>
                    <Text
                      style={[
                        styles.errorField,
                        { color: appmode.txtcolor[mode][1] },
                      ]}>
                      {error.field}
                    </Text>
                    <Text
                      style={[
                        styles.errorMessage,
                        { color: '#ef4444' },
                      ]}>
                      {error.message}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.okButton,
                { backgroundColor: '#3b82f6' },
              ]}
              onPress={onClose}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '90%',
    maxHeight: height * 0.7,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  errorIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorList: {
    maxHeight: height * 0.4,
  },
  errorItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  errorItemContent: {
    flexDirection: 'column',
  },
  errorField: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    fontFamily: 'Poppins-Light',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  okButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  okButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    fontWeight: '700',
  },
});