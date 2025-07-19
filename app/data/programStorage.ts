import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "program_data";

// Kaydetme
export const savePrograms = async (programs: any[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
  } catch (e) {
    console.error("Save Error", e);
  }
};

// Yükleme
export const loadPrograms = async (): Promise<any[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Load Error", e);
    return [];
  }
};

// Silme (Tümünü)
export const clearPrograms = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Clear Error", e);
  }
};
