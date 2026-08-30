import { colors as C } from "../design/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { openResource as openExternalResource } from "../features/resources/openResource";

import type { ResourceRecommendation } from "../features/resources";

export type ResourceDiscoveryCardProps = {
  resource: ResourceRecommendation;
  onPress?: (resource: ResourceRecommendation) => void;
};

const palette = {
  paper: "#FFF9F2",
  ink: "#202622",
  muted: "#68706A",
  line: "#DDD9CF",
  cobalt: "#3159D6",
  orange: "#F0643F",
  teal: "#14846F",
  yellow: "#F1CB49",
  white: "#FFFFFF",
  softBlue: "#E6EDFF",
  softTeal: "#E3F3EF",
};

function VideoPreview() {
  return (
    <View style={[styles.preview, styles.videoPreview]}>
      <View style={styles.videoGrid}>
        <View style={styles.videoBlockWide} />
        <View style={styles.videoBlock} />
        <View style={styles.videoBlock} />
      </View>
      <View style={styles.playButton}>
        <Text style={styles.playIcon}>▶</Text>
      </View>
      <View style={styles.previewCaption}>
        <Text style={styles.previewCaptionText}>Day in the life</Text>
      </View>
    </View>
  );
}

function SourceMark({ resource }: { resource: ResourceRecommendation }) {
  if (resource.type === "official_academic") {
    return (
      <View style={[styles.sourceMark, styles.officialMark]}>
        <Text style={styles.officialSeal}>U</Text>
        <Text style={styles.officialMarkText}>Official</Text>
      </View>
    );
  }

  if (resource.type === "work_exploration") {
    return (
      <View style={[styles.sourceMark, styles.workMark]}>
        <Text style={styles.workMarkTitle}>O*net</Text>
        <View style={styles.dataBars}>
          <View style={[styles.dataBar, { height: 10 }]} />
          <View style={[styles.dataBar, { height: 18 }]} />
          <View style={[styles.dataBar, { height: 14 }]} />
        </View>
        <Text style={styles.workMarkMeta}>Work data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.sourceMark, styles.directoryMark]}>
      <Text style={styles.directoryMarkTitle}>A–z</Text>
      <Text style={styles.directoryMarkText}>Directory</Text>
    </View>
  );
}

const presentationFor = (resource: ResourceRecommendation) => {
  switch (resource.type) {
    case "video_search":
      return {
        badge: "VIDEO SEARCH · UNREVIEWED",
        action: "OPEN YOUTUBE SEARCH",
        hint: "Opens an unreviewed YouTube search. Results may change or be personalized.",
      };
    case "official_academic":
      return {
        badge: "OFFICIAL ACADEMIC SOURCE",
        action: "VIEW OFFICIAL SOURCE",
        hint: `Opens the official academic source from ${resource.provider}.`,
      };
    case "academic_directory":
      return {
        badge: "ACADEMIC DIRECTORY",
        action: "SEARCH THE DIRECTORY",
        hint: `Opens ${resource.provider}, an external directory. Verify details with the university.`,
      };
    case "work_exploration":
      return {
        badge: "OCCUPATION DATA · SEARCH",
        action: "SEARCH REAL WORK",
        hint: "Opens an O*NET occupation search for tasks and work context.",
      };
  }
};

export function ResourceDiscoveryCard({
  resource,
  onPress,
}: ResourceDiscoveryCardProps) {
  const presentation = presentationFor(resource);
  const openResource = () => {
    if (onPress) {
      onPress(resource);
      return;
    }

    void openExternalResource(resource.url);
  };

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${resource.label}. ${presentation.badge}. Provided by ${resource.provider}.`}
      accessibilityHint={presentation.hint}
      onPress={openResource}
      style={({ pressed }) => [
        styles.card,
        resource.type === "video_search" && styles.videoCard,
        resource.type === "official_academic" && styles.officialCard,
        resource.type === "academic_directory" && styles.directoryCard,
        resource.type === "work_exploration" && styles.workCard,
        pressed && styles.cardPressed,
      ]}
    >
      {resource.type === "video_search" ? (
        <VideoPreview />
      ) : (
        <SourceMark resource={resource} />
      )}

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text
            style={[
              styles.badge,
              resource.type === "video_search" && styles.videoBadge,
              resource.type === "work_exploration" && styles.workBadge,
            ]}
          >
            {presentation.badge}
          </Text>
          <Text style={styles.provider} numberOfLines={1}>
            {resource.provider}
          </Text>
        </View>

        <Text style={styles.title}>{resource.label}</Text>
        <Text style={styles.description}>{resource.description}</Text>

        <View style={styles.actionRow}>
          <Text style={styles.action}>{presentation.action}</Text>
          <Text style={styles.arrow}>↗</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.ink,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  videoCard: {
    borderColor: palette.ink,
  },
  officialCard: {
    borderTopWidth: 6,
    borderTopColor: palette.cobalt,
  },
  directoryCard: {
    borderTopWidth: 6,
    borderTopColor: palette.yellow,
  },
  workCard: {
    borderTopWidth: 6,
    borderTopColor: palette.teal,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  preview: {
    height: 142,
    overflow: "hidden",
    position: "relative",
  },
  videoPreview: {
    backgroundColor: palette.ink,
  },
  videoGrid: {
    flex: 1,
    flexDirection: "row",
    gap: 7,
    padding: 12,
    transform: [{ rotate: "-3deg" }, { scale: 1.07 }],
  },
  videoBlockWide: {
    flex: 1.5,
    backgroundColor: palette.cobalt,
    borderRadius: 6,
  },
  videoBlock: {
    flex: 1,
    backgroundColor: palette.orange,
    borderRadius: 6,
  },
  playButton: {
    position: "absolute",
    alignSelf: "center",
    top: 43,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.ink,
  },
  playIcon: {
    color: palette.ink,
    fontSize: 20,
    marginLeft: 3,
  },
  previewCaption: {
    position: "absolute",
    left: 12,
    bottom: 11,
    backgroundColor: palette.yellow,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  previewCaptionText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sourceMark: {
    marginHorizontal: 16,
    marginTop: 16,
    minHeight: 78,
    borderRadius: 13,
    padding: 14,
    justifyContent: "space-between",
  },
  officialMark: {
    backgroundColor: palette.softBlue,
    flexDirection: "row",
    alignItems: "center",
  },
  officialSeal: {
    width: 44,
    height: 44,
    borderRadius: 12,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: palette.cobalt,
    color: palette.white,
    fontSize: 22,
    lineHeight: 44,
    fontWeight: "700",
  },
  officialMarkText: {
    color: palette.cobalt,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  workMark: {
    backgroundColor: palette.softTeal,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  workMarkTitle: {
    color: palette.teal,
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  dataBars: {
    height: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  dataBar: {
    width: 6,
    backgroundColor: palette.teal,
    borderRadius: 2,
  },
  workMarkMeta: {
    color: palette.teal,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  directoryMark: {
    backgroundColor: "#FFF5CE",
    flexDirection: "row",
    alignItems: "center",
  },
  directoryMarkTitle: {
    color: palette.ink,
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: -1,
  },
  directoryMarkText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    flexShrink: 1,
    color: palette.cobalt,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  videoBadge: {
    color: palette.orange,
  },
  workBadge: {
    color: palette.teal,
  },
  provider: {
    maxWidth: "40%",
    color: palette.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    color: palette.ink,
    fontSize: 21,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: -0.45,
    marginBottom: 7,
  },
  description: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  actionRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  action: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  arrow: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "700",
  },
});

export default ResourceDiscoveryCard;
