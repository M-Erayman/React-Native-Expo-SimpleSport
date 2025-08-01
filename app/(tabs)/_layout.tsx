import type { RouteProp } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useContext } from "react";
import { Text } from "react-native";
import { ThemeContext } from "../ThemContext.js";

export default function TabLayout() {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? "#2e2e2e" : "whitesmoke",
        },
        headerShadowVisible: false,
        headerTintColor: "rgb(255, 198, 41)",
        headerTitleStyle: {
          fontFamily: "orbitron", // Buraya font adını yaz
          fontSize: 28, // İstersen font boyutu vs
          fontWeight: "normal", // Variable fontsa weight ile oynayabilirsin
        },
        headerTitleAlign: "center",
        contentStyle: {
          backgroundColor: isDarkMode ? "#2e2e2e" : "whitesmoke",
          paddingBottom: 50,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerBackVisible: false,
          headerTitle: () => (
            <Text
              style={{
                fontFamily: "orbitron",
                fontSize: 28,
                color: "rgb(255, 198, 41)",
                flexShrink: 0, // kesilmemesi için
              }}
              numberOfLines={1} // tek satır, istersen kaldırabilirsin
            >
              NEVER GIVE UP
            </Text>
          ),
        }}
      />

      <Stack.Screen
        name="item-detail"
        options={{
          headerTitle: () => (
            <Text
              style={{
                fontFamily: "orbitron",
                fontSize: 28,
                color: "rgb(255, 198, 41)",
                flexShrink: 0, // kesilmemesi için
              }}
              numberOfLines={1} // tek satır, istersen kaldırabilirsin
            >
              Detay
            </Text>
          ),
        }}
      />

      <Stack.Screen
        name="body/body"
        options={{
          title: "Vücut Ölçüleri", // otomatik ortalar
        }}
      />

      <Stack.Screen
        name="addProgram"
        options={{
          headerTitle: () => (
            <Text
              style={{
                fontFamily: "orbitron",
                fontSize: 28,
                color: "rgb(255, 198, 41)",
                flexShrink: 0, // kesilmemesi için
              }}
              numberOfLines={1} // tek satır, istersen kaldırabilirsin
            >
              Program Ekle
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="addProgramDetail"
        options={{
          headerTitle: () => (
            <Text
              style={{
                fontFamily: "orbitron",
                fontSize: 28,
                color: "rgb(255, 198, 41)",
                flexShrink: 0, // kesilmemesi için
              }}
              numberOfLines={1} // tek satır, istersen kaldırabilirsin
            >
              Program Ekle
            </Text>
          ),
        }}
      />
      {/* <Stack.Screen name="program" options={{ title: "Detay Sayfası" }} /> */}
      <Stack.Screen
        name="programlar"
        options={{
          title: "Programlar",
        }}
      />
      <Stack.Screen
        name="program-detail"
        options={{
          title: "Part",
        }}
      />
      <Stack.Screen
        name="program-item"
        options={({
          route,
        }: {
          route: RouteProp<Record<string, object | undefined>, string>;
        }) => {
          const { part } = route.params as { part?: string };
          return {
            headerTitle: () => (
              <Text
                style={{
                  fontFamily: "orbitron",
                  fontSize: 28,
                  color: "#ffc629ff",
                  flexShrink: 0,
                }}
                numberOfLines={1}
              >
                {part?.toUpperCase() || "PROGRAM"}
              </Text>
            ),
          };
        }}
      />
      <Stack.Screen
        name="not"
        options={{
          headerTitle: () => (
            <Text
              style={{
                fontFamily: "orbitron",
                fontSize: 28,
                color: "rgb(255, 198, 41)",
                flexShrink: 0, // kesilmemesi için
              }}
              numberOfLines={1} // tek satır, istersen kaldırabilirsin
            >
              NEVER GIVE UP
            </Text>
          ),
        }}
      />
    </Stack>
  );
}
