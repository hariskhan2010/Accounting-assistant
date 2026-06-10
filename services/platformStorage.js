import AsyncStorage from "@react-native-async-storage/async-storage";

export function createPlatformStorage() {
  return AsyncStorage;
}
