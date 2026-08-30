import { colors as C } from "../design/tokens";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type FieldNoteSegment = "why" | "test" | "work" | "outcomes";

export type FieldNoteAction = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export type SegmentedFieldNoteProps = {
  sections: Record<FieldNoteSegment, ReactNode>;
  actions: Record<FieldNoteSegment, FieldNoteAction>;
  selectedSegment?: FieldNoteSegment;
  defaultSegment?: FieldNoteSegment;
  onSegmentChange?: (segment: FieldNoteSegment) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

const segments: Array<{ id: FieldNoteSegment; label: string }> = [
  { id: "why", label: "WHY" },
  { id: "test", label: "TEST IT" },
  { id: "work", label: "SEE THE WORK" },
  { id: "outcomes", label: "OUTCOMES" },
];

const palette = {
  paper: "#FFF9F2",
  ink: "#202622",
  muted: "#68706A",
  line: "#DDD9CF",
  cobalt: "#3159D6",
  white: "#FFFFFF",
  softBlue: "#E6EDFF",
};

export function SegmentedFieldNote({
  sections,
  actions,
  selectedSegment,
  defaultSegment = "why",
  onSegmentChange,
  style,
  contentContainerStyle,
  testID,
}: SegmentedFieldNoteProps) {
  const [internalSegment, setInternalSegment] =
    useState<FieldNoteSegment>(defaultSegment);
  const activeSegment = selectedSegment ?? internalSegment;
  const transition = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsets = useRef<Record<FieldNoteSegment, number>>({
    why: 0,
    test: 0,
    work: 0,
    outcomes: 0,
  });
  const previousSegment = useRef(activeSegment);

  useEffect(() => {
    if (previousSegment.current === activeSegment) return;

    previousSegment.current = activeSegment;
    transition.stopAnimation();
    transition.setValue(0);
    scrollRef.current?.scrollTo({
      y: scrollOffsets.current[activeSegment],
      animated: false,
    });
    Animated.timing(transition, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [activeSegment, transition]);

  const selectSegment = (nextSegment: FieldNoteSegment) => {
    if (nextSegment === activeSegment) return;
    if (selectedSegment === undefined) setInternalSegment(nextSegment);
    onSegmentChange?.(nextSegment);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsets.current[activeSegment] = event.nativeEvent.contentOffset.y;
  };

  const action = actions[activeSegment];

  return (
    <View style={[styles.shell, style]} testID={testID}>
      <View
        accessibilityRole="tablist"
        accessibilityLabel="Field note sections"
        style={styles.segmentedControl}
      >
        {segments.map((segment) => {
          const isSelected = segment.id === activeSegment;

          return (
            <Pressable
              key={segment.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${segment.label}, field note section`}
              hitSlop={6}
              onPress={() => selectSegment(segment.id)}
              style={({ pressed }) => [
                styles.segment,
                isSelected && styles.segmentSelected,
                pressed && styles.segmentPressed,
              ]}
              testID={testID ? `${testID}.${segment.id}` : undefined}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  isSelected && styles.segmentLabelSelected,
                ]}
              >
                {segment.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          accessibilityLiveRegion="polite"
          style={{
            opacity: transition,
            transform: [
              {
                translateY: transition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          {sections[activeSegment]}
        </Animated.View>
      </ScrollView>

      <View style={styles.actionTray}>
        <View style={styles.actionEdge}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            accessibilityState={{ disabled: action.disabled }}
            disabled={action.disabled}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.action,
              pressed && styles.actionPressed,
              action.disabled && styles.actionDisabled,
            ]}
            testID={testID ? `${testID}.action` : undefined}
          >
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Text accessibilityElementsHidden style={styles.actionArrow}>
              →
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  segmentedControl: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    backgroundColor: palette.white,
  },
  segment: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    paddingHorizontal: 6,
  },
  segmentSelected: {
    backgroundColor: palette.softBlue,
  },
  segmentPressed: {
    opacity: 0.7,
  },
  segmentLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  segmentLabelSelected: {
    color: palette.cobalt,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
  },
  actionTray: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.paper,
  },
  actionEdge: {
    paddingBottom: 4,
    borderRadius: 12,
    backgroundColor: "#11110F",
    overflow: "hidden",
  },
  action: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 18,
    backgroundColor: palette.ink,
  },
  actionPressed: {
    opacity: 0.86,
    transform: [{ translateY: 2 }],
  },
  actionDisabled: {
    opacity: 0.45,
  },
  actionLabel: {
    flexShrink: 1,
    color: palette.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  actionArrow: {
    marginLeft: 16,
    color: palette.white,
    fontSize: 23,
    fontWeight: "700",
  },
});
