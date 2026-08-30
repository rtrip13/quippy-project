import { colors as C } from "../../design/tokens";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { SchoolData } from "../../data/schools";
import { getCareerOutcome } from "../../domain/careerOutcomes";
import { CareerOutcomesCard } from "../../components/CareerOutcomesCard";
import {
  MAX_COMPARISON_PROGRAMS,
  buildMajorComparison,
  toggleComparisonSelection,
  type ComparedProgram,
  type ProgramComparisonDetailsById,
} from "./model";

export type MajorComparisonProps = {
  school: SchoolData;
  selectedIds: readonly string[];
  onSelectedIdsChange: (ids: string[]) => void;
  detailsByProgramId?: ProgramComparisonDetailsById;
  onProgramPress?: (programId: string) => void;
  title?: string;
};

function ProgramCard({
  compared,
  onRemove,
  onProgramPress,
  school,
}: {
  compared: ComparedProgram;
  onRemove: () => void;
  onProgramPress?: () => void;
  school: SchoolData;
}) {
  const { program, accessLabel, sections } = compared;
  const [showOutcomes, setShowOutcomes] = useState(false);
  const outcome = getCareerOutcome({
    schoolId: school.id,
    majorId: program.id,
    family: program.family,
  });
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeading}>
          <Text accessibilityRole="header" style={styles.programName}>
            {program.name}
          </Text>
          <Text style={styles.schoolName}>{program.school}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${program.name} from comparison`}
          hitSlop={10}
          onPress={onRemove}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </View>

      <View style={styles.accessBox}>
        <Text style={styles.sectionLabel}>Entry requirements</Text>
        <Text style={styles.accessText}>{accessLabel}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showOutcomes }}
        onPress={() => setShowOutcomes((value) => !value)}
        style={styles.detailButton}
      >
        <Text style={styles.detailButtonText}>
          {showOutcomes ? "Hide" : "Show"} career paths, pay & employers
        </Text>
      </Pressable>
      {showOutcomes ? (
        <>
          <Text style={styles.note}>
            Outcomes may use different cohorts or national data. Check source,
            year, and career stage before comparing pay.
          </Text>
          <CareerOutcomesCard outcome={outcome} schoolName={school.shortName} />
        </>
      ) : null}

      {sections.map((section) => (
        <View key={section.key} style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.isFallback ? (
              <Text style={styles.fallbackBadge}>Explore</Text>
            ) : null}
          </View>
          {section.items.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Text style={styles.bullet} accessibilityElementsHidden>
                •
              </Text>
              <Text style={styles.item}>{item}</Text>
            </View>
          ))}
          {section.note ? (
            <Text style={styles.note}>{section.note}</Text>
          ) : null}
        </View>
      ))}

      {onProgramPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${program.name} details`}
          onPress={onProgramPress}
          style={({ pressed }) => [
            styles.detailButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.detailButtonText}>Open program details</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MajorComparison({
  school,
  selectedIds,
  onSelectedIdsChange,
  detailsByProgramId,
  onProgramPress,
  title = "Compare majors",
}: MajorComparisonProps) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [choosing, setChoosing] = useState(selectedIds.length < 2);
  const model = useMemo(
    () => buildMajorComparison(school, selectedIds, detailsByProgramId),
    [school, selectedIds, detailsByProgramId],
  );
  const maxed = model.selectedIds.length >= MAX_COMPARISON_PROGRAMS;
  const matchingPrograms = [...school.catalog.programs]
    .sort(
      (a, b) =>
        Number(model.selectedIds.includes(b.id)) -
        Number(model.selectedIds.includes(a.id)),
    )
    .filter((program) =>
      program.name.toLowerCase().includes(query.trim().toLowerCase()),
    );

  const toggle = (programId: string) =>
    onSelectedIdsChange(
      toggleComparisonSelection(
        model.selectedIds,
        programId,
        school.catalog.programs,
      ),
    );

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{school.shortName}</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.intro}>See how the everyday work differs.</Text>
      {!choosing && model.canCompare ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setChoosing(true)}
          style={styles.detailButton}
        >
          <Text style={styles.detailButtonText}>Change selected majors</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.pickerLabel}>Choose two or three majors</Text>
          <TextInput
            accessibilityLabel="Search programs to compare"
            placeholder="Search majors"
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
          <View style={styles.picker} accessibilityRole="list">
            {(showAll ? matchingPrograms : matchingPrograms.slice(0, 6)).map(
              (program) => {
                const selected = model.selectedIds.includes(program.id);
                const disabled = maxed && !selected;
                return (
                  <Pressable
                    key={program.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${selected ? "Remove" : "Add"} ${program.name}`}
                    accessibilityHint={
                      disabled
                        ? "Remove a selected program before adding this one"
                        : undefined
                    }
                    accessibilityState={{ selected, disabled }}
                    disabled={disabled}
                    onPress={() => toggle(program.id)}
                    style={({ pressed }) => [
                      styles.choice,
                      selected && styles.choiceSelected,
                      disabled && styles.disabled,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        selected && styles.choiceTextSelected,
                      ]}
                    >
                      {program.name}
                    </Text>
                    <Text accessible={false} style={styles.selectionMark}>
                      {selected ? "✓" : "+"}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>
          {matchingPrograms.length > 6 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowAll((value) => !value)}
              style={styles.moreButton}
            >
              <Text style={styles.detailButtonText}>
                {showAll
                  ? "Show fewer majors"
                  : `Show all ${matchingPrograms.length} majors`}
              </Text>
            </Pressable>
          ) : null}

          {!matchingPrograms.length && (
            <Text accessibilityLiveRegion="polite" style={styles.note}>
              No programs match your search. Try a broader name or clear the
              search.
            </Text>
          )}

          <Text
            accessibilityLiveRegion="polite"
            style={[styles.status, model.canCompare && styles.statusReady]}
          >
            {model.selectionMessage}
          </Text>
          {model.canCompare ? (
            <Pressable
              accessibilityRole="button"
              style={styles.compareButton}
              onPress={() => {
                setChoosing(false);
                setQuery("");
                setShowAll(false);
              }}
            >
              <Text style={styles.compareButtonText}>
                Compare {model.selectedIds.length} majors
              </Text>
            </Pressable>
          ) : null}
        </>
      )}

      {model.programs.map((compared) => (
        <ProgramCard
          key={compared.program.id}
          compared={compared}
          school={school}
          onRemove={() => toggle(compared.program.id)}
          onProgramPress={
            onProgramPress
              ? () => onProgramPress(compared.program.id)
              : undefined
          }
        />
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showSource }}
        style={styles.moreButton}
        onPress={() => setShowSource((value) => !value)}
      >
        <Text style={styles.sourceLabel}>
          {showSource ? "Hide" : "About"} this catalog
        </Text>
      </Pressable>
      {showSource ? (
        <Text style={styles.catalogNoteText}>
          {model.catalogNote} Verify current requirements with{" "}
          {school.shortName}.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingVertical: 24 },
  eyebrow: { color: C.muted, fontSize: 13, marginBottom: 10 },
  title: {
    color: C.ink,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.7,
    fontWeight: "700",
  },
  intro: { color: C.muted, fontSize: 16, lineHeight: 24, marginTop: 8 },
  pickerLabel: {
    color: C.ink,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
  },
  picker: { paddingVertical: 8 },
  search: {
    marginTop: 14,
    padding: 14,
    minHeight: 52,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    backgroundColor: C.white,
    color: C.ink,
    fontSize: 16,
  },
  moreButton: { minHeight: 44, paddingVertical: 12, justifyContent: "center" },
  sourceLabel: {
    color: C.muted,
    fontSize: 13,
    textDecorationLine: "underline",
  },
  selectionMark: { color: C.cobalt, fontSize: 20, marginLeft: 12 },
  compareButton: {
    backgroundColor: C.cobalt,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
    minHeight: 52,
  },
  compareButtonText: { color: C.white, fontSize: 16, fontWeight: "600" },
  choice: {
    borderBottomColor: C.line,
    borderBottomWidth: 1,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  choiceSelected: { backgroundColor: C.tint },
  choiceText: {
    color: C.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400",
    flex: 1,
  },
  choiceTextSelected: { color: C.cobalt, fontWeight: "600" },
  disabled: { opacity: 0.38 },
  pressed: { opacity: 0.68 },
  status: { color: C.muted, fontSize: 14, fontWeight: "400" },
  statusReady: { color: C.teal },
  catalogNote: {
    backgroundColor: C.tint,
    borderRadius: 12,
    marginTop: 14,
    padding: 12,
  },
  catalogNoteText: { color: C.muted, fontSize: 13, lineHeight: 19 },
  card: {
    borderTopColor: C.ink,
    borderTopWidth: 1,
    marginTop: 28,
    paddingVertical: 24,
  },
  cardHeader: { flexDirection: "row", gap: 12 },
  cardHeading: { flex: 1 },
  programName: { color: C.ink, fontSize: 22, fontWeight: "700" },
  schoolName: { color: C.muted, fontSize: 14, lineHeight: 20, marginTop: 3 },
  removeButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  removeText: { color: "#C24C31", fontSize: 14, fontWeight: "700" },
  accessBox: {
    marginTop: 16,
  },
  sectionLabel: {
    color: C.cobalt,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  accessText: { color: C.ink, fontSize: 15, lineHeight: 21, marginTop: 4 },
  section: {
    borderTopColor: "#EEEAE2",
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  sectionTitleRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  sectionTitle: { color: C.ink, fontSize: 17, fontWeight: "700" },
  fallbackBadge: {
    backgroundColor: "#FFF0E8",
    borderRadius: 999,
    color: "#9B432E",
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  bulletRow: { flexDirection: "row", marginTop: 8 },
  bullet: { color: "#14846F", fontSize: 18, lineHeight: 21, width: 18 },
  item: { color: "#353B37", flex: 1, fontSize: 15, lineHeight: 21 },
  note: {
    color: "#68706A",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  detailButton: {
    alignItems: "center",
    borderColor: C.cobalt,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  detailButtonText: { color: C.cobalt, fontSize: 15, fontWeight: "600" },
});
