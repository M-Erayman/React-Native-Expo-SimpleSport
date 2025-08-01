// bodyStorage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "body_data";

// Vücut ölçülerini kaydet
export const saveBodyData = async (bodyData: any) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bodyData));
  } catch (e) {
    console.error("Save Body Data Error", e);
  }
};

// Vücut ölçülerini yükle
export const loadBodyData = async (): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Load Body Data Error", e);
    return null;
  }
};

// Vücut ölçülerini temizle
export const clearBodyData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Clear Body Data Error", e);
  }
};
