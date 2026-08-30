import { colors as C } from "../../design/tokens";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { SchoolData } from "../../data/schools/types";
import { fieldworkFocusOptions } from "./focus";

export function FocusPicker({
  school,
  currentId,
  savedIds,
  onSelect,
  onClose,
}: {
  school: SchoolData;
  currentId: string;
  savedIds: string[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const options = fieldworkFocusOptions(school).filter((option) =>
    option.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const saved = options.filter((option) => savedIds.includes(option.id));
  const remaining = options.filter((option) => !savedIds.includes(option.id));
  return (
    <ScrollView
      contentContainerStyle={s.page}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable accessibilityRole="button" style={s.close} onPress={onClose}>
        <Text style={s.link}>← Back to my plan</Text>
      </Pressable>
      <Text style={s.title}>What do you want to test?</Text>
      <Text style={s.body}>
        Choose a direction or a campus program. Switching keeps every mission
        and reflection. Your choice stays put even if the rankings change.
      </Text>
      <TextInput
        accessibilityLabel="Search fields and programs"
        placeholder="Search fields and programs"
        value={query}
        onChangeText={setQuery}
        style={s.search}
      />
      {[
        { title: "YOUR SAVED PROGRAMS", items: saved },
        { title: "DIRECTIONS & CAMPUS PROGRAMS", items: remaining },
      ].map(
        (group) =>
          group.items.length > 0 && (
            <View key={group.title} style={{ gap: 10 }}>
              <Text style={s.kicker}>{group.title}</Text>
              {group.items.map((option) => (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: option.id === currentId }}
                  onPress={() => onSelect(option.id)}
                  style={[s.row, option.id === currentId && s.selected]}
                >
                  <Text style={s.name}>
                    {option.name}
                    {option.id === currentId ? " ✓" : ""}
                  </Text>
                  <Text style={s.meta}>
                    {option.program
                      ? option.program.school
                      : "Broad direction · not a specific degree"}
                  </Text>
                </Pressable>
              ))}
            </View>
          ),
      )}
      {!options.length && (
        <Text style={s.body}>
          No matches in this catalog. Try a broader field name.
        </Text>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 24, gap: 18, paddingBottom: 40 },
  close: { minHeight: 44, justifyContent: "center" },
  link: { fontSize: 14, color: C.cobalt, fontWeight: "600" },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "700", color: C.ink },
  body: { fontSize: 16, lineHeight: 23, color: C.muted },
  search: {
    minHeight: 52,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    color: C.ink,
    fontSize: 16,
  },
  kicker: { fontSize: 12, fontWeight: "600", color: C.cobalt },
  row: {
    padding: 16,
    gap: 5,
    minHeight: 64,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  selected: { backgroundColor: "#EFEDFF", borderColor: C.cobalt },
  name: { fontSize: 16, fontWeight: "600", color: C.ink },
  meta: { fontSize: 12, color: C.muted },
});
