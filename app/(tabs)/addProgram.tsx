import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function AddProgram() {
  const { newprogram_id } = useLocalSearchParams();

  const router = useRouter();
  const list = [
    { name: "CHEST", url: require("../../assets/gif/parts/chest.gif") },
    { name: "TRICEPS", url: require("../../assets/gif/parts/triceps.gif") },
    { name: "SHOULDER", url: require("../../assets/gif/parts/shoulder.gif") },
    { name: "LEG", url: require("../../assets/gif/parts/leg.gif") },
    { name: "BACK", url: require("../../assets/gif/parts/back.gif") },
    { name: "BICEPS", url: require("../../assets/gif/parts/biceps.gif") },
    { name: "ABDOMINALS", url: require("../../assets/gif/parts/abs.gif") },
    { name: "CARDIO", url: require("../../assets/gif/parts/cardio.gif") },
  ];
  return (
    <ScrollView>
      {/* <Text>Program ID: {id}</Text> */}
      {list.map((item, index) => (
        <Pressable
          key={index}
          onPress={() =>
            router.push(
              `/addProgramDetail?newprogram_id=${newprogram_id}&part=${item.name}`
            )
          }
          style={{ alignItems: "center", marginBottom: 10 }}
        >
          <LinearGradient
            colors={["#33cccc", "whitesmoke"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.container}
          >
            <View style={styles.innerContainer}>
              <View style={styles.ImgContainer}>
                <Image source={item.url} style={styles.gif} />
              </View>
              <View style={styles.ItemContainer}>
                {/* <Text style={{ fontFamily: "SpaceMono" }}>{program_id}</Text> */}
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  adjustsFontSizeToFit
                  style={styles.programName}
                >
                  {item.name}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    gap: 10,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderStyle: "solid",
    // borderWidth: 1,
    borderColor: "rgb(255, 198, 41)",
    borderRadius: 10,
    width: "96%",
    height: 130,
    padding: 10,
    overflow: "hidden", // Köşeleri düzgün kesmek için
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
  },
  ImgContainer: {
    width: "40%",
    height: "100%",
  },
  ItemContainer: {
    width: "60%",
    height: "100%",
    justifyContent: "center",
  },
  programName: {
    fontFamily: "orbitron",
    textAlign: "center",
    fontSize: 32,
    overflow: "hidden",
    marginBottom: 5,
    // color: "white",
    // color: "#33cccc",
  },
  gif: {
    width: "75%",
    aspectRatio: 1,
  },
});
