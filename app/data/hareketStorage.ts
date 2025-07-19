import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "hareket_data";

export const saveHareketler = async (hareketler: any[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(hareketler));
  } catch (e) {
    console.error("Save Error", e);
  }
};

export const loadHareketler = async (): Promise<any[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Load Error", e);
    return [];
  }
};

export const clearHareketler = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Clear Error", e);
  }
};
