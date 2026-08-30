import { colors as C } from "../design/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type HypothesisTestCardProps = {
  known: string;
  uncertainty: string;
  rationale: string;
  testTitle: string;
  testTime: string;
  falsificationPrompts: string[];
  onStartTest: () => void;
};

const palette = {
  paper: "#FFFFFF",
  ink: C.ink,
  muted: C.muted,
  line: C.line,
  cobalt: C.cobalt,
  orange: C.orange,
  white: "#FFFFFF",
  softBlue: C.tint,
  softOrange: "#FFF0E9",
  softTeal: "#E3F3EF",
  tealLine: "#B8DCD3",
};

export function HypothesisTestCard({
  known,
  uncertainty,
  rationale,
  testTitle,
  testTime,
  falsificationPrompts,
  onStartTest,
}: HypothesisTestCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.kickerRow}>
          <Text style={styles.kicker}>Next experiment</Text>
        </View>
        <View style={styles.timePill}>
          <Text style={styles.time}>{testTime}</Text>
        </View>
      </View>

      <Text style={styles.title}>{testTitle}</Text>
      <Text style={styles.rationale}>{rationale}</Text>

      <View style={styles.evidenceGrid}>
        <View style={[styles.evidencePanel, styles.knownPanel]}>
          <Text style={[styles.panelLabel, styles.knownLabel]}>
            What you know
          </Text>
          <Text style={styles.panelText}>{known}</Text>
        </View>
        <View style={[styles.evidencePanel, styles.uncertaintyPanel]}>
          <Text style={[styles.panelLabel, styles.uncertaintyLabel]}>
            What to test
          </Text>
          <Text style={styles.panelText}>{uncertainty}</Text>
        </View>
      </View>

      {falsificationPrompts.length > 0 ? (
        <View style={styles.falsificationSection}>
          <Text style={styles.falsificationTitle}>
            What to pay attention to
          </Text>
          <View style={styles.promptList}>
            {falsificationPrompts.map((prompt, index) => (
              <View key={`${index}-${prompt}`} style={styles.promptRow}>
                <View style={styles.promptNumber}>
                  <Text style={styles.promptNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.promptText}>{prompt}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.buttonEdge}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Start test: ${testTitle}`}
          onPress={onStartTest}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <View>
            <Text style={styles.buttonLabel}>Try this experiment</Text>
            <Text style={styles.buttonMeta}>{testTime}</Text>
          </View>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.paper,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    padding: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  kickerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kickerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.orange,
  },
  kicker: {
    color: palette.orange,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  timePill: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: palette.softBlue,
  },
  time: {
    color: palette.cobalt,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  title: {
    color: palette.ink,
    fontSize: 26,
    lineHeight: 29,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginBottom: 9,
  },
  rationale: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginBottom: 18,
  },
  evidenceGrid: {
    gap: 8,
    marginBottom: 20,
  },
  evidencePanel: {
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  knownPanel: {
    borderColor: palette.line,
  },
  uncertaintyPanel: {
    borderColor: palette.line,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  knownLabel: {
    color: "#14846F",
  },
  uncertaintyLabel: {
    color: palette.orange,
  },
  panelText: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  falsificationSection: {
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: 18,
    marginBottom: 20,
  },
  falsificationTitle: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 13,
  },
  promptList: {
    gap: 11,
  },
  promptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  promptNumber: {
    width: 23,
    height: 23,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.line,
  },
  promptNumberText: {
    color: palette.cobalt,
    fontSize: 12,
    fontWeight: "700",
  },
  promptText: {
    flex: 1,
    color: palette.ink,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  buttonEdge: {
    backgroundColor: C.cobalt,
    borderRadius: 12,
    overflow: "hidden",
  },
  button: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.cobalt,
    borderRadius: 12,
    paddingHorizontal: 17,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  buttonMeta: {
    color: "#B9C0BB",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  buttonArrow: {
    color: palette.white,
    fontSize: 22,
    fontWeight: "700",
  },
  footnote: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
});

export default HypothesisTestCard;
