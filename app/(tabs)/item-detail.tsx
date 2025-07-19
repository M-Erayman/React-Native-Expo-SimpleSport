import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { loadHareketler, saveHareketler } from "../data/hareketStorage";

export default function ItemDetail() {
  const { hareket_id } = useLocalSearchParams<{ hareket_id: string }>();
  const [records, setRecords] = useState<any[]>([]);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {}
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [repeat, setRepeat] = useState("");
  const [editRecordIndex, setEditRecordIndex] = useState<number | null>(null);
  const swipeableRefs = useRef<(Swipeable | null)[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadData = async () => {
      const hareketler = await loadHareketler();
      const found = hareketler.find((h: any) => h.id === hareket_id);
      if (found) setRecords(found.records || []);
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
    setWeight(record.weight.toString());
    setRepeat(record.repeat.toString());
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

    const updated = [...records];
    if (editRecordIndex !== null) {
      updated[editRecordIndex] = {
        date: dateString,
        weight: parseInt(weight),
        repeat: parseInt(repeat),
      };
    } else {
      updated.push({
        date: dateString,
        weight: parseInt(weight),
        repeat: parseInt(repeat),
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
                        <Text style={styles.createDate}>
                          {record.weight} Kg
                        </Text>
                      </View>
                      <View style={styles.ImgContainer}>
                        <Image
                          source={require("../../assets/gif/item/loop.gif")}
                          style={styles.gif}
                        />
                        <Text style={styles.createDate}>
                          {record.repeat} Tekrar
                        </Text>
                      </View>
                    </View>
                  </View>
                </Swipeable>
              ))}
          </View>
        ))}
      </ScrollView>

      <Pressable onPress={() => setEditModalVisible(true)} style={styles.add}>
        <Text style={styles.addPlus}>+</Text>
      </Pressable>

      <Modal visible={editModalVisible} transparent animationType="fade">
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
                onPress={() => setEditModalVisible(false)}
              />
              <Button title="Onayla" onPress={handleEditConfirm} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: "center", paddingLeft: 10, paddingRight: 10 },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eee",
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
    backgroundColor: "white",
    marginBottom: 10,
    width: "96%",
    alignSelf: "center",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 100,
    padding: 0,
  },
  ImgContainer: { alignItems: "center", justifyContent: "center" },
  gif: { width: 70, aspectRatio: 1 },
  createDate: { fontSize: 14, textAlign: "center" },
  programName: { fontWeight: "bold", fontSize: 16 },
  add: {
    width: 70,
    aspectRatio: 1,
    borderRadius: 35,
    position: "absolute",
    bottom: "5%",
    right: "5%",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "rgb(255, 198, 41)",
    justifyContent: "center",
    alignItems: "center",
  },
  addPlus: { fontSize: 50, color: "#33cccc", lineHeight: 50 },
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
  input: { borderBottomWidth: 1, marginVertical: 10, padding: 5 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    // height: "100%",
    marginTop: 10,
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
});
