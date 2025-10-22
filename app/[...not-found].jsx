import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/src/redux/hooks';
import { useEffect, useRef } from 'react';

export default function MaintenanceScreen() {
  const router = useRouter();
  const mode = useAppSelector(state => state.themes.value);
  const isDark = mode === 'dark';
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations when component mounts
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    });

    const scaleUp = Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    });

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    Animated.parallel([fadeIn, scaleUp]).start();
    rotate.start();

    return () => rotate.stop();
  }, [fadeAnim, scaleAnim, rotateAnim]);

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleRefresh = () => {
    // Simple refresh action
    router.replace('/(tabs)/index');
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }
    ]}>
      <View style={{ position: 'absolute', top: 20, left: 0, right: 0 }}>
        {/* Minimal inline header with back */}
        <View style={{ height: 50, justifyContent: 'center', paddingHorizontal: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#f1f5f9' : '#0f172a'} />
            <Text style={{ marginLeft: 6, color: isDark ? '#f1f5f9' : '#0f172a', fontSize: 16 }}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.circle,
              {
                backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                top: `${20 + (i * 15)}%`,
                left: `${10 + (i * 12)}%`,
              }
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ rotate: rotateInterpolate }] }
          ]}
        >
          <Ionicons 
            name="construct-outline" 
            size={80} 
            color={isDark ? '#60a5fa' : '#3b82f6'} 
          />
        </Animated.View>

        {/* Maintenance Badge */}
        <View style={[
          styles.badge,
          { backgroundColor: isDark ? '#fef3c7' : '#fef3c7' }
        ]}>
          <Text style={styles.badgeText}>UNDER MAINTENANCE</Text>
        </View>

        {/* Title */}
        <Text style={[
          styles.title,
          { color: isDark ? '#f1f5f9' : '#0f172a' }
        ]}>
          We&apos;ll Be Back Soon!
        </Text>

        {/* Description */}
        <Text style={[
          styles.description,
          { color: isDark ? '#94a3b8' : '#475569' }
        ]}>
          Our application is currently undergoing scheduled maintenance to improve your experience. 
          We apologize for any inconvenience.
        </Text>

        {/* Maintenance Info */}
        <View style={[
          styles.infoBox,
          { 
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }
        ]}>
          <View style={styles.infoItem}>
            <Ionicons 
              name="time-outline" 
              size={20} 
              color={isDark ? '#60a5fa' : '#3b82f6'} 
            />
            <Text style={[
              styles.infoText,
              { color: isDark ? '#cbd5e1' : '#475569' }
            ]}>
              Expected Duration: 2-3 hours
            </Text>
          </View>
          
          <View style={[styles.infoItem, { marginBottom: 12 }]}>
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color={isDark ? '#60a5fa' : '#3b82f6'} 
            />
            <Text style={[
              styles.infoText,
              { color: isDark ? '#cbd5e1' : '#475569' }
            ]}>
              Started: {new Date().toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons 
              name="checkmark-circle-outline" 
              size={20} 
              color={isDark ? '#34d399' : '#10b981'} 
            />
            <Text style={[
              styles.infoText,
              { color: isDark ? '#cbd5e1' : '#475569' }
            ]}>
              Critical services remain operational
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }
            ]}
            onPress={handleGoHome}
          >
            <Ionicons 
              name="home-outline" 
              size={20} 
              color="#ffffff" 
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { 
                backgroundColor: 'transparent',
                borderColor: isDark ? '#4b5563' : '#d1d5db'
              }
            ]}
            onPress={handleRefresh}
          >
            <Ionicons 
              name="refresh-outline" 
              size={20} 
              color={isDark ? '#9ca3af' : '#6b7280'} 
              style={styles.buttonIcon}
            />
            <Text style={[
              styles.secondaryButtonText,
              { color: isDark ? '#9ca3af' : '#6b7280' }
            ]}>
              Refresh App
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.contactContainer}>
          <Text style={[
            styles.contactText,
            { color: isDark ? '#64748b' : '#94a3b8' }
          ]}>
            Need immediate assistance?
          </Text>
          <TouchableOpacity>
            <Text style={[
              styles.contactLink,
              { color: isDark ? '#60a5fa' : '#3b82f6' }
            ]}>
              Contact Support Team
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  infoBox: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
  contactContainer: {
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    marginBottom: 4,
  },
  contactLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});