import { colors as C } from "../design/tokens";
import { StyleSheet, Text, View } from "react-native";
import type {
  EvidenceTimelineCategory,
  EvidenceTimelineEntry,
  EvidenceTimelineTone,
} from "../domain/evidenceTimeline";

export type EvidenceTimelineProps = {
  entries: EvidenceTimelineEntry[];
  title?: string;
  emptyText?: string;
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
};

const categoryGlyph: Record<EvidenceTimelineCategory, string> = {
  "YOU SAID": "01",
  "YOU DID": "02",
  "REALITY CHECK": "03",
  "PATTERN UPDATED": "04",
};

const toneColor: Record<EvidenceTimelineTone, string> = {
  positive: palette.teal,
  neutral: palette.cobalt,
  counter: palette.orange,
};

export function EvidenceTimeline({
  entries,
  title = "Your evidence",
  emptyText = "Finish one campus vibe check and your clues will show up here.",
}: EvidenceTimelineProps) {
  return (
    <View style={styles.section} accessibilityLabel="Your clue timeline">
      <Text style={styles.eyebrow}>Over time</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.intro}>
        Your interests and experiences, recorded as you explore.
      </Text>

      {entries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyLabel}>No clues yet</Text>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {entries.map((entry, index) => {
            const isLast = index === entries.length - 1;
            return (
              <View
                key={entry.id}
                style={styles.row}
                accessible
                accessibilityLabel={`${entry.category}. ${entry.text}`}
              >
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.marker,
                      { borderColor: toneColor[entry.tone] },
                    ]}
                  >
                    <Text
                      style={[
                        styles.markerText,
                        { color: toneColor[entry.tone] },
                      ]}
                    >
                      {categoryGlyph[entry.category]}
                    </Text>
                  </View>
                  {!isLast ? <View style={styles.connector} /> : null}
                </View>

                <View
                  style={[
                    styles.card,
                    entry.category === "PATTERN UPDATED" && styles.updateCard,
                  ]}
                >
                  <View style={styles.cardTopline}>
                    <Text
                      style={[
                        styles.category,
                        { color: toneColor[entry.tone] },
                      ]}
                    >
                      {entry.category}
                    </Text>
                    {entry.category === "PATTERN UPDATED" ? (
                      <View style={styles.livePill}>
                        <Text style={styles.liveText}>Live</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.entryText}>{entry.text}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: palette.paper },
  eyebrow: {
    color: palette.orange,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  title: {
    color: palette.ink,
    fontSize: 30,
    lineHeight: 33,
    fontWeight: "700",
    letterSpacing: -1,
    maxWidth: 330,
  },
  intro: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 24,
    maxWidth: 350,
  },
  timeline: { gap: 0 },
  row: { flexDirection: "row", alignItems: "stretch", gap: 12 },
  rail: { width: 34, alignItems: "center" },
  marker: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: palette.paper,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  markerText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  connector: {
    width: 1,
    flex: 1,
    minHeight: 24,
    backgroundColor: palette.line,
  },
  card: {
    flex: 1,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  updateCard: { backgroundColor: palette.softBlue, borderColor: "#C6D3FB" },
  cardTopline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  category: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  entryText: {
    color: palette.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  livePill: {
    backgroundColor: palette.cobalt,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  liveText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: palette.line,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 18,
    backgroundColor: palette.white,
  },
  emptyLabel: {
    color: palette.cobalt,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 7,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
});
