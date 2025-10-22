import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { URIPATH } from './UriPath';

const API_URL = URIPATH.apiuri;

const apiFetch = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-type': 'application/json',
    'Cache-Control': 'no-cache',
    appsversion: '1.0.1',
  },
});

apiFetch.interceptors.request.use(async (config) => {
  const uuid = Device.osInternalBuildId || 'unknown-device';
  await AsyncStorage.setItem('@DEVICESID', uuid);
  
  config.headers['X-UUID-DEVICE'] = uuid;

  const token = await AsyncStorage.getItem('@token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }

  return config;
});

export default apiFetch;