import { StyleSheet, View } from "react-native";

/** Small, consistent line icons drawn with native views; no font or asset loading. */
export function TabIcon({
  name,
  color,
}: {
  name: "path" | "explore" | "compare" | "you";
  color: string;
}) {
  const stroke = { borderColor: color };
  return (
    <View
      style={s.frame}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {name === "path" ? (
        <>
          <View style={[s.house, stroke]} />
          <View style={[s.roof, stroke]} />
          <View style={[s.door, stroke]} />
        </>
      ) : name === "explore" ? (
        <>
          <View style={[s.lens, stroke]} />
          <View style={[s.handle, { backgroundColor: color }]} />
        </>
      ) : name === "compare" ? (
        <>
          <View style={[s.column, { left: 2 }, stroke]} />
          <View style={[s.column, { right: 2 }, stroke]} />
        </>
      ) : (
        <>
          <View style={[s.head, stroke]} />
          <View style={[s.shoulders, stroke]} />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  frame: { width: 24, height: 24 },
  house: {
    position: "absolute",
    left: 5,
    top: 10,
    width: 14,
    height: 12,
    borderWidth: 1.8,
    borderTopWidth: 0,
    borderRadius: 2,
  },
  roof: {
    position: "absolute",
    left: 5,
    top: 3,
    width: 14,
    height: 14,
    borderLeftWidth: 1.8,
    borderTopWidth: 1.8,
    transform: [{ rotate: "45deg" }],
  },
  door: {
    position: "absolute",
    left: 10,
    top: 15,
    width: 4,
    height: 7,
    borderWidth: 1.5,
    borderBottomWidth: 0,
  },
  lens: {
    position: "absolute",
    left: 2,
    top: 2,
    width: 15,
    height: 15,
    borderWidth: 1.8,
    borderRadius: 8,
  },
  handle: {
    position: "absolute",
    left: 17,
    top: 14,
    width: 1.8,
    height: 9,
    borderRadius: 1,
    transform: [{ rotate: "-45deg" }],
  },
  column: {
    position: "absolute",
    top: 3,
    width: 8,
    height: 18,
    borderWidth: 1.8,
    borderRadius: 2,
  },
  head: {
    position: "absolute",
    left: 8,
    top: 2,
    width: 8,
    height: 8,
    borderWidth: 1.8,
    borderRadius: 5,
  },
  shoulders: {
    position: "absolute",
    left: 3,
    top: 13,
    width: 18,
    height: 9,
    borderWidth: 1.8,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
