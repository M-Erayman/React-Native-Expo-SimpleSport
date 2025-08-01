import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation } from "expo-router";
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
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { loadHareketler, saveHareketler } from "../data/hareketStorage";
import { ThemeContext } from "../ThemContext.js";
export default function ItemDetail() {
  const { isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(isDarkMode);
  const { hareket_id } = useLocalSearchParams<{ hareket_id: string }>();
  const [records, setRecords] = useState<any[]>([]);
  const [hareketname, setHareketname] = useState<string | null>(null);

  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {}
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [repeat, setRepeat] = useState("");
  const [editRecordIndex, setEditRecordIndex] = useState<number | null>(null);
  const swipeableRefs = useRef<(Swipeable | null)[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setEditModalVisible(true)}
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

  useEffect(() => {
    const loadData = async () => {
      const hareketler = await loadHareketler();
      const found = hareketler.find((h: any) => h.id === hareket_id);
      if (found) {
        setRecords(found.records || []);
        setHareketname(found.name || null); // 💡 burada name'ı al
      }
    };
    loadData();
  }, [hareket_id]);

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const handleDelete = async (recordIndex: number) => {
    swipeableRefs.current[recordIndex]?.close();
    Alert.alert(
      "Silmek istediğinize emin misiniz?",
      "Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            const updated = [...records];
            updated.splice(recordIndex, 1);
            setRecords(updated);
            const hareketler = await loadHareketler();
            const index = hareketler.findIndex((h: any) => h.id === hareket_id);
            if (index !== -1) {
              hareketler[index].records = updated;
              await saveHareketler(hareketler);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (recordIndex: number) => {
    swipeableRefs.current[recordIndex]?.close();
    const record = records[recordIndex];
    setWeight(
      Array.isArray(record.weight)
        ? record.weight.join(" - ")
        : record.weight.toString()
    );
    setRepeat(
      Array.isArray(record.repeat)
        ? record.repeat.join(" - ")
        : record.repeat.toString()
    );
    setEditRecordIndex(recordIndex);
    setEditModalVisible(true);
  };

  const handleEditConfirm = async () => {
    if (!weight || !repeat) {
      Alert.alert("Lütfen hem ağırlık hem tekrar giriniz.");
      return;
    }

    const today = new Date();
    const dateString = `${today.getDate().toString().padStart(2, "0")}.${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${today.getFullYear()}`;

    const parseInput = (input: string, isWeight: boolean) => {
      return input
        .split("-")
        .map((x) => (isWeight ? parseFloat(x) : parseInt(x)))
        .filter((n) => !isNaN(n));
    };

    const weightArray = parseInput(weight, true);
    const repeatArray = parseInput(repeat, false);

    const updated = [...records];
    if (editRecordIndex !== null) {
      updated[editRecordIndex] = {
        date: dateString,
        weight: weightArray,
        repeat: repeatArray,
      };
    } else {
      updated.push({
        date: dateString,
        weight: weightArray,
        repeat: repeatArray,
      });
    }

    setRecords(updated);
    const hareketler = await loadHareketler();
    const index = hareketler.findIndex((h: any) => h.id === hareket_id);
    if (index !== -1) {
      hareketler[index].records = updated;
      await saveHareketler(hareketler);
    }

    setEditModalVisible(false);
    setWeight("");
    setRepeat("");
    setEditRecordIndex(null);
  };

  const groupedRecords = records.reduce((acc, record, index) => {
    if (!acc[record.date]) acc[record.date] = [];
    acc[record.date].push({ ...record, originalIndex: index });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <View style={styles.content}>
      <Text numberOfLines={2} ellipsizeMode="tail" style={styles.hareketName}>
        {hareketname}
      </Text>
      {records.length === 0 && (
        <View style={styles.ImgContainer}>
          <Image
            source={require("../../assets/gif/item_detail/go_work.gif")}
            style={[styles.gif, { width: "50%" }]}
          />
          <Text style={{ fontSize: 18, color: "#33cccc", fontWeight: "bold" }}>
            Henüz kayıt eklenmedi.
          </Text>
          <Text style={{ fontSize: 18, color: "#33cccc", fontWeight: "bold" }}>
            Haydi, çalışmaya başla!
          </Text>
        </View>
      )}
      <ScrollView ref={scrollViewRef}>
        {Object.keys(groupedRecords).map((date) => (
          <View key={date}>
            <Pressable
              onPress={() => toggleExpand(date)}
              style={styles.dateHeader}
            >
              <Text style={styles.programName}>
                {date} ({groupedRecords[date].length} set)
              </Text>
              <Text>{expandedDates[date] ? "▲" : "▼"}</Text>
            </Pressable>

            {expandedDates[date] &&
              groupedRecords[date].map((record: any, idx: any) => (
                <Swipeable
                  key={record.originalIndex}
                  ref={(ref) => {
                    swipeableRefs.current[record.originalIndex] = ref;
                  }}
                  renderRightActions={(progress, dragX) => {
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
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <Pressable
                            onPress={() => handleDelete(record.originalIndex)}
                            style={styles.deleteBtn}
                          >
                            <Text
                              style={{ color: "white", fontWeight: "bold" }}
                            >
                              Sil
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleEdit(record.originalIndex)}
                            style={styles.editBtn}
                          >
                            <Text
                              style={{ color: "white", fontWeight: "bold" }}
                            >
                              Düzenle
                            </Text>
                          </Pressable>
                        </Animated.View>
                      </View>
                    );
                  }}
                  overshootRight={false}
                  friction={3}
                >
                  <View style={styles.shadowWrapper}>
                    <View style={styles.container}>
                      <View style={styles.ImgContainer}>
                        <Image
                          source={require("../../assets/gif/item/weight.gif")}
                          style={styles.gif}
                        />
                      </View>
                      <View style={styles.txtContainer}>
                        <Text
                          style={styles.createDate}
                          numberOfLines={2}
                          adjustsFontSizeToFit
                        >
                          {Array.isArray(record.weight)
                            ? record.weight.join("-")
                            : record.weight}
                        </Text>
                        <Text style={{ fontFamily: "orbitron" }}>Kg</Text>
                      </View>

                      <View style={styles.ImgContainer}>
                        <Image
                          source={require("../../assets/gif/item/loop.gif")}
                          style={styles.gif}
                        />
                      </View>

                      <View style={styles.txtContainer}>
                        <Text
                          style={styles.createDate}
                          numberOfLines={2}
                          adjustsFontSizeToFit
                        >
                          {Array.isArray(record.repeat)
                            ? record.repeat.join("-")
                            : record.repeat}
                        </Text>
                        <Text style={{ fontFamily: "orbitron" }}> Tekrar</Text>
                      </View>
                    </View>
                  </View>
                </Swipeable>
              ))}
          </View>
        ))}
      </ScrollView>

      {/* <Pressable onPress={() => setEditModalVisible(true)} style={styles.add}>
        <Text style={styles.addPlus}>+</Text>
      </Pressable> */}

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Ağırlık (Kg):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={weight}
                  onChangeText={(text) =>
                    setWeight(text.replace(/[^0-9\.\-]/g, ""))
                  }
                />
              </View>
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputText}>Tekrar (Adet):</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={repeat}
                onChangeText={(text) =>
                  setRepeat(text.replace(/[^0-9\-]/g, ""))
                }
              />
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
                onPress={handleEditConfirm}
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
                onPress={() => setEditModalVisible(false)}
              />
              <Button title="Onayla" onPress={handleEditConfirm} />
            </View> */}
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
      alignItems: "center",
      paddingLeft: 10,
      paddingRight: 10,
    },
    dateHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: isDarkMode ? "#7e7a81ff" : "white",
      borderRadius: 10,
      padding: 10,
      marginVertical: 5,
      width: "100%",
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
      width: "96%",
      alignSelf: "center",
    },
    container: {
      // display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      // backgroundColor: isDarkMode ? "#7e7a81ff" : "white",
      height: 100,
      width: "100%",
      padding: 0,
    },
    txtContainer: {
      width: "30%",
      alignItems: "center",
    },
    ImgContainer: { alignItems: "center", justifyContent: "center" },
    gif: { width: 70, aspectRatio: 1 },
    createDate: {
      // backgroundColor: "red",
      color: "#33cccc",
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      alignItems: "center",
    },
    programName: { fontWeight: "bold", fontSize: 16 },
    add: {
      width: 70,
      aspectRatio: 1,
      borderRadius: 35,
      position: "absolute",
      bottom: "5%",
      right: "5%",
      backgroundColor: isDarkMode ? "#33cccc" : "white",
      // backgroundColor: "white",
      borderWidth: 2,

      borderColor: isDarkMode ? "#33cccc" : "rgb(255, 198, 41)",
      justifyContent: "center",
      alignItems: "center",
    },
    addPlus: {
      fontSize: 50,
      color: isDarkMode ? "white" : "#33cccc",
      // color: "#33cccc",
      lineHeight: 50,
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
    deleteBtn: {
      backgroundColor: "red",
      justifyContent: "center",
      alignItems: "center",
      height: "45%",
      borderRadius: 10,
    },
    editBtn: {
      backgroundColor: "orange",
      justifyContent: "center",
      alignItems: "center",
      height: "45%",
      borderRadius: 10,
    },
    hareketName: {
      textAlign: "center",
      color: "#33cccc",
      fontSize: 18,
    },
  });
