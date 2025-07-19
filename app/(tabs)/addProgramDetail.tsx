import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

export default function AddProgramDetail() {
  const { newprogram_id, part } = useLocalSearchParams();

  const [inputValue, setInputValue] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [hareketler, setHareketler] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<string[]>([]);

  useEffect(() => {
    const fetchHareketler = async () => {
      const data = await loadHareketler();
      setHareketler(data);
    };
    fetchHareketler();
  }, []);

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
            id: Date.now().toString(),
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

  const handleDelete = () => {
    Alert.alert(
      "Silmek istediğinize emin misiniz?",
      "Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Sil", onPress: () => console.log("Silindi!") },
      ]
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, -100],
      extrapolate: "clamp",
    });

    return (
      <View style={{ width: 100, height: "100%" }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
          <Pressable
            onPress={handleDelete}
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
              renderRightActions={renderRightActions}
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

const styles = StyleSheet.create({
  inputContainerWrapper: {
    width: "100%",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  resultContainer: {
    backgroundColor: "#f9f9f9",
    padding: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  resultItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
    backgroundColor: "white",
    marginBottom: 10,
    width: "100%",
  },
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
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
    borderColor: "#ccc",
    padding: 10,
    backgroundColor: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
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
