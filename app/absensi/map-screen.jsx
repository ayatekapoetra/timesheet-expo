import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { getKoordinatChecklog } from '@/src/redux/koordinatChecklogSlice';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapScreen() {
    const mode = useAppSelector(state => state.themes.value);
    const isDark = mode === 'light';
    const dispatch = useAppDispatch();
    const mapRef = useRef(null);

    const [currentZoom, setCurrentZoom] = useState(0.01);
    const [userLocation, setUserLocation] = useState(null);

    const { data: koordinatData, loading, error } = useAppSelector(state => state.koordinatChecklog);

    useEffect(() => {
        dispatch(getKoordinatChecklog());
    }, [dispatch]);

    useEffect(() => {
        let subscription;
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;
                const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setUserLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude });
                subscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 5 },
                    (loc) => setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
                );
            } catch { }
        })();
        return () => { try { subscription && subscription.remove(); } catch { } };
    }, []);

    useEffect(() => {
        if (!mapRef.current || !Array.isArray(koordinatData) || koordinatData.length === 0) return;
        const coords = koordinatData
            .map((item) => {
                const lat = parseFloat(item?.latitude ?? item?.lat);
                const lng = parseFloat(item?.longitude ?? item?.lng ?? item?.lon ?? item?.long);
                if (isFinite(lat) && isFinite(lng)) return { latitude: lat, longitude: lng };
                return null;
            })
            .filter(Boolean);
        if (coords.length > 0) {
            mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 80, bottom: 80, left: 80, right: 80 }, animated: true });
        }
    }, [koordinatData]);

    const handleZoomIn = () => {
        const newZoom = Math.max(currentZoom * 0.5, 0.001);
        setCurrentZoom(newZoom);
        mapRef.current?.animateToRegion({
            latitude: -5.1451600667189470,
            longitude: 119.4485620222985700,
            latitudeDelta: newZoom,
            longitudeDelta: newZoom,
        });
    };

    const handleZoomOut = () => {
        const newZoom = Math.min(currentZoom * 2, 1);
        setCurrentZoom(newZoom);
        mapRef.current?.animateToRegion({
            latitude: -5.1451600667189470,
            longitude: 119.4485620222985700,
            latitudeDelta: newZoom,
            longitudeDelta: newZoom,
        });
    };

    return (
        <>
            <View style={[styles.container, { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' }]}>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <Text style={[styles.loadingText, { color: isDark ? '#f3f4f6' : '#374151' }]}>Memuat data koordinat...</Text>
                    </View>
                )}

                {error && (
                    <View style={styles.errorOverlay}>
                        <Text style={styles.errorText}>Gagal memuat data koordinat: {error}</Text>
                    </View>
                )}

                {Platform.OS !== 'web' ? (
                    <>
                        <MapView
                            ref={mapRef}
                            style={StyleSheet.absoluteFill}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={{
                                latitude: -5.1451600667189470,
                                longitude: 119.4485620222985700,
                                latitudeDelta: 0.001,
                                longitudeDelta: 0.001,
                            }}
                            showsUserLocation={false}
                            showsMyLocationButton={true}
                            showsCompass={true}
                            showsScale={true}
                            zoomEnabled={true}
                            scrollEnabled={true}
                            rotateEnabled={true}
                        >
                            {Array.isArray(koordinatData) && koordinatData.length > 0 && koordinatData
                                .filter((item) => {
                                    const lat = parseFloat(item?.latitude ?? item?.lat);
                                    const lng = parseFloat(item?.longitude ?? item?.lng ?? item?.lon ?? item?.long);
                                    const active = item?.aktif;
                                    const isActive = active === 'Y' || active === 'y' || active === true || active === '1' || active === 1 || active === undefined;
                                    return isFinite(lat) && isFinite(lng) && isActive;
                                })
                                .map((item, idx) => {
                                    const latitude = parseFloat(item?.latitude ?? item?.lat);
                                    const longitude = parseFloat(item?.longitude ?? item?.lng ?? item?.lon ?? item?.long);
                                    const key = (item && item.id && item.id.toString) ? item.id.toString() : `${latitude},${longitude}-${idx}`;
                                    return (
                                        <React.Fragment key={key}>
                                            <Circle
                                                center={{ latitude, longitude }}
                                                radius={item.radius ? parseFloat(item.radius) : 100}
                                                strokeColor="rgba(59, 130, 246, 0.8)"
                                                fillColor="rgba(59, 130, 246, 0.1)"
                                                strokeWidth={2}
                                            />
                                            <Marker
                                                coordinate={{ latitude, longitude }}
                                                title={item.nama || 'Lokasi Checklog'}
                                                description={`Radius: ${item.radius || 100}m`}
                                                pinColor="#3b82f6"
                                            />
                                        </React.Fragment>
                                    );
                                })}

                            {userLocation && (
                                <Marker
                                    coordinate={userLocation}
                                    title="Posisi Anda"
                                    description="Lokasi real-time"
                                    pinColor="#10B981"
                                />
                            )}
                        </MapView>

                        <View style={styles.zoomControls}>
                            <TouchableOpacity style={[styles.zoomButton, { backgroundColor: isDark ? '#374151' : '#ffffff' }]} onPress={handleZoomIn}>
                                <Ionicons name="add" size={24} color={isDark ? '#f3f4f6' : '#374151'} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.zoomButton, { backgroundColor: isDark ? '#374151' : '#ffffff' }]} onPress={handleZoomOut}>
                                <Ionicons name="remove" size={24} color={isDark ? '#f3f4f6' : '#374151'} />
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ color: '#6b7280', fontSize: 16 }}>Map tidak tersedia di platform web</Text>
                        <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 8, textAlign: 'center' }}>Gunakan Expo Go atau build native untuk melihat peta</Text>
                    </View>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        zIndex: 1000,
    },
    loadingText: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    errorOverlay: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        padding: 12,
        borderRadius: 8,
        zIndex: 1000,
    },
    errorText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    zoomControls: {
        position: 'absolute',
        right: 20,
        bottom: 120,
        zIndex: 1000,
    },
    zoomButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
});