import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SimpleErrorModal({
  visible,
  errors,
  onClose,
  title,
  body,
  footerText = 'OK',
  variant = 'warning',
  iconName,
}) {

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
  const isCustom = !!title || !!body;
  const icon = iconName || (variant === 'danger' ? 'alert-circle' : variant === 'warning' ? 'warning' : 'information-circle');
  const iconColor = variant === 'danger' ? '#ef4444' : variant === 'warning' ? '#f59e0b' : '#3b82f6';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons
                name={icon}
                size={24}
                color={iconColor}
                style={styles.errorIcon}
              />
              <Text style={styles.title}>{isCustom ? title : 'Validasi Gagal'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {isCustom ? (
              <Text style={styles.subtitle}>{body}</Text>
            ) : (
              <>
                <Text style={styles.subtitle}>
                  Mohon perbaiki error berikut sebelum menyimpan:
                </Text>
                <ScrollView style={styles.errorList}>
                  {errorMessages.map((error, index) => (
                    <View key={index} style={styles.errorItem}>
                      <Text style={styles.errorField}>{error.field}</Text>
                      <Text style={styles.errorMessage}>{error.message}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.okButton, variant === 'danger' ? { backgroundColor: '#ef4444' } : variant === 'warning' ? { backgroundColor: '#f59e0b' } : { backgroundColor: '#3b82f6' }]}
              onPress={onClose}>
              <Text style={styles.okButtonText}>{footerText}</Text>
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
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorList: {
    maxHeight: 300,
  },
  errorItem: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  errorField: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: '#ef4444',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  okButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  okButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});