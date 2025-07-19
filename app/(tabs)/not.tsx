import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/gif/no-page.gif")}
        style={styles.gif}
      />
      <Text style={styles.ops}>Bu Sayfa Henüz Hazır Değil.</Text>
      <TouchableOpacity style={styles.opsBtn} onPress={() => router.push("/")}>
        <Text style={styles.opsBtnText}>Ana Sayfa</Text>
      </TouchableOpacity>
    </View>
  );

  // <>
  //   <Stack.Screen options={{ title: 'Oops!' }} />
  //   <ThemedView style={styles.container}>
  //     <ThemedText type="title">This screen does not exist.</ThemedText>
  //     <Link href="/" style={styles.link}>
  //       <ThemedText type="link">Go to home screen!</ThemedText>
  //     </Link>
  //   </ThemedView>
  // </>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
  },
  video: {
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "rgb(255, 198, 41)",
    borderRadius: 10,
    width: "95%",
    height: "50%",
    marginTop: 0,
  },
  ops: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "orbitron",
  },
  opsBtn: {
    marginTop: 20,
    backgroundColor: "#33cccc",
    width: 100,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  opsBtnText: {
    color: "white",
    // fontFamily: "orbitron",
    fontSize: 18,
    fontWeight: 300,
  },
  gif: {
    width: "40%",
    aspectRatio: 1,
  },
});
