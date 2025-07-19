import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
export default function HomeScreen() {
  const router = useRouter();

  return (
    // <View
    //   style={{
    //     flex: 1,
    //     alignItems: "center",
    //     justifyContent: "center",
    //   }}
    // >
    //   <Text>Home Screen</Text>
    //   <Button title="Go to Details" onPress={() => router.push("/detail")} />
    // </View>
    <View style={styles.content}>
      <View style={[styles.container, { marginBottom: 10 }]}>
        <View style={(styles.shadowWrapper, styles.pressable)}>
          <Pressable
            onPress={() => router.push("/programlar")}
            // style={styles.pressable}
          >
            <View style={styles.box}>
              <Image
                source={require("../../assets/gif/home/agenda-unscreen-ezgif.com-crop.gif")}
                style={styles.gif}
                // contentFit="contain"
              />
              <Text style={styles.font}>Programlar</Text>
            </View>
          </Pressable>
        </View>
        <View style={(styles.shadowWrapper, styles.pressable)}>
          <Pressable
            onPress={() => router.push("/not")}
            // style={styles.pressable}
          >
            <View style={styles.box}>
              <Image
                source={require("../../assets/gif/home/coming-soon-transparent.gif")}
                style={styles.gif}
                // contentFit="contain"
              />
              <Text style={styles.font}>Yakında</Text>
            </View>
          </Pressable>
        </View>
      </View>
      <View style={styles.container}>
        <View style={(styles.shadowWrapper, styles.pressable)}>
          <Pressable
            onPress={() => router.push("/not")}
            // style={styles.pressable}
          >
            <View style={styles.box}>
              <Image
                source={require("../../assets/gif/home/coming-soon-transparent.gif")}
                style={styles.gif}
                // contentFit="contain"
              />
              <Text style={styles.font}>Yakında</Text>
            </View>
          </Pressable>
        </View>
        <View style={(styles.shadowWrapper, styles.pressable)}>
          <Pressable
            onPress={() => router.push("/not")}
            // style={styles.pressable}
          >
            <View style={styles.box}>
              <Image
                source={require("../../assets/gif/home/coming-soon-transparent.gif")}
                style={styles.gif}
                // contentFit="contain"
              />
              <Text style={styles.font}>Yakında</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    // backgroundColor: "blue",
    flex: 1,
    // width: "100%",
    // height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  shadowWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    borderRadius: 10,
    backgroundColor: "white", // Android’de elevation için gerekli
    marginBottom: 10,
  },
  container: {
    flexDirection: "row",
    width: "95%",
    justifyContent: "space-between",
    // backgroundColor:"black",
  },
  box: {
    // margin: 10,
    width: "100%",
    // height: "100%",
    aspectRatio: 1,
    backgroundColor: "white",
    borderStyle: "solid",
    // borderWidth: 1,

    borderColor: "rgb(255, 198, 41)",
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  gif: { width: "60%", aspectRatio: 1 },
  font: { fontFamily: "orbitron", fontSize: 18 },
  pressable: { width: "49%", aspectRatio: 1 },
});
