import NetInfo from '@react-native-community/netinfo';

class NetworkService {
  constructor() {
    this.listeners = [];
  }

  async checkConnection() {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected ?? false;
      callback(isOnline);
    });

    return unsubscribe;
  }
}

const networkService = new NetworkService();
export default networkService;