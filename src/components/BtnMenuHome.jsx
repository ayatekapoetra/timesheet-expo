import { TouchableOpacity, Platform, StyleSheet, View, Text, Image, ImageSourcePropType } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../redux/hooks';
import appmode from '../helpers/ThemesMode';

const BtnMenuHome = ({ routeTo, uriPhoto, title }) => {
  const router = useRouter();
  const mode = useAppSelector(state => state.themes.value);
  const shadowx = Platform.OS === 'ios' ? 3 : 0;

  const size = title === 'Fingerprint' 
    ? { height: 50, width: 60 } 
    : { height: 50, width: 50 };

  return (
    <TouchableOpacity
      onPress={() => router.push(routeTo)}
      style={styles.touchable}>
      <View
        style={[
          styles.container,
          {
            borderColor: appmode.boxlinecolor[mode][1],
            shadowOpacity: shadowx > 0 ? 0.2 : 0,
            elevation: shadowx,
          },
        ]}>
        <Image source={uriPhoto} alt={title} style={size} />
        <Text
          style={[
            styles.text,
            { color: appmode.txtcolor[mode][1] },
          ]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  container: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    flex: 1,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    paddingTop: 4,
  },
});

export default BtnMenuHome;