import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { applyTheme } from '../redux/themeSlice';

const AppScreen = ({ children }) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(state => state.themes.value) || 'dark';
  const isDarkMode = mode !== 'dark';

  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? '#1F2937' : '#f2f4f7',
  };

  const initialThemes = useCallback(async () => {
    const initThemes = await AsyncStorage.getItem('@color-mode');
    dispatch(applyTheme((initThemes) || mode));
  }, [dispatch, mode]);

  useEffect(() => {
    initialThemes();
  }, [initialThemes]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      {children}
    </SafeAreaView>
  );
};

export default AppScreen;