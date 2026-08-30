import { colors as C } from "../design/tokens";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type PatternShiftRankedResult = {
  id: string;
  name: string;
};

export type PatternShiftEnergy = "energized" | "neutral" | "drained";

export type PatternShiftRevealProps = {
  before: PatternShiftRankedResult[];
  after: PatternShiftRankedResult[];
  energy: PatternShiftEnergy;
  focusedField: string;
  focusedDirection?: string;
  changedSignals?: string[];
  onDismiss: () => void;
  onNextTest: () => void;
  nextTestLabel?: string;
};

const palette = {
  paper: C.bg,
  ink: C.ink,
  muted: C.muted,
  line: C.line,
  cobalt: C.cobalt,
  orange: C.orange,
  teal: C.teal,
  white: "#FFFFFF",
  softBlue: "#E6EDFF",
  softOrange: "#FFF0E9",
  softTeal: "#E3F3EF",
};

const energyCopy: Record<PatternShiftEnergy, string> = {
  energized: "That gave you energy. Definitely worth another round.",
  neutral:
    "A neutral reaction is useful evidence. A second experiment may clarify it.",
  drained: "That took more than it gave. Good thing you tested it first.",
};

const energyLabel: Record<PatternShiftEnergy, string> = {
  energized: "ENERGY UP",
  neutral: "PRETTY NEUTRAL",
  drained: "ENERGY DOWN",
};

function rankOf(results: PatternShiftRankedResult[], fieldName: string) {
  const normalizedName = fieldName.trim().toLocaleLowerCase();
  const index = results.findIndex(
    (result) =>
      result.id.toLocaleLowerCase() === normalizedName ||
      result.name.toLocaleLowerCase() === normalizedName,
  );

  return index < 0 ? null : index + 1;
}

function rankLabel(rank: number | null) {
  return rank === null ? "—" : `#${rank}`;
}

