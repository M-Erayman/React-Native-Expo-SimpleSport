import { ResizeMode, Video } from "expo-av";
import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text >Ooops! Bu Sayfa Henüz Hazır Değil</Text>
      <View style={styles.content}>
        
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Ana Sayfaya Dön</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "70%",
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: "blue",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

// <>
//   <Stack.Screen options={{ title: 'Oops!' }} />
//   <ThemedView style={styles.container}>
//     <ThemedText type="title">This screen does not exist.</ThemedText>
//     <Link href="/" style={styles.link}>
//       <ThemedText type="link">Go to home screen!</ThemedText>
//     </Link>
//   </ThemedView>
// </>
