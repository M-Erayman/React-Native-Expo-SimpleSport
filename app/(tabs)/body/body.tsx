import { Image } from "expo-image";
import { useContext, useEffect, useRef, useState } from "react";
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
import uuid from "react-native-uuid";
import { ThemeContext } from "../../ThemContext.js";
import { loadBodyData, saveBodyData } from "../../data/bodyDataStorage";
export default function Programitem() {
  const { isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(isDarkMode);

  const [bodyData, setBodyData] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const swipeableRefs = useRef<(Swipeable | null)[]>([]);
  // Tüm inputları tek bir state objesinde tutuyoruz
  const [inputs, setInputs] = useState({
    weight: "",
    height: "",
    shoulder: "",
    chest: "",
    rightArm: "",
    leftArm: "",
    hip: "",
    waist: "",
  });
  const handleInputChange = (field: string, value: string) => {
    const filteredValue = value.replace(/[^0-9.]/g, "");
    setInputs((prev) => ({ ...prev, [field]: filteredValue }));
  };

  const fetchData = async () => {
    const data = await loadBodyData();
    setBodyData(data);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async () => {
    // Boş alan var mı kontrolü
    const hasEmptyField = Object.values(inputs).some(
      (value) => value.trim() === ""
    );

    if (hasEmptyField) {
      alert("Lütfen tüm alanları doldurunuz.");
      return; // Kaydetmeyi iptal et
    }

    const today = new Date();
    const formatDate = `${String(today.getDate()).padStart(2, "0")}.${String(
      today.getMonth() + 1
    ).padStart(2, "0")}.${today.getFullYear()}`;
    const newItem = {
      id: uuid.v4(),
      date: formatDate,
      weight: inputs.weight.toString(),
      height: inputs.height.toString(),
      shoulder: inputs.shoulder.toString(),
      chest: inputs.chest.toString(),
      rightArm: inputs.rightArm.toString(),
      leftArm: inputs.leftArm.toString(),
      hip: inputs.hip.toString(),
      waist: inputs.waist.toString(),
    };

    try {
      const existingData = (await loadBodyData()) || [];
      const updatedData = [...existingData, newItem];
      await saveBodyData(updatedData);

      setAddModalVisible(false);
      setInputs({
        weight: "",
        height: "",
        shoulder: "",
        chest: "",
        rightArm: "",
        leftArm: "",
        hip: "",
        waist: "",
      });
      fetchData();
      alert("Kayıt başarıyla eklendi!");
    } catch (error) {
      console.error("Add item error:", error);
      alert("Kayıt eklenirken hata oluştu!");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Kaydı Sil", // Başlık
      "Bu kaydı silmek istediğinizden emin misiniz?", // Mesaj
      [
        {
          text: "Vazgeç",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedData = bodyData.filter((item) => item.id !== id);
              setBodyData(updatedData);
              await saveBodyData(updatedData);
              alert("Kayıt başarıyla silindi.");
            } catch (error) {
              console.error("Silme hatası:", error);
              alert("Silme sırasında bir hata oluştu.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEdit = (id: string) => {
    setSelectedRecordId(id);
    const record = bodyData.find((item) => item.id === id);
    setEditedValues(record); // mevcut değerleri inputlara doldurur
    setEditModalVisible(true);
  };

  const handleEditConfirm = async () => {
    if (selectedRecordId && editedValues) {
      // Boş alan kontrolü
      const hasEmptyField = Object.values(editedValues).some(
        (value) => value.trim() === ""
      );

      if (hasEmptyField) {
        alert("Lütfen tüm alanları doldurunuz.");
        return; // Kaydetmeyi iptal et
      }

      const updatedData = bodyData.map((item) => {
        if (item.id === selectedRecordId) {
          return {
            ...item,
            ...editedValues, // Sadece güncellenen alanlar
          };
        }
        return item;
      });

      setBodyData(updatedData); // Bellekte güncelle
      await saveBodyData(updatedData); // AsyncStorage'da güncelle
      Object.values(swipeableRefs.current).forEach((ref) => {
        ref?.close();
      });
      setEditModalVisible(false);
      setEditedValues({});
      setSelectedRecordId(null);
    }
  };

  return (
    <View style={styles.content}>
      <ScrollView>
        {bodyData &&
          bodyData.map((item, index) => (
            <Swipeable
              key={item.id}
              ref={(ref) => {
                swipeableRefs.current[index] = ref;
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
                        onPress={() => handleDelete(item.id)}
                        style={styles.deleteBtn}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Sil
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleEdit(item.id)}
                        style={styles.editBtn}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
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
                  <Text style={styles.programName}>{item.date}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <View style={styles.ImgContainer}>
                      <Image
                        source={require("../../../assets/gif/body/weight.gif")}
                        style={styles.gif}
                      />
                      <Text style={styles.gifText}>{item.weight}</Text>
                      <Text style={styles.gifText2}> Kg</Text>
                    </View>

                    <View style={styles.ImgContainer}>
                      <Image
                        source={require("../../../assets/gif/body/height.gif")}
                        style={styles.gif}
                      />
                      <Text style={styles.gifText}>{item.height}</Text>
                      <Text style={styles.gifText2}> cm</Text>
                    </View>
                  </View>

                  <View style={styles.bodyPartContainer2}>
                    <View style={styles.bodyPartContainer}>
                      <Text style={styles.bodyPart}>
                        Omuz:{" "}
                        <Text style={styles.bodyPartValue}>
                          {item.shoulder}
                        </Text>{" "}
                        cm
                      </Text>
                      <Text style={styles.bodyPart}>
                        Sağ Kol:{" "}
                        <Text style={styles.bodyPartValue}>
                          {item.rightArm}
                        </Text>{" "}
                        cm
                      </Text>
                      <Text style={styles.bodyPart}>
                        Kalça:{" "}
                        <Text style={styles.bodyPartValue}>{item.hip}</Text> cm
                      </Text>
                    </View>

                    <View style={styles.bodyPartContainer}>
                      <Text style={styles.bodyPart}>
                        Göğüs:{" "}
                        <Text style={styles.bodyPartValue}>{item.chest}</Text>{" "}
                        cm
                      </Text>
                      <Text style={styles.bodyPart}>
                        Sol Kol:{" "}
                        <Text style={styles.bodyPartValue}>{item.leftArm}</Text>{" "}
                        cm
                      </Text>
                      <Text style={styles.bodyPart}>
                        Bel:{" "}
                        <Text style={styles.bodyPartValue}>{item.waist}</Text>{" "}
                        cm
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Swipeable>
          ))}
      </ScrollView>

      {/* Düzenleme Modalı */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Kütle (Kg):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={editedValues.weight || ""}
                  onChangeText={(text) =>
                    setEditedValues({ ...editedValues, weight: text })
                  }
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Boy (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={editedValues.height || ""}
                  onChangeText={(text) =>
                    setEditedValues({ ...editedValues, height: text })
                  }
                />
              </View>
            </View>

            <View style={styles.modalContainer}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Omuz (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={editedValues.shoulder || ""}
                  onChangeText={(text) =>
                    setEditedValues({ ...editedValues, shoulder: text })
                  }
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Göğüs (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={editedValues.chest || ""}
                  onChangeText={(text) =>
                    setEditedValues({ ...editedValues, chest: text })
                  }
                />
              </View>
            </View>

            <View style={styles.modalContainer}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Sağ Kol (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={editedValues.rightArm || ""}
                  onChangeText={(text) =>
                    setEditedValues({ ...editedValues, rightArm: text })
                  }
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Sol Kol (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={editedValues.leftArm || ""}
                  onChangeText={(text) =>
                    setEditedValues({ ...editedValues, leftArm: text })
                  }
                />
              </View>
            </View>
            <View style={styles.modalContainer}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Kalça (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={editedValues.hip || ""}
                  onChangeText={(text) =>
                    setEditedValues({ ...editedValues, hip: text })
                  }
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Bel (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={editedValues.waist || ""}
                  onChangeText={(text) =>
                    setEditedValues({ ...editedValues, waist: text })
                  }
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
          </View>
        </View>
      </Modal>

      <Pressable onPress={() => setAddModalVisible(true)} style={styles.add}>
        <Text style={styles.addPlus}>+</Text>
      </Pressable>
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Kütle (Kg):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={inputs.weight}
                  onChangeText={(val) => handleInputChange("weight", val)}
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Boy (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={inputs.height}
                  onChangeText={(val) => handleInputChange("height", val)}
                />
              </View>
            </View>
            <View style={styles.modalContainer}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Omuz (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={inputs.shoulder}
                  onChangeText={(val) => handleInputChange("shoulder", val)}
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Göğüs (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={inputs.chest}
                  onChangeText={(val) => handleInputChange("chest", val)}
                />
              </View>
            </View>

            <View style={styles.modalContainer}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Sağ Kol (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={inputs.rightArm}
                  onChangeText={(val) => handleInputChange("rightArm", val)}
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Sol Kol (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={inputs.leftArm}
                  onChangeText={(val) => handleInputChange("leftArm", val)}
                />
              </View>
            </View>

            <View style={styles.modalContainer}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Kalça (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={inputs.hip}
                  onChangeText={(val) => handleInputChange("hip", val)}
                />
              </View>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputText}>Göbek (cm):</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={inputs.waist}
                  onChangeText={(val) => handleInputChange("waist", val)}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.buttonText}>Vazgeç</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.confirmButton]}
                onPress={handleAddItem}
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDarkMode: any) =>
  StyleSheet.create({
    content: {
      width: "100%",
      position: "relative",
      alignItems: "center",
      gap: 10,
      padding: 10,
      flex: 1,
    },
    container: {
      flexDirection: "column",
      justifyContent: "space-around",
      backgroundColor: isDarkMode ? "#7e7a81ff" : "white",
      borderColor: "rgb(255, 198, 41)",
      borderRadius: 10,
      width: "96%",
      height: 250,
      padding: 10,
    },
    shadowWrapper: {
      // width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 2,
      borderRadius: 10,
      backgroundColor: isDarkMode ? "#7e7a81ff" : "white",
      marginBottom: 10,
      alignItems: "center",
    },
    ImgContainer: {
      display: "flex",
      flexDirection: "row",
      width: "50%",
      height: "100%",
      alignItems: "center",
      marginBottom: 10,
    },
    programName: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
      overflow: "hidden",
      marginBottom: 5,
    },
    gifText: {
      color: "#33cccc",
      fontSize: 20,
    },
    gifText2: { fontSize: 14 },

    gif: {
      width: "50%",
      aspectRatio: 1,
    },

    title: {
      fontWeight: "bold",
      fontSize: 16,
      marginTop: 20,
      marginBottom: 10,
    },
    deleteBtn: {
      backgroundColor: "red",
      justifyContent: "center",
      alignItems: "center",
      height: "45%",
      borderRadius: 10,
      marginLeft: 10,
    },
    editBtn: {
      backgroundColor: "orange",
      justifyContent: "center",
      alignItems: "center",
      height: "45%",
      borderRadius: 10,
      marginLeft: 10,
    },
    bodyPartContainer2: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      //   justifyContent: "space-evenly",
      //   marginBottom: 10,
      //   width: "50%",
    },
    bodyPartContainer: {
      //   width: "100%",
      //   display: "flex",
      //   flexDirection: "row",
      //   justifyContent: "space-around",
      // marginBottom: 10,
      width: "50%",
      gap: 8,
    },
    bodyPart: { fontSize: 16 },
    bodyPartValue: { fontSize: 16, color: "#33cccc", fontWeight: "bold" },
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
      width: "47%",
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      //   gap: 8,
    },
    modalInputText: {
      color: isDarkMode ? "#eee" : "#222",
      fontSize: 14,
    },
    input: {
      width: 60,
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
    modalLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: isDarkMode ? "#ddd" : "#333",
      width: 90,
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
      borderColor: isDarkMode ? "#33cccc" : "rgb(255, 198, 41)",
      justifyContent: "center",
      alignItems: "center",
    },
    addPlus: {
      lineHeight: 50,
      fontSize: 50,
      color: isDarkMode ? "white" : "#33cccc",
      fontWeight: 300,
    },
  });
