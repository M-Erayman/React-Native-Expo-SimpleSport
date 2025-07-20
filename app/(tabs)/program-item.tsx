import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { loadHareketler } from "../data/hareketStorage";
import { loadPrograms } from "../data/programStorage";
import { ThemeContext } from "../ThemContext.js";
type ValidPart =
  | "chest"
  | "triceps"
  | "shoulder"
  | "leg"
  | "back"
  | "biceps"
  | "abdominals"
  | "cardio";

export default function Programitem() {
  const { isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(isDarkMode);
  const router = useRouter();
  const { program_id, part } = useLocalSearchParams();

  const [hareketData, setHareketData] = useState<any[]>([]);
  const [programData, setProgramData] = useState<any[]>([]);

  const partParam = Array.isArray(part) ? part[0] : part;
  const partParamLower = partParam?.toLowerCase() || "";

  const validParts: ValidPart[] = [
    "chest",
    "triceps",
    "shoulder",
    "leg",
    "back",
    "biceps",
    "abdominals",
    "cardio",
  ];

  const partKey: ValidPart | undefined = validParts.find(
    (vp) => vp.toLowerCase() === partParamLower
  ) as ValidPart | undefined;

  useEffect(() => {
    const loadData = async () => {
      const hareketler = await loadHareketler();
      const programlar = await loadPrograms();
      setHareketData(hareketler || []);
      setProgramData(programlar || []);
    };
    loadData();
  }, []);

  if (!programData.length || !hareketData.length || !partKey) {
    return (
      <View style={styles.content}>
        <Text>Yükleniyor veya geçersiz program/bölüm</Text>
      </View>
    );
  }

  const program = programData.find((p) => p.id === program_id);

  if (!program) {
    return (
      <View style={styles.content}>
        <Text>Program bulunamadı</Text>
      </View>
    );
  }

  const hareketIdList = program[partKey] || [];

  if (hareketIdList.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require("../../assets/gif/no-data.gif")}
          style={styles.gif}
        />
        <Text style={styles.errorText}>
          {partKey} bölümünde hareket bulunamadı.
        </Text>
        {/* <Text style={styles.title}>Telefonundaki Tüm Hareketler:</Text>
        <Text style={styles.jsonText}>
          {JSON.stringify(hareketData, null, 2)}
        </Text>

        <Text style={styles.title}>Telefonundaki Tüm Programlar:</Text>
        <Text style={styles.jsonText}>
          {JSON.stringify(programData, null, 2)}
        </Text> */}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* <Text style={styles.title}>Telefonundaki Tüm Hareketler:</Text>
      <Text style={styles.jsonText}>
        {JSON.stringify(hareketData, null, 2)}
      </Text>

      <Text style={styles.title}>Telefonundaki Tüm Programlar:</Text>
      <Text style={styles.jsonText}>
        {JSON.stringify(programData, null, 2)}
      </Text> */}
      {hareketIdList.map((hareketId: any) => {
        const hareket = hareketData.find((h) => h.id === hareketId.toString());
        if (!hareket) return null;

        return (
          <View style={styles.shadowWrapper} key={hareket.id}>
            <Pressable
              onPress={() =>
                router.push(`/item-detail?hareket_id=${hareket.id}`)
              }
            >
              <View style={styles.container}>
                <View style={styles.ItemContainer}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.programName}
                  >
                    {hareket.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <View style={styles.ImgContainer}>
                      <Image
                        source={require("../../assets/gif/item/weight.gif")}
                        style={styles.gif}
                      />
                      <Text style={styles.createDate}>
                        {hareket.records && hareket.records.length > 0
                          ? hareket.records.reduce(
                              (max: any, r: any) =>
                                r.weight > max ? r.weight : max,
                              0
                            )
                          : 0}
                      </Text>
                      <Text style={styles.createDateText}> MAX</Text>
                    </View>

                    <View style={styles.ImgContainer}>
                      <Image
                        source={require("../../assets/gif/item/loop.gif")}
                        style={styles.gif}
                      />
                      <Text style={styles.createDate}>
                        {hareket.records
                          ? hareket.records.reduce(
                              (sum: any, r: any) => sum + r.repeat,
                              0
                            )
                          : 0}
                      </Text>
                      <Text style={styles.createDateText}> Toplam Tekrar</Text>
                    </View>
                    <View style={styles.ImgContainer}>
                      <Image
                        source={require("../../assets/gif/item/loop.gif")}
                        style={styles.gif}
                      />
                      <Text style={styles.createDate}>
                        {hareket.records
                          ? hareket.records.reduce(
                              (sum: any, r: any) => sum + r.repeat,
                              0
                            )
                          : 0}
                      </Text>
                      <Text style={styles.createDateText}> Toplam Tekrar</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const getStyles = (isDarkMode: any) =>
  StyleSheet.create({
    content: {
      flex: 1,
      position: "relative",
      alignItems: "center",
      gap: 10,
      padding: 10,
    },
    container: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: isDarkMode ? "#7e7a81ff" : "white",
      borderColor: "rgb(255, 198, 41)",
      borderRadius: 10,
      width: "96%",
      height: 170,
      padding: 10,
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
      alignItems: "center",
    },
    ImgContainer: {
      width: "33.3%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    ItemContainer: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
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
      width: "50%",
      aspectRatio: 1,
    },
    errorText: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      color: "#33cccc",
      textAlign: "center",
    },
    title: {
      fontWeight: "bold",
      fontSize: 16,
      marginTop: 20,
      marginBottom: 10,
    },
    jsonText: {
      fontFamily: "monospace",
      fontSize: 12,
      color: "#333",
    },
  });