export function PatternShiftReveal({
  before,
  after,
  energy,
  focusedField,
  focusedDirection = focusedField,
  changedSignals = [],
  onDismiss,
  onNextTest,
  nextTestLabel = "CHOOSE MY NEXT EXPERIMENT",
}: PatternShiftRevealProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const beforeRank = useMemo(
    () => rankOf(before, focusedDirection),
    [before, focusedDirection],
  );
  const afterRank = useMemo(
    () => rankOf(after, focusedDirection),
    [after, focusedDirection],
  );

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      damping: 18,
      stiffness: 150,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const movement =
    beforeRank !== null && afterRank !== null ? beforeRank - afterRank : 0;
  const hasRankChange = movement !== 0;
  const enteredPattern = beforeRank === null && afterRank !== null;
  const leftPattern = beforeRank !== null && afterRank === null;

  let headline = "Your evidence is growing.";
  let rankSummary = `${focusedDirection} stayed at ${rankLabel(afterRank)}.`;

  if (enteredPattern) {
    headline = "A new direction to explore.";
    rankSummary = `${focusedDirection} entered your pattern at ${rankLabel(afterRank)}.`;
  } else if (leftPattern) {
    headline = "Your list just got shorter.";
    rankSummary = `${focusedDirection} moved outside your top three directions.`;
  } else if (movement > 0) {
    headline = "A direction gained evidence.";
    rankSummary = `${focusedDirection} rose ${movement === 1 ? "one place" : `${movement} places`}.`;
  } else if (movement < 0) {
    const places = Math.abs(movement);
    headline = "A useful reason to reconsider.";
    rankSummary = `${focusedDirection} fell ${places === 1 ? "one place" : `${places} places`}.`;
  } else if (beforeRank === null && afterRank === null) {
    rankSummary = `${focusedDirection} remains outside your top three directions.`;
  }

  const showArrow = beforeRank !== null || afterRank !== null;
  const honestHoldCopy =
    changedSignals.length > 0
      ? "The clues changed, just not enough to shake up your top options yet."
      : "This reflection is saved, but does not add clear evidence about the work itself. Try a different setting before drawing a conclusion.";
  const signalGlyph =
    energy === "energized" ? "↑" : energy === "drained" ? "↓" : "→";

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.topline}>
            <Text style={styles.wordmark}>UNLABELED</Text>
            <Text style={styles.step}>Reflection saved</Text>
          </View>

          <Text style={styles.eyebrow}>New clue added</Text>
          <Text style={styles.title}>{headline}</Text>
          <Text style={styles.lead}>{rankSummary}</Text>
          {focusedDirection !== focusedField ? (
            <Text style={styles.footerThought}>
              Your {focusedField} experiment informs this broad direction; it
              does not establish a ranking of individual majors.
            </Text>
          ) : null}

          {showArrow ? (
            <View style={styles.rankCard}>
              <View style={styles.rankColumn}>
                <Text style={styles.rankCaption}>Before</Text>
                <Text style={styles.rankNumber}>{rankLabel(beforeRank)}</Text>
              </View>
              <Text
                style={[
                  styles.rankArrow,
                  hasRankChange && styles.rankArrowChanged,
                ]}
              >
                →
              </Text>
              <View style={[styles.rankColumn, styles.rankColumnAfter]}>
                <Text style={styles.rankCaption}>Now</Text>
                <Text style={[styles.rankNumber, styles.rankNumberAfter]}>
                  {rankLabel(afterRank)}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.evidenceCard}>
            <View style={styles.evidenceHeader}>
              <View style={[styles.energyDot, styles[`energy_${energy}`]]} />
              <Text style={styles.evidenceLabel}>{energyLabel[energy]}</Text>
            </View>
            <Text style={styles.evidenceText}>{energyCopy[energy]}</Text>
          </View>

          {changedSignals.length > 0 ? (
            <View style={styles.signalSection}>
              <Text style={styles.sectionLabel}>What this clue touched</Text>
              <View style={styles.signalList}>
                {changedSignals.map((signal) => (
                  <View key={signal} style={styles.signalPill}>
                    <Text style={styles.signalPlus}>{signalGlyph}</Text>
                    <Text style={styles.signalText}>{signal}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {!hasRankChange && !enteredPattern && !leftPattern ? (
            <View style={styles.holdNote}>
              <Text style={styles.holdLabel}>Why the order held</Text>
              <Text style={styles.holdText}>{honestHoldCopy}</Text>
            </View>
          ) : null}

          <View style={styles.rule} />
          <Text style={styles.footerThought}>
            A recommendation is a hypothesis. Keep the evidence, and choose what
            to test next.
          </Text>
        </Animated.View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onDismiss}
          style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]}
        >
          <Text style={styles.dismissText}>Back to my plan</Text>
        </Pressable>
        <View style={styles.primaryEdge}>
          <Pressable
            accessibilityRole="button"
            onPress={onNextTest}
            style={({ pressed }) => [
              styles.primary,
              pressed && styles.primaryPressed,
            ]}
          >
            <Text style={styles.primaryText}>{nextTestLabel}</Text>
            <Text style={styles.primaryArrow}>→</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
  },
  topline: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    marginBottom: 42,
  },
  wordmark: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  step: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  eyebrow: {
    color: palette.orange,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  title: {
    color: palette.ink,
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -1.7,
    maxWidth: 350,
  },
  lead: {
    color: palette.muted,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 26,
  },
  rankCard: {
    minHeight: 132,
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.line,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  rankColumn: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  rankColumnAfter: {
    backgroundColor: palette.softBlue,
  },
  rankCaption: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  rankNumber: {
    color: palette.ink,
    fontSize: 43,
    lineHeight: 47,
    fontWeight: "700",
    letterSpacing: -1.5,
  },
  rankNumberAfter: {
    color: palette.cobalt,
  },
  rankArrow: {
    alignSelf: "center",
    color: palette.line,
    fontSize: 24,
    fontWeight: "700",
    marginHorizontal: -11,
    zIndex: 1,
  },
  rankArrowChanged: {
    color: palette.cobalt,
  },
  evidenceCard: {
    backgroundColor: palette.ink,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  evidenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },
  energyDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  energy_energized: {
    backgroundColor: "#54CDB0",
  },
  energy_neutral: {
    backgroundColor: "#E1C768",
  },
  energy_drained: {
    backgroundColor: "#FF8365",
  },
  evidenceLabel: {
    color: palette.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  evidenceText: {
    color: palette.white,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "700",
  },
  signalSection: {
    marginBottom: 22,
  },
  sectionLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 11,
  },
  signalList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  signalPill: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: palette.softTeal,
    borderWidth: 1,
    borderColor: "#B8DCD3",
  },
  signalPlus: {
    color: palette.teal,
    fontSize: 15,
    fontWeight: "700",
  },
  signalText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "600",
  },
  holdNote: {
    backgroundColor: palette.softOrange,
    borderLeftWidth: 4,
    borderLeftColor: palette.orange,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 22,
  },
  holdLabel: {
    color: palette.orange,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 7,
  },
  holdText: {
    color: palette.ink,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  rule: {
    height: 1,
    backgroundColor: palette.ink,
    marginBottom: 12,
  },
  footerThought: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.paper,
  },
  dismiss: {
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  dismissText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  primaryEdge: {
    flex: 1,
    backgroundColor: "#11110F",
    borderRadius: 12,
    paddingBottom: 4,
    overflow: "hidden",
  },
  primary: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: palette.ink,
    borderRadius: 13,
    paddingHorizontal: 17,
  },
  primaryPressed: {
    transform: [{ translateY: 2 }],
  },
  primaryText: {
    flexShrink: 1,
    color: palette.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  primaryArrow: {
    color: palette.white,
    fontSize: 21,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.55,
  },
});

export default PatternShiftReveal;
