import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
import uuid from "react-native-uuid";
import { ThemeContext } from "../ThemContext.js";
import { clearHareketler } from "../data/hareketStorage";
import { clearPrograms } from "../data/programStorage";
const STORAGE_KEY = "program_data";

export default function ProgramlarScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(isDarkMode);
  const router = useRouter();
  const [addModalVisible, setaddModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [repeat, setRepeat] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [programID, setProgramID] = useState("");
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const swipeableRefs = useRef<(Swipeable | null)[]>([]);

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setNameModalVisible(true)}
          style={{
            borderRadius: "50%", // daha net daire için
            width: 30,
            height: 30, // aspectRatio yerine sabit height kullan
            // marginRight: 5,
            backgroundColor: isDarkMode ? "#2e2e2e" : "whitesmoke",
            borderStyle: "dashed",
            borderWidth: 2,
            borderColor: isDarkMode ? "#33cccc" : "rgb(255, 198, 41)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20, // boyutu düşürdük çünkü 40 biraz taşırabilir
              color: isDarkMode ? "#33cccc" : "#33cccc",
              fontWeight: 400, // string olarak yazılmalı
              textAlign: "center",
              includeFontPadding: false, // Android için
              textAlignVertical: "center", // Android için
            }}
          >
            +
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, isDarkMode]);

  const clearAllData = async () => {
    try {
      await clearHareketler();
      await clearPrograms();
      console.log("Tüm hareketler ve programlar silindi!");
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  // ! BÜTÜN KAYITLARI SİL
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
  const closeAllSwip = () => {
    Object.values(swipeableRefs.current).forEach((ref) => {
      ref?.close();
    });
  };
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
      Alert.alert("Uyarı");
      return;
    }

    if (programID) {
      // Düzenleme işlemi
      const updatedPrograms = programs.map((program) => {
        if (program.id === programID) {
          return {
            ...program,
            name: nameInput.trim(),
          };
        }
        return program;
      });

      setPrograms(updatedPrograms);
      savePrograms(updatedPrograms);
      setProgramID("");
      setNameInput("");
      setNameModalVisible(false);
      closeAllSwip();
      return;
    }

    // Bugünün tarihini formatla (gün.ay.yıl)
    const today = new Date();
    const formatDate = `${String(today.getDate()).padStart(2, "0")}.${String(
      today.getMonth() + 1
    ).padStart(2, "0")}.${today.getFullYear()}`;

    // Yeni program objesi
    const newProgram = {
      id: uuid.v4(),
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

    closeAllSwip();
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
      <View style={{ width: 100, height: "100%", marginLeft: 10 }}>
        <Animated.View
          style={{
            // flex: 1,
            transform: [{ translateX }],
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={() => handleDelete(id)}
            style={{
              backgroundColor: "red",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "45%",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Sil</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              closeAllSwip();
              handleEdit(id);
            }}
            style={{
              backgroundColor: "orange",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "45%",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Düzenle</Text>
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

  const handleEdit = (id: string) => {
    closeAllSwip();
    router.push(`/addProgram?newprogram_id=${id}`);
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
            ref={(ref) => {
              swipeableRefs.current[program.id] = ref;
            }}
            key={program.id}
            renderRightActions={(progress, dragX) =>
              renderRightActions(progress, dragX, program.id)
            }
            overshootRight={false}
            friction={3}
          >
            <View style={styles.shadowWrapper}>
              <Pressable
                onPress={() => {
                  closeAllSwip();
                  router.push(`/program-detail?program_id=${program.id}`);
                }}
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
                  <Pressable
                    style={styles.ImgEditContainer}
                    onPress={() => {
                      setNameInput(program.name);
                      setProgramID(program.id);
                      setNameModalVisible(true);
                    }}
                  >
                    <Image
                      source={require("../../assets/gif/programs/edit.gif")}
                      style={styles.editgif}
                    />
                  </Pressable>
                </View>
              </Pressable>
            </View>
          </Swipeable>
        ))}
      </ScrollView>

      {/* <Pressable onPress={() => setNameModalVisible(true)} style={styles.add}> */}
      <Modal visible={nameModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputText}>Program İsmi Giriniz:</Text>
              <TextInput
                style={styles.input}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Program Adı"
                placeholderTextColor={isDarkMode ? "#eee" : "#222"}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setNameInput("");
                  setNameModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Vazgeç</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.confirmButton]}
                onPress={handleAddProgram}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: isDarkMode ? "white" : "black" },
                  ]}
                >
                  Onayla
                </Text>
              </Pressable>
            </View>
            {/* <View style={styles.buttonContainer}>
                <Button
                  title="Vazgeç"
                  onPress={() => setNameModalVisible(false)}
                />
                <Button title="Onayla" onPress={handleAddProgram} />
              </View> */}
          </View>
        </View>
      </Modal>
      {/* <Text style={styles.addPlus}>+</Text> */}
      {/* </Pressable> */}
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
      // position: "relative",
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
    createDateText: {
      width: "30%",
      // aspectRatio: 1,
      height: "100%",
    },
    gif: {
      width: "75%",
      aspectRatio: 1,
    },
    ImgEditContainer: {
      width: "10%",
      position: "absolute",
      top: 10,
      right: 0,
      height: "100%",
    },
    editgif: {
      // position: "absolute",
      // top: 20,
      // right: 20,
      width: "90%",
      aspectRatio: 1,
      // zIndex: 99,
    },
    add: {
      width: 40,
      aspectRatio: 1,
      borderRadius: "50%",
      position: "absolute",
      top: 0,
      right: "5%",
      backgroundColor: isDarkMode ? "#33cccc" : "white",
      borderStyle: "solid",
      borderWidth: 2,
      // borderColor: "rgb(255, 198, 41)",
      borderColor: isDarkMode ? "#33cccc" : "rgb(255, 198, 41)",
      justifyContent: "center",
      alignItems: "center",
    },
    addPlus: {
      lineHeight: 40,
      fontSize: 40,
      color: isDarkMode ? "white" : "#33cccc",
      fontWeight: 300,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)", // Daha koyu ve opak
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    modal: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: isDarkMode ? "#2c2c2e" : "white",
      borderRadius: 16,
      paddingVertical: 25,
      paddingHorizontal: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    modalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    modalInputContainer: {
      //   flex: 1,
      display: "flex",
      flexDirection: "column",
      width: "100%",
      // justifyContent: "space-between",
      // flexDirection: "row",
      // alignItems: "center",
      //   gap: 8,
    },
    modalInputText: {
      color: isDarkMode ? "#eee" : "#222",
      fontSize: 14,
      marginBottom: 5,
    },
    input: {
      width: "100%",
      borderWidth: 1,
      borderColor: isDarkMode ? "#555" : "#ccc",
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      color: isDarkMode ? "#eee" : "#222",
      backgroundColor: isDarkMode ? "#3a3a3c" : "#f9f9f9",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 25,
    },
    button: {
      flex: 1,
      marginHorizontal: 5,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButton: {
      backgroundColor: isDarkMode ? "#444" : "#ddd",
    },
    confirmButton: {
      backgroundColor: isDarkMode ? "#33cccc" : "rgb(255, 198, 41)",
    },
    buttonText: {
      fontWeight: "600",
      fontSize: 16,
      color: isDarkMode ? "white" : "black",
    },
  });
