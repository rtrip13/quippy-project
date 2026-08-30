import { colors as C } from "../../design/tokens";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Family } from "../../data/schools/types";
import type {
  FieldworkReflection,
  ReflectionCuriosity,
  ReflectionEnergy,
  ReflectionRepeatIntent,
} from "../../state";
import type { MissionBrief } from "./brief";

type Props = {
  missionId: string;
  initialStage?: "brief" | "reflect";
  family: Family;
  fieldName: string;
  brief: MissionBrief;
  planned: boolean;
  reflection?: FieldworkReflection;
  onPlan: () => void;
  onSave: (reflection: FieldworkReflection) => void;
  onRemove: () => void;
  onClose: () => void;
};

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={s.question}>
      <Text style={s.questionTitle}>{label}</Text>
      <View style={s.choices}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: value === option.value }}
            onPress={() => onChange(option.value)}
            style={[s.choice, value === option.value && s.selected]}
          >
            <Text
              style={[s.choiceText, value === option.value && s.selectedText]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function MissionWorkspace({
  missionId,
  initialStage = "brief",
  family,
  fieldName,
  brief,
  planned,
  reflection,
  onPlan,
  onSave,
  onRemove,
  onClose,
}: Props) {
  const [stage, setStage] = useState(initialStage);
  const [energy, setEnergy] = useState<ReflectionEnergy | null>(
    reflection?.energy ?? null,
  );
  const [curiosity, setCuriosity] = useState<ReflectionCuriosity | null>(
    reflection?.curiosity ?? null,
  );
  const [repeatIntent, setRepeatIntent] =
    useState<ReflectionRepeatIntent | null>(reflection?.repeatIntent ?? null);
  const [cause, setCause] = useState<NonNullable<
    FieldworkReflection["experienceCause"]
  > | null>(reflection?.experienceCause ?? null);
  const [note, setNote] = useState(reflection?.note ?? "");
  const [dirty, setDirty] = useState(false);
  const ready = energy && curiosity && repeatIntent && cause;
  const change =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setDirty(true);
      setter(value);
    };
  const close = () => {
    if (!dirty) return onClose();
    Alert.alert(
      "Leave this reflection?",
      "Your mission stays in your plan, but these unsaved reflection edits will be discarded.",
      [
        { text: "Keep editing", style: "cancel" },
        { text: "Leave", onPress: onClose },
      ],
    );
  };
  const openResource = () => {
    if (!brief.resource) return;
    void Linking.openURL(brief.resource.url).catch(() =>
      Alert.alert(
        "Couldn't open this page",
        "Try again when you're connected. The mission instructions remain available here.",
      ),
    );
  };
  return (
    <ScrollView
      key={stage}
      contentContainerStyle={s.page}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable accessibilityRole="button" onPress={close} style={s.back}>
        <Text style={s.link}>← Back to my plan</Text>
      </Pressable>
      <Text style={s.kicker}>
        {fieldName.toUpperCase()} ·{" "}
        {reflection
          ? "COMPLETED"
          : planned
            ? "IN PROGRESS · SAVED"
            : "YOUR NEXT EXPERIMENT"}
      </Text>
      <Text style={s.title}>
        {stage === "brief" ? brief.title : "What did the work feel like?"}
      </Text>
      {stage === "brief" ? (
        <>
          <Text style={s.body}>{brief.prompt}</Text>
          <Text style={s.disclaimer}>
            An exploration exercise, not a grade, aptitude test, or university
            assignment.
          </Text>
          {brief.steps.map((step, index) => (
            <View key={step} style={s.step}>
              <Text style={s.number}>{index + 1}</Text>
              <Text style={[s.body, { flex: 1 }]}>{step}</Text>
            </View>
          ))}
          <View style={s.card}>
            <Text style={s.kicker}>Bring back one small thing</Text>
            <Text style={s.body}>{brief.deliverable}</Text>
          </View>
          {brief.resource && (
            <Pressable
              accessibilityRole="link"
              onPress={openResource}
              style={s.secondary}
            >
              <Text style={s.link}>{brief.resource.label} ↗</Text>
            </Pressable>
          )}
          {brief.outreach && (
            <View style={s.card}>
              <Text style={s.kicker}>A message you can adapt</Text>
              <Text selectable style={s.body}>
                {brief.outreach}
              </Text>
              <Pressable
                accessibilityRole="button"
                style={s.secondary}
                onPress={() =>
                  void Share.share({ message: brief.outreach! }).catch(() =>
                    Alert.alert(
                      "Unable to share",
                      "You can select the text above to copy it.",
                    ),
                  )
                }
              >
                <Text style={s.link}>Share message draft</Text>
              </Pressable>
            </View>
          )}
          {!planned && !reflection ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={onPlan}
                style={s.primary}
              >
                <Text style={s.primaryText}>Start this mission</Text>
              </Pressable>
              <Text style={s.disclaimer}>
                Starting saves it in your plan. It does not add evidence or mark
                it complete.
              </Text>
            </>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={() => setStage("reflect")}
                style={s.primary}
              >
                <Text style={s.primaryText}>
                  {reflection ? "REVIEW MY REFLECTION" : "I TRIED IT — REFLECT"}
                </Text>
              </Pressable>
              <Text style={s.disclaimer}>
                Only reflect on something you actually tried. You can return to
                the plan and come back later.
              </Text>
            </>
          )}
        </>
      ) : (
        <>
          <Text style={s.body}>
            Reflect only on an activity you actually tried. A draining experience
            is useful evidence too. Separate the work from the circumstances.
          </Text>
          <Choice
            label="How was your energy?"
            value={energy}
            onChange={change(setEnergy)}
            options={[
              { value: "energized", label: "Energized" },
              { value: "neutral", label: "Neutral" },
              { value: "drained", label: "Drained" },
            ]}
          />
          <Choice
            label="Once the newness wore off, interest…"
            value={curiosity}
            onChange={change(setCuriosity)}
            options={[
              { value: "grew", label: "Grew" },
              { value: "held", label: "Held" },
              { value: "faded", label: "Faded" },
            ]}
          />
          <Choice
            label="Would you do it again without résumé credit?"
            value={repeatIntent}
            onChange={change(setRepeatIntent)}
            options={[
              { value: "yes", label: "Yes" },
              { value: "maybe", label: "Maybe" },
              { value: "no", label: "No" },
            ]}
          />
          <Choice
            label="What most shaped that reaction?"
            value={cause}
            onChange={change(setCause)}
            options={[
              { value: "work", label: "The work itself" },
              { value: "setting", label: "People, timing, or setting" },
              { value: "unsure", label: "Hard to separate" },
            ]}
          />
          {cause && cause !== "work" && (
            <Text style={s.disclaimer}>
              We'll keep this in your timeline without changing your rankings.
              Try the work in a different setting before drawing a conclusion.
            </Text>
          )}
          <Text style={s.questionTitle}>
            One moment worth remembering (optional)
          </Text>
          <TextInput
            accessibilityLabel="Fieldwork reflection note"
            value={note}
            onChangeText={change(setNote)}
            multiline
            maxLength={280}
            placeholder="What did you actually do? What would you repeat?"
            style={s.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready }}
            disabled={!ready}
            style={[s.primary, !ready && { opacity: 0.45 }]}
            onPress={() => {
              if (!energy || !curiosity || !repeatIntent || !cause) return;
              onSave({
                missionId,
                energy,
                curiosity,
                repeatIntent,
                experienceCause: cause,
                note,
                friction: reflection?.friction ?? [],
                recordedAt: new Date().toISOString(),
                ...(missionId.endsWith(":work-sample")
                  ? { workSampleFamily: reflection?.workSampleFamily ?? family }
                  : {}),
              });
            }}
          >
            <Text style={s.primaryText}>
              {reflection ? "UPDATE MY REFLECTION" : "SAVE THIS CLUE"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setStage("brief")}
            style={s.secondary}
          >
            <Text style={s.link}>Back to the instructions</Text>
          </Pressable>
          {reflection && (
            <Pressable
              accessibilityRole="button"
              style={s.secondary}
              onPress={() =>
                Alert.alert(
                  "Remove this evidence?",
                  "This removes the reflection and returns the mission to not started. Other progress stays intact.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Remove", style: "destructive", onPress: onRemove },
                  ],
                )
              }
            >
              <Text style={{ color: "#A13C2E" }}>Remove this evidence</Text>
            </Pressable>
          )}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 24, paddingBottom: 40, gap: 16 },
  back: { minHeight: 44, justifyContent: "center" },
  kicker: {
    fontSize: 12,
    fontWeight: "600",
    color: C.cobalt,
    letterSpacing: 0.3,
  },
  title: { fontSize: 30, lineHeight: 35, fontWeight: "700", color: C.ink },
  body: { fontSize: 16, lineHeight: 24, color: C.ink },
  disclaimer: { fontSize: 13, lineHeight: 20, color: C.muted },
  step: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  number: { fontSize: 21, fontWeight: "700", color: C.cobalt, paddingTop: 2 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    padding: 18,
    gap: 10,
  },
  primary: {
    minHeight: 56,
    backgroundColor: C.cobalt,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  secondary: { minHeight: 48, justifyContent: "center", paddingVertical: 10 },
  link: { color: C.cobalt, fontWeight: "600", fontSize: 14 },
  question: { gap: 10, marginVertical: 4 },
  questionTitle: { fontSize: 16, fontWeight: "600", color: C.ink },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    minHeight: 48,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  selected: { backgroundColor: C.cobalt, borderColor: C.cobalt },
  choiceText: { color: C.ink, fontWeight: "700", fontSize: 14 },
  selectedText: { color: "#FFFFFF" },
  input: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    lineHeight: 23,
    textAlignVertical: "top",
    color: C.ink,
  },
});
