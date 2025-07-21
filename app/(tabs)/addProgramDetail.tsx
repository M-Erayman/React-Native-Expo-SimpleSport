import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import uuid from "react-native-uuid";

import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { loadHareketler, saveHareketler } from "../data/hareketStorage";
import { loadPrograms, savePrograms } from "../data/programStorage";
import { ThemeContext } from "../ThemContext.js";
export default function AddProgramDetail() {
  const { isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(isDarkMode);
  const { newprogram_id, part } = useLocalSearchParams();

  const [inputValue, setInputValue] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [hareketler, setHareketler] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allPrograms = await loadPrograms();
      const allHareketler = await loadHareketler();

      setHareketler(allHareketler);

      const program = allPrograms.find((p) => p.id === newprogram_id);
      if (!program) return;

      const partKey = (part as string).toLowerCase();

      const hareketIdList: string[] = program[partKey] || [];

      const hareketNameList = hareketIdList
        .map((id) => {
          const hareket = allHareketler.find((h) => h.id === id);
          return hareket ? hareket.name : null;
        })
        .filter((name) => name !== null) as string[];

      setSelectedList(hareketNameList);
    };

    fetchData();
  }, [newprogram_id, part]);

  const handleSaveToProgram = async () => {
    try {
      const hareketData = await loadHareketler();
      const programs = await loadPrograms();

      const programIndex = programs.findIndex(
        (p: any) => p.id === newprogram_id
      );

      if (programIndex === -1) {
        Alert.alert("Hata", "Program bulunamadı!");
        return;
      }

      let updatedHareketler = [...hareketData];
      let updatedPrograms = [...programs];

      for (const hareketName of selectedList) {
        let hareket = updatedHareketler.find((h) => h.name === hareketName);

        if (!hareket) {
          const newHareket = {
            id: uuid.v4(),
            name: hareketName,
            part: part,
            records: [],
          };
          updatedHareketler.push(newHareket);
          hareket = newHareket;
        }

        const partKey = (part as string).toLowerCase();

        if (!updatedPrograms[programIndex][partKey]) {
          updatedPrograms[programIndex][partKey] = [];
        }

        if (!updatedPrograms[programIndex][partKey].includes(hareket.id)) {
          updatedPrograms[programIndex][partKey].push(hareket.id);
        }
      }

      await saveHareketler(updatedHareketler);
      await savePrograms(updatedPrograms);

      Alert.alert("Başarılı", "Hareketler programa kaydedildi!");
    } catch (e) {
      console.error("Kaydetme Hatası", e);
      Alert.alert("Hata", "Bir hata oluştu!");
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (text.trim() === "") {
      setFilteredData([]);
    } else {
      const filtered = hareketler.filter((item: any) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const handleSelectItem = (name: string) => {
    setSelectedList((prev) => [...prev, name]);
    setInputValue("");
    setFilteredData([]);
  };

  const handleAddFromInput = () => {
    if (inputValue.trim() === "") return;
    setSelectedList((prev) => [...prev, inputValue.trim()]);
    setInputValue("");
    setFilteredData([]);
  };

  const handleDelete = (name: string) => {
    Alert.alert(
      "Silmek istediğinize emin misiniz?",
      `${name} isimli hareket programdan kaldırılacak.`,
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Sil", onPress: () => handleDeleteItem(name) },
      ]
    );
  };

  const handleDeleteItem = async (name: string) => {
    try {
      const updatedList = selectedList.filter((item) => item !== name);
      setSelectedList(updatedList);

      const allPrograms = await loadPrograms();
      const allHareketler = await loadHareketler();

      const programIndex = allPrograms.findIndex((p) => p.id === newprogram_id);
      if (programIndex === -1) return;

      const hareket = allHareketler.find((h) => h.name === name);
      if (!hareket) return;

      const partKey = (part as string).toLowerCase();

      const updatedProgram = { ...allPrograms[programIndex] };
      updatedProgram[partKey] = updatedProgram[partKey]?.filter(
        (id: string) => id !== hareket.id
      );

      const updatedPrograms = [...allPrograms];
      updatedPrograms[programIndex] = updatedProgram;

      await savePrograms(updatedPrograms);
    } catch (e) {
      console.error("Silme Hatası", e);
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    name: string
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, -100],
      extrapolate: "clamp",
    });

    return (
      <View style={{ width: 100, height: "100%", marginLeft: 10 }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
          <Pressable
            onPress={() => handleDelete(name)}
            style={{
              backgroundColor: "red",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: 50,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Sil</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.pageContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {selectedList.map((item, index) => (
            <Swipeable
              key={index}
              renderRightActions={(progress, dragX) =>
                renderRightActions(progress, dragX, item)
              }
              overshootRight={false}
              friction={3}
            >
              <View style={styles.shadowWrapper}>
                <View style={styles.container}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.programName}
                  >
                    {item}
                  </Text>
                </View>
              </View>
            </Swipeable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.inputContainerWrapper}>
        {inputValue.trim() !== "" && filteredData.length > 0 && (
          <View style={styles.resultContainer}>
            {filteredData.map((item: any) => (
              <Pressable
                key={item.id}
                onPress={() => handleSelectItem(item.name)}
              >
                <Text style={styles.resultItem}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Bir şeyler yazın..."
            placeholderTextColor={isDarkMode ? "black" : "#888"}
            value={inputValue}
            onChangeText={handleInputChange}
            style={styles.input}
            onSubmitEditing={handleAddFromInput}
            returnKeyType="done"
          />
        </View>
      </View>
      <View style={styles.okContainer}>
        <Pressable onPress={handleSaveToProgram}>
          <Text style={styles.ok}>✓</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isDarkMode: any) =>
  StyleSheet.create({
    inputContainerWrapper: {
      width: "100%",
      padding: 10,
      backgroundColor: isDarkMode ? "#2e2e2e" : "#eee",
      borderTopWidth: 1,
      borderColor: isDarkMode ? "#7e7a81ff" : "white",
    },
    resultContainer: {
      backgroundColor: isDarkMode ? "#68656bff" : "white",
      padding: 5,
      borderRadius: 5,
      marginBottom: 5,
    },
    resultItem: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      fontSize: 16,
      borderBottomWidth: 1,
      // borderBottomColor: "#eee",
    },
    pageContainer: {
      flex: 1,
      position: "relative",
    },
    scrollContent: {
      padding: 10,
    },
    content: {
      alignItems: "center",
      gap: 10,
    },
    shadowWrapper: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 2,
      borderRadius: 10,
      backgroundColor: isDarkMode ? "#7e7a81ff" : "white",
      marginBottom: 10,
      width: "100%",
    },
    container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#7e7a81ff" : "white",
      borderColor: "rgb(255, 198, 41)",
      borderRadius: 10,
      width: "96%",
      height: 50,
      padding: 10,
    },
    programName: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 5,
      width: "96%",
    },
    inputContainer: {
      borderColor: isDarkMode ? "#7e7a81ff" : "white",
      padding: 10,
      backgroundColor: isDarkMode ? "#2e2e2e" : "#eee",
    },
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? "#7e7a81ff" : "white",
      backgroundColor: isDarkMode ? "#68656bff" : "white",
      borderRadius: 10,
      padding: 10,
      fontSize: 16,
    },
    okContainer: {
      backgroundColor: "#33cccc",
      borderRadius: 50,
      width: 70,
      aspectRatio: 1,
      position: "absolute",
      bottom: 100,
      right: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    ok: {
      color: "white",
      fontSize: 24,
    },
  });
