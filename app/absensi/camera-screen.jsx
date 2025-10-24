import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ onClose, onCapture, type }) {

  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={{ color: 'white' }}>Memuat kamera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={{ color: 'white', marginBottom: 16 }}>Izin kamera diperlukan</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.shutter}>
            <Text style={styles.shutterText}>Berikan Izin</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{type === 'in' ? 'Check In' : 'Check Out'}</Text>
        <TouchableOpacity onPress={onClose} style={styles.headerClose}>
          <Text style={{ color: 'white' }}>Tutup</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          />
          <View style={styles.controls}>
            <TouchableOpacity
              style={[
                styles.shutter,
                isProcessing && styles.shutterDisabled
              ]}
              onPress={async () => {
                if (isProcessing) return;
                
                try {
                  if (cameraRef.current) {
                    setIsProcessing(true);
                    const photo = await cameraRef.current.takePictureAsync({
                      quality: 0.8,
                      base64: false,
                    });
                    
                    onCapture && await onCapture(photo);
                    
                    setIsProcessing(false);
                  }
                } catch (e) {
                  setIsProcessing(false);
                  Alert.alert('Gagal mengambil foto');
                }
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loadingText}>Memproses...</Text>
                </View>
              ) : (
                <Text style={styles.shutterText}>Ambil Foto</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#000' },
  header: { height: 56, backgroundColor: '#111827', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '600' },
  headerClose: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EF4444', borderRadius: 6 },
  container: { flex: 1 },
  camera: { flex: 1, borderRadius: 12, overflow: 'hidden', margin: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  controls: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
  },
  shutter: {
    width: 140,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.7,
  },
  shutterText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});