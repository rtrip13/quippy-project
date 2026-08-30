import { Alert, Linking } from "react-native";

export async function openResource(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Couldn't open this page",
      "Please try again. You can keep exploring in the app.",
    );
  }
}
