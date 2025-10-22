import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';

const LoadingTruck = ({ height, message, title }) => {
  return (
    <View style={[styles.container, height ? { height } : styles.fullHeight]}>
      <Text style={styles.titleText}>{title || 'Tunggu sejenak'}</Text>
      <LottieView
        source={require('../../assets/lottie/hauler.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.subtitleText}>
        {message || 'Aplikasi sedang mempersiapkan data...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullHeight: {
    flex: 1,
  },
  titleText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    fontWeight: '500',
    color: '#A8A29E',
  },
  lottie: {
    height: 250,
    width: '100%',
  },
  subtitleText: {
    fontFamily: 'Poppins-Light',
    fontSize: 15,
    fontWeight: '300',
    color: '#A8A29E',
  },
});

export default LoadingTruck;