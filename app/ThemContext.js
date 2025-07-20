import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({
  isDarkMode: false,
  setDarkMode: (value) => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const setDarkMode = async (value) => {
    setIsDarkMode(value);
    try {
      await AsyncStorage.setItem("isDarkMode", JSON.stringify(value));
    } catch (error) {
      console.log("Mod kaydedilirken hata oluştu:", error);
    }
  };

  // Uygulama başladığında kaydedilen modu oku
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedValue = await AsyncStorage.getItem("isDarkMode");
        if (storedValue !== null) {
          setIsDarkMode(JSON.parse(storedValue));
        }
      } catch (error) {
        console.log("Mod okunurken hata oluştu:", error);
      }
    };

    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
