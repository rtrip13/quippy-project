import { colors as C } from "../../design/tokens";
import * as Haptics from "expo-haptics";
import { useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native";

import { schoolClubsById, schoolRegistry } from "../../data/schools";

const light = () => Haptics.selectionAsync().catch(() => undefined);

const schoolLogos: Readonly<Record<string, ImageSourcePropType>> = {
  umich: require("../../../assets/schools/umich.png"),
  "uc-berkeley": require("../../../assets/schools/uc-berkeley.png"),
  ucla: require("../../../assets/schools/ucla.png"),
  "ut-austin": require("../../../assets/schools/ut-austin.png"),
  ufl: require("../../../assets/schools/ufl.png"),
  "uw-seattle": require("../../../assets/schools/uw-seattle.png"),
  stanford: require("../../../assets/schools/stanford.png"),
  harvard: require("../../../assets/schools/harvard.png"),
  mit: require("../../../assets/schools/mit.png"),
  nyu: require("../../../assets/schools/nyu.png"),
  howard: require("../../../assets/schools/howard.png"),
  spelman: require("../../../assets/schools/spelman.png"),
};

export type ProgramOption = {
  id: string;
  name: string;
};

type PickerCardProps = {
  children: ReactNode;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
};

function PickerCard({
  children,
  selected,
  onPress,
  style,
  accessibilityLabel,
}: PickerCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: 0.975,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
      }
    >
      <Animated.View
        style={[
          styles.card,
          selected && styles.cardSelected,
          style,
          { transform: [{ scale }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

type SelectTileProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function SelectTile({ label, selected, onPress }: SelectTileProps) {
  return (
    <PickerCard
      accessibilityLabel={label}
      selected={selected}
      onPress={() => {
        light();
        onPress();
      }}
      style={styles.selectTile}
    >
      <Text style={[styles.selectText, selected && { color: C.white }]}>
        {label}
      </Text>
      <View
        accessible={false}
        style={[
          styles.selectMark,
          selected && { backgroundColor: C.white, borderColor: C.white },
        ]}
      >
        <Text
          style={{ color: selected ? C.ink : "transparent", fontWeight: "700" }}
        >
          ✓
        </Text>
      </View>
    </PickerCard>
  );
}

export type UniversityPickerProps = {
  selectedId: string;
  onSelect: (schoolId: string) => void;
};

export function UniversityPicker({
  selectedId,
  onSelect,
}: UniversityPickerProps) {
  const [query, setQuery] = useState("");
  const schools = schoolRegistry.filter((school) =>
    `${school.name} ${school.shortName} ${school.location}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search universities"
          placeholderTextColor="#8A918B"
          style={styles.universityInput}
        />
      </View>
      <View style={{ gap: 10 }}>
        {schools.map((school) => (
          <PickerCard
            key={school.id}
            accessibilityLabel={`${school.name}, ${school.location}`}
            selected={selectedId === school.id}
            onPress={() => {
              light();
              onSelect(school.id);
            }}
            style={styles.universityCard}
          >
            <View style={styles.universityLogoFrame}>
              {schoolLogos[school.id] ? (
                <Image
                  accessible={false}
                  resizeMode="contain"
                  source={schoolLogos[school.id]}
                  style={styles.universityLogo}
                />
              ) : (
                <Text style={styles.universityLogoFallback}>?</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.universityName,
                  selectedId === school.id && { color: C.white },
                ]}
              >
                {school.name}
              </Text>
              <Text
                style={[
                  styles.universityLocation,
                  selectedId === school.id && { color: "#DDE4FF" },
                ]}
              >
                {school.location}
              </Text>
            </View>
            <Text
              style={[
                styles.dataDepth,
                selectedId === school.id && { color: C.white },
              ]}
            >
              {school.dataDepth === "full"
                ? "CAMPUS READY"
                : schoolClubsById[school.id]?.length
                  ? "CLUBS READY"
                  : school.dataDepth === "starter"
                    ? "STARTER DATA"
                    : "FIELD MATCHING"}
            </Text>
          </PickerCard>
        ))}
      </View>
    </>
  );
}

export type DeclaredPickerProps = {
  programs: readonly ProgramOption[];
  selected: readonly string[];
  onToggle: (programName: string) => void;
  emptyLabel?: string;
  exclude?: readonly string[];
};

export function DeclaredPicker({
  programs,
  selected,
  onToggle,
  emptyLabel = "I'm completely undecided",
  exclude = [],
}: DeclaredPickerProps) {
  const [query, setQuery] = useState("");
  const visible = programs.filter(
    (program) =>
      !exclude.includes(program.name) &&
      program.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search fields and programs"
          placeholderTextColor="#8A918B"
          style={styles.universityInput}
        />
      </View>
      <SelectTile
        label={emptyLabel}
        selected={selected.includes(emptyLabel)}
        onPress={() => onToggle(emptyLabel)}
      />
      {visible.map((program) => (
        <SelectTile
          key={program.id}
          label={program.name}
          selected={selected.includes(program.name)}
          onPress={() => onToggle(program.name)}
        />
      ))}
    </>
  );
}

export type AdmissionReasonsPickerProps = {
  reasons: readonly string[];
  selected: readonly string[];
  note: string;
  onToggle: (reason: string) => void;
  onNoteChange: (note: string) => void;
};

export function AdmissionReasonsPicker({
  reasons,
  selected,
  note,
  onToggle,
  onNoteChange,
}: AdmissionReasonsPickerProps) {
  return (
    <>
      <View style={styles.countRow}>
        <Text style={styles.micro}>Your own reasons</Text>
        <Text style={styles.count}>{selected.length} / 3</Text>
      </View>
      <View style={{ gap: 10 }}>
        {reasons.map((reason) => (
          <SelectTile
            key={reason}
            label={reason}
            selected={selected.includes(reason)}
            onPress={() => onToggle(reason)}
          />
        ))}
      </View>
      <Text style={styles.inputLabel}>Say it in your own words · optional</Text>
      <TextInput
        value={note}
        onChangeText={onNoteChange}
        placeholder="The part I keep coming back to is…"
        placeholderTextColor="#8A918B"
        multiline
        maxLength={240}
        style={styles.longInput}
      />
    </>
  );
}

export type AlternativesPickerProps = DeclaredPickerProps & {
  noOtherMajorsYet: boolean;
  noOtherMajorsLabel: string;
  draft: string;
  onDraftChange: (draft: string) => void;
  onAddDraft: () => void;
};

export function AlternativesPicker({
  programs,
  selected,
  onToggle,
  exclude,
  noOtherMajorsYet,
  noOtherMajorsLabel,
  draft,
  onDraftChange,
  onAddDraft,
}: AlternativesPickerProps) {
  const addDisabled = !draft.trim() || selected.length >= 3;
  return (
    <>
      <View style={styles.countRow}>
        <Text style={styles.micro}>Other directions</Text>
        <Text style={styles.count}>
          {noOtherMajorsYet ? "NONE YET" : `${selected.length} / 3`}
        </Text>
      </View>
      <View style={styles.addMajorRow}>
        <TextInput
          value={draft}
          onChangeText={onDraftChange}
          onSubmitEditing={onAddDraft}
          placeholder="Type another major"
          placeholderTextColor="#8A918B"
          returnKeyType="done"
          style={styles.addMajorInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add considered major"
          disabled={addDisabled}
          onPress={onAddDraft}
          style={[styles.addMajorButton, addDisabled && { opacity: 0.35 }]}
        >
          <Text style={styles.addMajorButtonText}>Add</Text>
        </Pressable>
      </View>
      <Text style={styles.pickerDivider}>Or browse our current catalog</Text>
      <DeclaredPicker
        programs={programs}
        selected={noOtherMajorsYet ? [noOtherMajorsLabel] : selected}
        emptyLabel={noOtherMajorsLabel}
        exclude={exclude}
        onToggle={onToggle}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  cardSelected: { backgroundColor: C.cobalt, borderColor: C.cobalt },
  searchBox: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: C.line,
    borderBottomWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    backgroundColor: C.white,
  },
  searchIcon: { fontSize: 25 },
  universityInput: { flex: 1, fontSize: 16, color: C.ink, paddingVertical: 0 },
  universityCard: {
    minHeight: 84,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  universityLogoFrame: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: C.white,
    borderColor: "#E2DED5",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  universityLogo: { width: 38, height: 38 },
  universityLogoFallback: {
    fontSize: 21,
    fontWeight: "700",
    color: C.cobalt,
  },
  universityName: { fontSize: 15, fontWeight: "700", color: C.ink },
  universityLocation: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
    marginTop: 4,
  },
  dataDepth: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
    maxWidth: 62,
    textAlign: "right",
  },
  selectTile: {
    minHeight: 58,
    marginBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 15,
    fontWeight: "600",
    color: C.ink,
    flex: 1,
    paddingRight: 8,
  },
  selectMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  micro: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    color: C.muted,
  },
  count: { fontSize: 12, fontWeight: "700" },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
    marginTop: 24,
    marginBottom: 9,
  },
  longInput: {
    minHeight: 112,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 12,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 21,
    color: C.ink,
    textAlignVertical: "top",
  },
  addMajorRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "stretch",
  },
  addMajorInput: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: C.line,
    borderBottomWidth: 1,
    borderRadius: 12,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    fontSize: 15,
    color: C.ink,
  },
  addMajorButton: {
    minWidth: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: C.cobalt,
    borderBottomWidth: 1,
    borderBottomColor: C.cobalt,
  },
  addMajorButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  pickerDivider: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
});
