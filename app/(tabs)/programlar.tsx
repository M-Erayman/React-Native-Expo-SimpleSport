import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Button,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { clearHareketler } from "../data/hareketStorage";
import { clearPrograms } from "../data/programStorage";
import { ThemeContext } from "../ThemContext.js";
const STORAGE_KEY = "program_data";

export default function ProgramlarScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(isDarkMode);
  const router = useRouter();
  const [addModalVisible, setaddModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [repeat, setRepeat] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);

  const clearAllData = async () => {
    try {
      await clearHareketler();
      await clearPrograms();
      console.log("Tüm hareketler ve programlar silindi!");
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  // // ! BÜTÜN KAYITLARI SİL
  // useEffect(() => {
  //   clearAllData();
  //   clearHareketler();
  // }, []);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          setPrograms(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("AsyncStorage load error", e);
      }
    };
    loadPrograms();
  }, []);

  // AsyncStorage'a kaydetme fonksiyonu
  const savePrograms = async (data: any[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("AsyncStorage save error", e);
    }
  };

  // Modal onay fonksiyonu (isim modalı)
  const handleAddProgram = () => {
    if (nameInput.trim() === "") {
      Alert.alert("Uyarı", "Lütfen bir program ismi giriniz.");
      return;
    }

    // Bugünün tarihini formatla (gün.ay.yıl)
    const today = new Date();
    const formatDate = `${String(today.getDate()).padStart(2, "0")}.${String(
      today.getMonth() + 1
    ).padStart(2, "0")}.${today.getFullYear()}`;

    // Yeni program objesi
    const newProgram = {
      id: Date.now().toString(),
      name: nameInput.trim(),
      createdate: formatDate,
      usedate: formatDate,
      chest: [],
      triceps: [],
      shoulder: [],
      leg: [],
      back: [],
      biceps: [],
      abdominals: [],
      cardio: [],
    };

    // Listeye ekle
    const updatedPrograms = [...programs, newProgram];
    setPrograms(updatedPrograms);
    savePrograms(updatedPrograms);

    setNameInput("");
    setNameModalVisible(false);

    // İstersen ekranda yeni program detay sayfasına da yönlendirebilirsin
    router.push(`/addProgram?newprogram_id=${newProgram.id}`);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    id: string
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, -100],
      extrapolate: "clamp",
    });

    return (
      <View style={{ width: 100, height: "100%" }}>
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateX }],
          }}
        >
          <Pressable
            onPress={() => handleDelete(id)}
            style={{
              backgroundColor: "red",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: 100,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Sil</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Silmek istediğinize emin misiniz?",
      "Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            const updatedPrograms = programs.filter((item) => item.id !== id);
            setPrograms(updatedPrograms);
            savePrograms(updatedPrograms);
          },
        },
      ]
    );
  };

  const handleAddConfirm = () => {
    console.log("Girilen ağırlık:", weight);
    console.log("Girilen tekrar:", repeat);
    setaddModalVisible(false);
    setWeight("");
    setRepeat("");
  };

  return (
    <View style={styles.content}>
      <ScrollView>
        {programs.map((program) => (
          <Swipeable
            key={program.id}
            renderRightActions={(progress, dragX) =>
              renderRightActions(progress, dragX, program.id)
            }
            overshootRight={false}
            friction={3}
          >
            <View style={styles.shadowWrapper}>
              <Pressable
                onPress={() =>
                  router.push(`/program-detail?program_id=${program.id}`)
                }
              >
                <View style={styles.container}>
                  <View style={styles.ImgContainer}>
                    <Image
                      source={require("../../assets/gif/programs/exercise-routine.gif")}
                      style={styles.gif}
                    />
                  </View>
                  <View style={styles.ItemContainer}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.programName}
                    >
                      {program.name}
                    </Text>
                    <Text style={styles.createDate}>
                      Oluşturma Tarihi:{" "}
                      <Text style={styles.createDateText}>
                        {program.createdate}
                      </Text>
                    </Text>
                    <Text style={styles.createDate}>
                      Son Çalışma Tarihi:{" "}
                      <Text style={styles.createDateText}>
                        {program.usedate}
                      </Text>
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </Swipeable>
        ))}
      </ScrollView>

      <Pressable onPress={() => setNameModalVisible(true)} style={styles.add}>
        <Modal visible={nameModalVisible} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text>Program İsmi Giriniz:</Text>
              <TextInput
                style={styles.input}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Program Adı"
              />
              <View style={styles.buttonContainer}>
                <Button
                  title="Vazgeç"
                  onPress={() => setNameModalVisible(false)}
                />
                <Button title="Onayla" onPress={handleAddProgram} />
              </View>
            </View>
          </View>
        </Modal>
        <Text style={styles.addPlus}>+</Text>
      </Pressable>
      {/* <View>
        <Text>{JSON.stringify(programs, null, 2)}</Text>
      </View> */}

      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text>Ağırlık (Kg):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={(text) => setWeight(text.replace(/[^0-9]/g, ""))}
            />
            <Text>Tekrar (Adet):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={repeat}
              onChangeText={(text) => setRepeat(text.replace(/[^0-9]/g, ""))}
            />
            <View style={styles.buttonContainer}>
              <Button
                title="Vazgeç"
                onPress={() => setaddModalVisible(false)}
              />
              <Button title="Onayla" onPress={handleAddConfirm} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDarkMode: any) =>
  StyleSheet.create({
    content: {
      flex: 1,
      // display: "flex",
      position: "relative",
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
      backgroundColor: isDarkMode ? "#7e7a81ff" : "white", // Android’de elevation için gerekli
      marginBottom: 10,
      width: "100%",
    },
    ImgContainer: {
      width: "30%",
      // aspectRatio: 1,
      height: "100%",
      // backgroundColor: "red",
    },
    ItemContainer: {
      width: "70%",
      height: "100%",
      justifyContent: "center",
      // alignItems: "center",
    },
    container: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: isDarkMode ? "#7e7a81ff" : "white",
      borderStyle: "solid",
      // borderWidth: 1,
      borderColor: "rgb(255, 198, 41)",
      borderRadius: 10,
      width: "96%",
      height: 100,
      padding: 10,
    },
    programName: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
      overflow: "hidden",
      marginBottom: 5,
    },
    createDate: {
      fontSize: 14,
    },
    createDateText: {},
    gif: {
      width: "75%",
      aspectRatio: 1,
    },
    add: {
      width: 70,
      aspectRatio: 1,
      borderRadius: "50%",
      position: "absolute",
      bottom: "5%",
      right: "5%",
      backgroundColor: isDarkMode ? "#33cccc" : "white",
      borderStyle: "solid",
      borderWidth: 2,
      // borderColor: "rgb(255, 198, 41)",
      borderColor: isDarkMode ? "#33cccc" : "white",
      justifyContent: "center",
      alignItems: "center",
    },
    addPlus: {
      lineHeight: 50,
      fontSize: 50,
      color: isDarkMode ? "white" : "#33cccc",
      fontWeight: 300,
    },
    overlay: {
      flex: 1,
      backgroundColor: "#00000099",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      width: 300,
      padding: 20,
      backgroundColor: "white",
      borderRadius: 10,
    },
    input: {
      borderBottomWidth: 1,
      marginVertical: 10,
      padding: 5,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
  });
