import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Swipeable } from "react-native-gesture-handler";
import uuid from "react-native-uuid";
import { loadHareketler, saveHareketler } from "../data/hareketStorage";
import { loadPrograms, savePrograms } from "../data/programStorage";
import { ThemeContext } from "../ThemContext.js";
export default function AddProgramDetail() {
  const { isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(isDarkMode);
  const { newprogram_id, part } = useLocalSearchParams();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editedName, setEditedName] = useState(""); // input için
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [inputValue, setInputValue] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [hareketler, setHareketler] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<string[]>([]);
  const navigation = useNavigation();

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

  const handleSaveToProgram = useCallback(async () => {
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

      // Alert.alert("Başarılı", "Hareketler programa kaydedildi!");
    } catch (e) {
      console.error("Kaydetme Hatası", e);
      Alert.alert("Hata", "Bir hata oluştu!");
    }
  }, [newprogram_id, selectedList, part]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async (e) => {
      // Eğer kullanıcı zaten sayfadan çıkıyorsa, önce kaydet
      await handleSaveToProgram();
      // sonra çıkış devam etsin (e.preventDefault yok, çünkü engellemek istemiyoruz)
    });

    return unsubscribe;
  }, [navigation, handleSaveToProgram]);

  const handleSaveEdit = async () => {
    try {
      if (!editedName.trim()) {
        Alert.alert("Hata", "Hareket ismi boş olamaz.");
        return;
      }

      // Değişiklik yapılmamışsa
      if (editedName.trim() === editingItem) {
        setEditModalVisible(false);
        setEditingItem(null);
        setEditedName("");
        return;
      }

      const allHareketler = await loadHareketler();
      const allPrograms = await loadPrograms();

      const programIndex = allPrograms.findIndex((p) => p.id === newprogram_id);
      if (programIndex === -1) {
        Alert.alert("Hata", "Program bulunamadı.");
        return;
      }

      const partKey = (part as string).toLowerCase();

      // Aynı isim zaten başka bir harekette var mı kontrolü
      const nameConflict = allHareketler.some(
        (h) => h.name === editedName && h.name !== editingItem
      );
      if (nameConflict) {
        Alert.alert("Hata", "Bu isimde başka bir hareket zaten mevcut.");
        return;
      }

      const existingHareket = allHareketler.find((h) => h.name === editingItem);

      if (existingHareket) {
        // Gerçek hareketin ismini güncelle
        existingHareket.name = editedName;

        // selectedList içindeki ismi de değiştir
        const updatedList = selectedList.map((name) =>
          name === editingItem ? editedName : name
        );
        setSelectedList(updatedList);

        await saveHareketler(allHareketler);
      } else {
        // Sadece selectedList içinde ise
        const updatedList = selectedList.map((name) =>
          name === editingItem ? editedName : name
        );
        setSelectedList(updatedList);
      }

      // Temizle
      setEditModalVisible(false);
      setEditingItem(null);
      setEditedName("");
    } catch (error) {
      console.error("Düzenleme Hatası:", error);
      Alert.alert("Hata", "Düzenleme sırasında bir hata oluştu.");
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
        {
          text: "Sil",
          onPress: () => {
            Object.values(swipeableRefs.current).forEach((ref) => {
              ref?.close();
            });
            handleDeleteItem(name);
          },
        },
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
      <View style={styles.headContainer}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.partName}>
          {part}
        </Text>
        {/* <View style={styles.okContainer}> */}
        {/* <Pressable style={styles.okPress} onPress={handleSaveToProgram}>
          <Text style={styles.ok}>Kaydet</Text>
        </Pressable> */}
        {/* </View> */}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {selectedList.map((item, index) => (
            <Swipeable
              key={index}
              ref={(ref) => {
                swipeableRefs.current[item] = ref;
              }}
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
                  <Pressable
                    style={styles.gifContainer}
                    onPress={() => {
                      setEditingItem(item);
                      setEditedName(item); // burada `item` zaten bir string (hareket adı)
                      setEditModalVisible(true);
                    }}
                  >
                    <Image
                      source={require("../../assets/gif/add_program/edit.gif")}
                      style={styles.gif}
                    />
                  </Pressable>
                </View>
              </View>
            </Swipeable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.inputContainerWrapper}>
        {inputValue.trim() !== "" && filteredData.length > 0 && (
          <View style={styles.resultContainer}>
            <ScrollView>
              {filteredData.map((item: any) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectItem(item.name)}
                >
                  <Text style={styles.resultItem}>{item.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
        <Modal visible={editModalVisible} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <View style={styles.modalContainer}>
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputText}>Hareket İsmi</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="default"
                    value={editedName}
                    onChangeText={setEditedName}
                  />
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Vazgeç</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleSaveEdit}
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

              {/* <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.buttonContainer}>
                  <Button
                    title="Vazgeç"
                    onPress={() => setEditModalVisible(false)}
                  />
                  <Button title="Onayla" onPress={handleSaveEdit} />
                </View>
              </View> */}
            </View>
          </View>
        </Modal>

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
      maxHeight: 200,
    },
    resultItem: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      fontSize: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "gray" : "#eee",
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
      // backgroundColor: "black",
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
    // input: {
    //   borderWidth: 1,
    //   borderColor: isDarkMode ? "#7e7a81ff" : "white",
    //   backgroundColor: isDarkMode ? "#68656bff" : "white",
    //   borderRadius: 10,
    //   padding: 10,
    //   fontSize: 16,
    // },
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
    okPress: {
      position: "absolute",
      // top: 0,
      right: 10,
    },
    ok: {
      color: "#33cccc",
      fontSize: 18,
    },
    gifContainer: {
      position: "absolute",
      right: 0,
      width: "10%",
      height: "100%",
    },
    gif: {
      width: "100%",
      height: "100%",
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
    partName: {
      textAlign: "center",
      color: "#33cccc",
      fontSize: 18,
    },
    headContainer: {
      // position: "relative",
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
    },
  });
