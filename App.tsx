import { colors as C } from "./src/design/tokens";
import { TabIcon } from "./src/components/TabIcon";
import { StatusBar } from "expo-status-bar";
import { getTuesdayMoments } from "./src/features/tuesday/model";
import { openResource } from "./src/features/resources/openResource";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView as NativeScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { majors } from "./src/data/schools/umich/majors";
import { umichMajorProfiles } from "./src/data/schools/umich/majorProfiles";
import {
  getSchoolData,
  schoolClubsById,
  type Major,
  type SchoolData,
} from "./src/data/schools";
import {
  applyChallengeOutcome,
  applyFieldworkObservation,
  applyQuestionResponse,
  applySubjectSelections,
  buildFirstSemesterPlan,
  buildBeliefEvidenceMap,
  buildEvidenceTimeline,
  computeReadiness,
  createEvidenceProfile,
  getEvidenceReceipts,
  getCareerOutcome,
  normalizeEvidence,
  rankClubs,
  rankMajors,
  selectSubjectBranchQuestions,
  subjectBranchDefinitions,
  WORK_MODES,
  type DimensionSignal,
  type EvidenceProfile,
  type MajorFitResult,
} from "./src/domain";
import {
  selectCompletedMissionIds,
  selectScalarProfileAnswers,
  sessionActions,
  type FieldworkReflection,
  type ReflectionCuriosity,
  type ReflectionEnergy,
  type ReflectionRepeatIntent,
  type SessionAction,
  type SessionState,
} from "./src/state";
import type { Dispatch } from "react";
import { usePersistentSession } from "./src/state/usePersistentSession";
import {
  fieldworkMissions as missions,
  isKnownFieldworkMissionId,
  signalsForFieldworkReflection,
} from "./src/features/fieldwork/model";
import { PatternShiftReveal } from "./src/components/PatternShiftReveal";
import { buildMissionBrief } from "./src/features/fieldwork/brief";
import {
  directionId,
  resolveFieldworkFocus,
} from "./src/features/fieldwork/focus";
import { MissionWorkspace } from "./src/features/fieldwork/MissionWorkspace";
import { FocusPicker } from "./src/features/fieldwork/FocusPicker";
import { HypothesisTestCard } from "./src/components/HypothesisTestCard";
import {
  SegmentedFieldNote,
  type FieldNoteSegment,
} from "./src/components/SegmentedFieldNote";
import { ResourceDiscoveryCard } from "./src/components/ResourceDiscoveryCard";
import { EvidenceTimeline } from "./src/components/EvidenceTimeline";
import { CareerOutcomesCard } from "./src/components/CareerOutcomesCard";
import { selectNextBestFieldworkMission } from "./src/features/fieldwork/nextBestMission";
import { getResourceRecommendations } from "./src/features/resources";
import {
  campusActionsForSchool,
  clubIntelligence,
  matchCompositeStories,
  type CampusAction,
  type MatchedStudentStory,
} from "./src/features/campus";
import { MajorComparison } from "./src/features/comparison";
import { umichMajorDecisionContent } from "./src/data/schools/umich/majorContent";
import { analytics } from "./src/analytics";
import {
  formatAdvisorBrief,
  generateAdvisorBrief,
  type AdvisorBriefPreferences,
} from "./src/features/advisor";
import {
  createUserDataExport,
  privacyControlCopy,
  serializeUserDataExport,
} from "./src/features/privacy";
import {
  createReflectionAssistant,
  type ReflectionAssistantResult,
} from "./src/features/reflectionAssistant";
import {
  AdmissionReasonsPicker,
  AlternativesPicker,
  DeclaredPicker,
  UniversityPicker,
} from "./src/features/onboarding";

type Screen =
  | "cover"
  | "university"
  | "unit"
  | "declared"
  | "admittedWhy"
  | "alternatives"
  | "strengths"
  | "enjoy"
  | "priorities"
  | "editInterests"
  | "discovery"
  | "profile"
  | "subjectBranch"
  | "blind"
  | "challenge"
  | "complete"
  | "reveal"
  | "major"
  | "day"
  | "trade"
  | "tabs";
type Tab = "path" | "explore" | "compare" | "you";
const scoutGuideImage = require("./assets/scout/scout-guide.png");
const scoutCelebrateImage = require("./assets/scout/scout-celebrate.png");
const scoutEncourageImage = require("./assets/scout/scout-encourage.png");
const umichComparisonDetails = Object.fromEntries(
  umichMajorDecisionContent.map((content) => [
    content.majorId,
    {
      workStyle: [content.everydayWork],
      coursework: [content.firstLook],
      sampleWork: [content.sampleWork],
      tradeoffs: [...content.tradeoffs],
    },
  ]),
);
const subjects = [
  "Math",
  "Computer Science",
  "Biology",
  "Chemistry",
  "Physics",
  "English / Literature",
  "History",
  "Government / Politics",
  "Psychology",
  "Economics",
  "Business",
  "Art / Design",
  "Music / Performing Arts",
  "Foreign Languages",
  "Other",
];
const admittedReasons = [
  "The questions it asks",
  "The kind of work I could do",
  "I like building or creating things",
  "I want to help people directly",
  "The career options feel strong",
  "It connects several interests",
  "Someone I trust encouraged it",
  "I'm still figuring out what I like",
];
const noOtherMajorsLabel = "No other majors yet";
const profileQuestions = [
  {
    id: "group_stuck",
    eyebrow: "HOW YOU MOVE",
    title: "A group is stuck. What do you do first?",
    body: "Not what sounds impressive. What you actually do.",
    options: [
      ["cause", "Trace the cause", "Find where things stopped working."],
      ["plan", "Make a plan", "Turn the mess into next steps."],
      ["alternatives", "Offer a new angle", "Change how everyone sees it."],
      [
        "explain",
        "Clarify it for everyone",
        "Make the problem easier to understand.",
      ],
      [
        "prototype",
        "Try a rough version",
        "Learn by making something quickly.",
      ],
    ],
  },
  {
    id: "preferred_mess",
    eyebrow: "PICK YOUR MESS",
    title: "Which would you rather untangle?",
    body: "Every option is difficult in a different way.",
    options: [
      ["technology", "A broken system", "The pieces no longer work together."],
      [
        "evidence",
        "Conflicting evidence",
        "The facts point in different directions.",
      ],
      [
        "organization",
        "A messy organization",
        "People and priorities are misaligned.",
      ],
      ["story", "A confusing story", "The meaning is still buried."],
      [
        "physical",
        "A physical mystery",
        "The material world is behaving strangely.",
      ],
    ],
  },
  {
    id: "proud_make",
    eyebrow: "WHAT YOU MAKE",
    title: "What have you built that felt worth it?",
    body: "A rough version still counts.",
    options: [
      [
        "code-object",
        "A tool or technical thing",
        "Code, a mechanism, or a useful system.",
      ],
      [
        "writing",
        "A story or argument",
        "Writing, research, or a persuasive case.",
      ],
      ["event", "An experience for people", "An event, team, or campaign."],
      [
        "art",
        "Something visual or physical",
        "Art, design, performance, or an object.",
      ],
      [
        "community",
        "A stronger community",
        "A group that worked better because of you.",
      ],
    ],
  },
  {
    id: "tolerable_friction",
    eyebrow: "THE HONEST PART",
    title: "Which frustration can you tolerate?",
    body: "Interest is partly about which hard parts you will stay for.",
    options: [
      ["debug", "Debugging for hours", "One invisible detail is wrong."],
      ["unknown", "No clean answer", "The evidence stays incomplete."],
      ["revision", "Starting over", "The first version is not good enough."],
      ["people", "Coordinating people", "Progress depends on everyone else."],
      [
        "model",
        "Working through the model",
        "The abstraction takes time to click.",
      ],
    ],
  },
  {
    id: "ideal_project",
    eyebrow: "A FREE SATURDAY",
    title: "Which project steals your afternoon?",
    body: "No grade. No résumé value. Just curiosity.",
    options: [
      [
        "question",
        "Investigate something odd",
        "Collect clues and explain what happened.",
      ],
      [
        "prototype",
        "Build something useful",
        "Make a working answer to a real problem.",
      ],
      [
        "campaign",
        "Bring people together",
        "Create momentum around an idea or cause.",
      ],
      [
        "guide",
        "Help someone get unstuck",
        "Explain, coach, or care for someone directly.",
      ],
      [
        "experience",
        "Create an experience",
        "Make something people can feel or participate in.",
      ],
    ],
  },
  {
    id: "work_setting",
    eyebrow: "YOUR SETTING",
    title: "Where does your best thinking happen?",
    body: "Choose the environment, not the subject.",
    options: [
      [
        "solo",
        "In a deep solo stretch",
        "Quiet, ownership, and time to focus.",
      ],
      [
        "small-team",
        "Inside a small team",
        "A few people building on each other.",
      ],
      ["people", "In a live room", "Energy, reactions, and ideas in motion."],
      [
        "workshop",
        "While doing it physically",
        "Materials, movement, and the real world.",
      ],
      [
        "clear-plan",
        "With a clear target",
        "Known constraints and visible progress.",
      ],
    ],
  },
  {
    id: "learning_entry",
    eyebrow: "HOW YOU LEARN",
    title: "How do you like to meet a new idea?",
    body: "Imagine the teacher gives you a choice of where to begin.",
    options: [
      [
        "see-example",
        "See a real example",
        "Start with where it shows up in life.",
      ],
      [
        "read-think",
        "Read and think quietly",
        "Get the full idea, then form your view.",
      ],
      [
        "talk-it-out",
        "Talk it through",
        "Use other people's questions to sharpen yours.",
      ],
      [
        "try-it",
        "Try it and adjust",
        "Learn what works by testing a first attempt.",
      ],
      [
        "teach-it",
        "Explain it to someone",
        "Make it click by putting it in your own words.",
      ],
    ],
  },
  {
    id: "curiosity_hook",
    eyebrow: "YOUR RABBIT HOLE",
    title: "Which question could keep you curious the longest?",
    body: "Pick the one you would still be thinking about after class.",
    options: [
      [
        "living-world",
        "How does the living world work?",
        "Bodies, ecosystems, health, and nature.",
      ],
      [
        "people",
        "Why do people behave this way?",
        "Minds, relationships, and communities.",
      ],
      [
        "machines",
        "How could this machine work better?",
        "Technology, structures, and invention.",
      ],
      [
        "systems",
        "Why does this system reward that?",
        "Money, power, rules, and tradeoffs.",
      ],
      [
        "meaning",
        "What does this story or moment mean?",
        "Language, history, culture, and ideas.",
      ],
    ],
  },
  {
    id: "class_energy",
    eyebrow: "IN THE ROOM",
    title: "Which class moment gives you the most energy?",
    body: "Think about what makes time move quickly for you.",
    options: [
      [
        "debate",
        "A lively debate",
        "Ideas change as people challenge each other.",
      ],
      [
        "solve",
        "Cracking a hard problem",
        "There is a satisfying answer to uncover.",
      ],
      [
        "lab",
        "A lab or field investigation",
        "You collect evidence from the real world.",
      ],
      [
        "studio",
        "A studio critique or rehearsal",
        "You make, share, and improve something.",
      ],
      [
        "case",
        "Working through a real case",
        "You decide what should happen and why.",
      ],
    ],
  },
  {
    id: "desired_impact",
    eyebrow: "WHY IT MATTERS",
    title: "What would make schoolwork feel meaningful?",
    body: "Choose the result that would make the effort worth it.",
    options: [
      [
        "understand",
        "Understanding something new",
        "Answer a question no one has explained well.",
      ],
      [
        "useful",
        "Making something useful",
        "Create a tool or solution people can use.",
      ],
      [
        "help",
        "Helping a person directly",
        "Make someone's life easier or better.",
      ],
      [
        "change",
        "Changing a rule or system",
        "Improve how a community or organization works.",
      ],
      [
        "move",
        "Changing how people see",
        "Create something that makes people feel or think.",
      ],
    ],
  },
  {
    id: "assignment_shape",
    eyebrow: "YOUR PICK",
    title: "Which assignment would you choose?",
    body: "Same amount of work. Different kinds of satisfaction.",
    options: [
      [
        "deep-dive",
        "One deep research question",
        "Follow evidence until you can explain the pattern.",
      ],
      [
        "build-test",
        "Build and test a solution",
        "Make a version, find flaws, and improve it.",
      ],
      [
        "present",
        "Present a convincing case",
        "Win people over with evidence and a clear argument.",
      ],
      [
        "creative",
        "Create an original piece",
        "Turn an idea into a story, design, or performance.",
      ],
      [
        "team-plan",
        "Lead a team toward a result",
        "Set the direction and bring the pieces together.",
      ],
    ],
  },
] as const;
const light = () => Haptics.selectionAsync().catch(() => undefined);
const medium = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
    () => undefined,
  );
const success = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => undefined,
  );

function PressableCard({
  children,
  selected,
  onPress,
  style,
  accessibilityLabel,
  disabled = false,
}: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        disabled,
        ...(selected === undefined ? {} : { selected: !!selected }),
      }}
      disabled={disabled}
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
          s.card,
          selected && s.cardSelected,
          style,
          { transform: [{ scale }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
function PrimaryButton({ label, onPress, disabled, lightMode = false }: any) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        medium();
        onPress();
      }}
      style={({ pressed }) => [
        s.buttonEdge,
        disabled && { opacity: 0.35 },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[s.button, lightMode && { backgroundColor: C.white }]}>
        <Text style={[s.buttonText, lightMode && { color: C.ink }]}>
          {label}
        </Text>
        <Text
          accessible={false}
          style={[s.buttonArrow, lightMode && { color: C.ink }]}
        >
          →
        </Text>
      </View>
    </Pressable>
  );
}
function Header({
  step,
  total,
  dark = false,
  onBack,
  onExit,
}: {
  step?: number;
  total?: number;
  dark?: boolean;
  onBack?: () => void;
  onExit?: () => void;
}) {
  return (
    <View style={s.top}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          hitSlop={16}
        >
          <Text style={[s.back, dark && { color: "#9D9D98" }]}>←</Text>
        </Pressable>
      ) : (
        <Text style={[s.back, dark && { color: "#9D9D98" }]}>UNLABELED</Text>
      )}
      {step && total ? (
        <View style={s.progressTrack}>
          <View
            style={[
              s.progressFill,
              { width: `${(step / total) * 100}%` },
              dark && { backgroundColor: "#F4F3ED" },
            ]}
          />
        </View>
      ) : null}
      {onExit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save and exit setup"
          onPress={onExit}
          hitSlop={12}
        >
          <Text style={[s.exitSetup, dark && { color: "#D8D8D2" }]}>
            Save for later
          </Text>
        </Pressable>
      ) : (
        <Text style={[s.micro, dark && { color: "#999994" }]}>
          {step && total ? `${step} / ${total}` : "SCOUT'S NOTES"}
        </Text>
      )}
    </View>
  );
}
const ScrollView = React.forwardRef<
  NativeScrollView,
  React.ComponentProps<typeof NativeScrollView>
>((props, ref) => (
  <NativeScrollView
    ref={ref}
    keyboardShouldPersistTaps="handled"
    keyboardDismissMode="on-drag"
    {...props}
  />
));

function Page({ children, footer, dark = false }: any) {
  return (
    <SafeAreaView
      style={[s.page, dark && s.darkPage]}
      edges={["top", "bottom"]}
    >
      <StatusBar style={dark ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {children}
        {footer ? (
          <View style={[s.footer, dark && { backgroundColor: C.ink }]}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function Intro({ eyebrow, title, body, dark = false, compact = false }: any) {
  return (
    <View style={{ marginBottom: compact ? 18 : 28 }}>
      {eyebrow ? (
        <Text style={[s.eyebrow, dark && { color: "#A7A7A1" }]}>{eyebrow}</Text>
      ) : null}
      <Text style={[s.h1, dark && { color: "#F5F4ED" }]}>{title}</Text>
      {body ? (
        <Text style={[s.lead, dark && { color: "#A7A7A1" }]}>{body}</Text>
      ) : null}
    </View>
  );
}
const priorityFactors = [
  ["earnings", "Earning potential", "Financial security and future options."],
  [
    "recognition",
    "Recognition",
    "Reputation, selectivity, and external respect.",
  ],
  [
    "balance",
    "Workload balance",
    "Room for health, relationships, and life outside work.",
  ],
  [
    "impact",
    "Meaningful impact",
    "Doing work that improves lives or communities.",
  ],
  [
    "flexibility",
    "Flexibility",
    "Freedom to change roles, fields, or locations.",
  ],
] as const;
const defaultDecisionPriorities = {
  earnings: 20,
  recognition: 20,
  balance: 20,
  impact: 20,
  flexibility: 20,
};

function PriorityAllocator({ value, onChange }: any) {
  const total = Object.values(value as Record<string, number>).reduce(
    (sum, points) => sum + points,
    0,
  );
  const unassigned = 100 - total;
  const update = (id: string, delta: number) => {
    const next = Math.max(0, Math.min(100, (value[id] ?? 0) + delta));
    if (delta > 0 && delta > unassigned) return;
    onChange({ ...value, [id]: next });
  };
  return (
    <View style={{ gap: 12 }}>
      <View style={s.priorityPool}>
        <Text style={s.priorityPoolLabel}>Points left</Text>
        <Text
          style={[s.priorityPoolValue, unassigned === 0 && { color: C.teal }]}
        >
          {unassigned}
        </Text>
      </View>
      {priorityFactors.map(([id, label, detail]) => (
        <View key={id} style={s.priorityCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.priorityLabel}>{label}</Text>
            <Text style={s.priorityDetail}>{detail}</Text>
          </View>
          <View style={s.priorityControls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove five points from ${label}`}
              disabled={(value[id] ?? 0) === 0}
              onPress={() => update(id, -5)}
              style={s.priorityStep}
            >
              <Text style={s.priorityStepText}>−</Text>
            </Pressable>
            <Text style={s.priorityValue}>{value[id] ?? 0}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add five points to ${label}`}
              disabled={unassigned < 5}
              onPress={() => update(id, 5)}
              style={s.priorityStep}
            >
              <Text style={s.priorityStepText}>+</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <Text style={s.prototypeNote}>
        Start even, subtract five from one factor, then add it somewhere else.
        You can change this later.
      </Text>
    </View>
  );
}
function GuideBubble({
  message,
  compact = false,
  mood = "guide",
}: {
  message: string;
  compact?: boolean;
  mood?: "guide" | "encourage";
}) {
  const image = mood === "encourage" ? scoutEncourageImage : scoutGuideImage;
  return (
    <View style={[s.guideRow, compact && s.guideRowCompact]}>
      <View style={[s.guideAvatar, compact && s.guideAvatarCompact]}>
        <Image
          accessible={false}
          resizeMode="contain"
          source={image}
          style={[s.guideAvatarImage, compact && s.guideAvatarImageCompact]}
        />
      </View>
      <View style={s.guideBubble}>
        <Text style={s.guideName}>Scout</Text>
        <Text style={s.guideMessage}>{message}</Text>
      </View>
    </View>
  );
}
const celebrationBits = [
  { top: "8%", left: "14%", color: C.yellow, rotate: "18deg" },
  { top: "16%", right: "12%", color: C.orange, rotate: "-22deg" },
  { top: "31%", left: "7%", color: C.cobalt, rotate: "42deg" },
  { top: "38%", right: "8%", color: C.teal, rotate: "-35deg" },
  { top: "57%", left: "12%", color: C.orange, rotate: "12deg" },
  { top: "61%", right: "14%", color: C.yellow, rotate: "50deg" },
] as const;
function MissionCelebration({
  missionTitle,
  energy,
  onContinue,
}: {
  missionTitle: string;
  energy: ReflectionEnergy;
  onContinue: () => void;
}) {
  const scale = useRef(new Animated.Value(0.72)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);
  const insight =
    energy === "energized"
      ? "You found a part of the work you want to explore further."
      : energy === "drained"
        ? "Knowing what drains you helps you choose your next experiment."
        : "A neutral reaction is useful evidence. Notice what you would change.";
  return (
    <View style={s.celebrationPage}>
      {celebrationBits.map((bit, index) => (
        <View
          key={index}
          accessible={false}
          style={[
            s.celebrationBit,
            {
              top: bit.top,
              left: "left" in bit ? bit.left : undefined,
              right: "right" in bit ? bit.right : undefined,
              backgroundColor: bit.color,
              transform: [{ rotate: bit.rotate }],
            },
          ]}
        />
      ))}
      <Animated.Image
        accessible={false}
        resizeMode="contain"
        source={scoutCelebrateImage}
        style={[s.celebrationScout, { opacity, transform: [{ scale }] }]}
      />
      <Text style={s.celebrationKicker}>Side quest complete</Text>
      <Text style={s.celebrationTitle}>Clue unlocked!</Text>
      <Text style={s.celebrationMission}>{missionTitle}</Text>
      <View style={s.celebrationReward}>
        <Text style={s.celebrationRewardIcon}>✦</Text>
        <Text style={s.celebrationRewardText}>+10 Clue points</Text>
      </View>
      <Text style={s.celebrationInsight}>{insight}</Text>
      <View style={s.celebrationAction}>
        <PrimaryButton label="See what changed" onPress={onContinue} />
      </View>
    </View>
  );
}
function SelectTile({ label, selected, onPress }: any) {
  return (
    <PressableCard
      accessibilityLabel={label}
      selected={selected}
      onPress={() => {
        light();
        onPress();
      }}
      style={s.selectTile}
    >
      <Text style={[s.selectText, selected && { color: C.white }]}>
        {label}
      </Text>
      <View
        accessible={false}
        style={[
          s.selectMark,
          selected && { backgroundColor: C.white, borderColor: C.white },
        ]}
      >
        <Text
          style={{ color: selected ? C.ink : "transparent", fontWeight: "700" }}
        >
          ✓
        </Text>
      </View>
    </PressableCard>
  );
}
function ProfileQuestion({
  index,
  answer,
  onAnswer,
  onContinue,
  onBack,
  onExit,
}: any) {
  const q = profileQuestions[index];
  return (
    <Page
      footer={
        <PrimaryButton disabled={!answer} label="Next" onPress={onContinue} />
      }
    >
      <Header
        step={index + 1}
        total={profileQuestions.length}
        onBack={onBack}
        onExit={onExit}
      />
      <ScrollView
        contentContainerStyle={s.profileScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.questionProgress}>
          <View
            style={[
              s.questionProgressFill,
              { width: `${((index + 1) / profileQuestions.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={s.questionCount}>
          Question {index + 1} Of {profileQuestions.length}
        </Text>
        <Intro compact eyebrow={q.eyebrow} title={q.title} body={q.body} />
        {index === 0 ? (
          <GuideBubble
            compact
            message="There are no impressive answers here. Pick the one that sounds most like a normal Tuesday."
          />
        ) : null}
        <View style={s.questionChoices}>
          {q.options.map(([id, label, description]) => (
            <PressableCard
              key={id}
              accessibilityLabel={`${label}. ${description}`}
              selected={answer === id}
              onPress={() => {
                light();
                onAnswer(id);
              }}
              style={s.profileChoice}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    s.profileChoiceTitle,
                    answer === id && { color: C.white },
                  ]}
                >
                  {label}
                </Text>
                <Text
                  style={[
                    s.profileChoiceBody,
                    answer === id && { color: "#DDE4FF" },
                  ]}
                >
                  {description}
                </Text>
              </View>
              <Text
                accessible={false}
                style={[
                  s.profileChoiceArrow,
                  answer === id && { color: C.white },
                ]}
              >
                {answer === id ? "✓" : "→"}
              </Text>
            </PressableCard>
          ))}
        </View>
      </ScrollView>
    </Page>
  );
}
function SubjectBranchQuestion({
  question,
  index,
  total,
  answer,
  patternCue,
  onAnswer,
  onContinue,
  onBack,
  onExit,
}: any) {
  return (
    <Page
      footer={
        <PrimaryButton disabled={!answer} label="Next" onPress={onContinue} />
      }
    >
      <Header step={index + 1} total={total} onBack={onBack} onExit={onExit} />
      <ScrollView
        contentContainerStyle={s.profileScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.questionProgress}>
          <View
            style={[
              s.questionProgressFill,
              { width: `${((index + 1) / total) * 100}%` },
            ]}
          />
        </View>
        <Text style={s.questionCount}>
          A closer look · {index + 1} Of {total}
        </Text>
        <View style={s.subjectBadge}>
          <Text style={s.subjectBadgeText}>
            You said you enjoy {question.subject.toUpperCase()}
          </Text>
        </View>
        <Intro
          compact
          title={question.prompt}
          body={`Your earlier choices leaned toward ${patternCue}. This checks whether that pattern shows up inside this subject—or whether something else is pulling you in.`}
        />
        <View style={s.questionChoices}>
          {question.options.map((option: any) => (
            <PressableCard
              key={option.id}
              accessibilityLabel={option.label}
              selected={answer === option.id}
              onPress={() => {
                light();
                onAnswer(option.id);
              }}
              style={s.branchChoice}
            >
              <Text
                accessible={false}
                style={[
                  s.branchChoiceText,
                  answer === option.id && { color: C.white },
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  s.profileChoiceArrow,
                  answer === option.id && { color: C.white },
                ]}
              >
                {answer === option.id ? "✓" : "→"}
              </Text>
            </PressableCard>
          ))}
        </View>
        <View style={s.notGradeCard}>
          <Text style={s.notGradeTitle}>This isn't a grade.</Text>
          <Text style={s.notGradeBody}>
            Two students can both love the same class for completely different
            reasons. That's the signal we're after.
          </Text>
        </View>
      </ScrollView>
    </Page>
  );
}
const challengeInfo = [
  {
    kicker: "THE PRICE MOVE",
    title: "Campus coffee costs $4.",
    body: "Move the price. Watch what changes.",
  },
  {
    kicker: "THE DOUBLE PING",
    title: "Two confirmations arrived.",
    body: "Where would you look first?",
  },
  {
    kicker: "FIVE SECONDS",
    title: "Hold onto what you can.",
    body: "Words will flash one at a time.",
  },
  {
    kicker: "FIRST FIX",
    title: "38% of freshmen quit here.",
    body: "Tap the first thing you'd change.",
  },
  {
    kicker: "CURIOSITY CONSTELLATION",
    title: "Something pulls you in.",
    body: "Follow the clue you want to open first.",
  },
  {
    kicker: "CLASSROOM SNAPSHOTS",
    title: "Five doors are open.",
    body: "Enter the room where time would move fastest.",
  },
];
function ChallengeShell({ index, children, onExit, onBack }: any) {
  const item = challengeInfo[index];
  return (
    <Page dark>
      <Header
        step={index + 1}
        total={challengeInfo.length}
        dark
        onExit={onExit}
        onBack={onBack}
      />
      <ScrollView
        contentContainerStyle={s.challengeScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.challengeKicker}>{item.kicker}</Text>
        <Text style={s.challengeTitle}>{item.title}</Text>
        <Text style={s.challengeBody}>{item.body}</Text>
        {children}
      </ScrollView>
    </Page>
  );
}
function Metric({ label, value }: any) {
  return (
    <View>
      <Text style={s.metricValue}>{value}</Text>
      <Text style={s.metricLabel}>{label.toUpperCase()}</Text>
    </View>
  );
}
function DarkChoice({ label, selected, onPress }: any) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: !!selected }}
      onPress={() => {
        light();
        onPress();
      }}
      style={[s.darkChoice, selected && s.darkChoiceSelected]}
    >
      <Text style={[s.darkChoiceText, selected && { color: C.ink }]}>
        {label}
      </Text>
      <Text
        accessible={false}
        style={[s.choiceCircle, selected && { color: C.ink }]}
      >
        ●
      </Text>
    </Pressable>
  );
}
function Feedback({ text, onPress }: any) {
  return (
    <View style={s.feedback}>
      <Text style={s.feedbackLabel}>We noticed</Text>
      <Text style={s.feedbackText}>{text}</Text>
      <PrimaryButton label="Keep going" lightMode onPress={onPress} />
    </View>
  );
}

function PriceChallenge({ done }: any) {
  const [price, setPrice] = useState(4);
  const [choice, setChoice] = useState("");
  const [visited, setVisited] = useState<number[]>([4]);
  const customers = Math.round(142 - (price - 3) * 25);
  const outcome =
    visited.length >= 3
      ? "explored-range"
      : Math.abs(price - 4) >= 1.5
        ? "large-change"
        : "small-change";
  return (
    <View style={{ gap: 20 }}>
      <View style={s.simCard}>
        <View style={s.priceRow}>
          <Text style={s.price}>${price.toFixed(2)}</Text>
          <Text style={s.priceNote}>Per cup</Text>
        </View>
        <View style={s.metrics}>
          <Metric label="customers" value={customers} />
          <Metric label="revenue" value={`$${Math.round(customers * price)}`} />
        </View>
        <View style={s.slider}>
          {[3, 3.5, 4, 4.5, 5, 5.5, 6].map((p) => (
            <Pressable
              key={p}
              accessibilityRole="button"
              accessibilityLabel={`Set price to $${p.toFixed(2)}`}
              accessibilityState={{ selected: price === p }}
              style={s.tick}
              onPress={() => {
                light();
                setPrice(p);
                setVisited((v) => (v.includes(p) ? v : [...v, p]));
              }}
            >
              <View style={[s.tickDot, price === p && s.tickDotActive]} />
            </Pressable>
          ))}
        </View>
        <View style={s.range}>
          <Text style={s.darkMicro}>$3</Text>
          <Text style={s.darkMicro}>Move the price</Text>
          <Text style={s.darkMicro}>$6</Text>
        </View>
      </View>
      <Text style={s.prompt}>What would you want to know next?</Text>
      {[
        "Which customers stopped buying?",
        "What do ingredients cost?",
        "What are competitors charging?",
        "Does behavior change over time?",
      ].map((x) => (
        <DarkChoice
          key={x}
          label={x}
          selected={choice === x}
          onPress={() => setChoice(x)}
        />
      ))}
      {choice ? (
        <Feedback
          text="Interesting. You immediately wanted more evidence—not just a bigger number."
          onPress={() => done("price-move", outcome)}
        />
      ) : null}
    </View>
  );
}
function FlowChallenge({ done }: any) {
  const [node, setNode] = useState("");
  const outcome =
    node === "RETRY PATH"
      ? "system"
      : node === "BOOK ROOM"
        ? "interface"
        : "workflow";
  return (
    <View style={{ gap: 14 }}>
      <View style={s.flowCard}>
        {[
          "BOOK ROOM",
          "CREATE RESERVATION",
          "SEND CONFIRMATION",
          "RETRY PATH",
        ].map((x, i) => (
          <React.Fragment key={x}>
            <Pressable
              onPress={() => {
                light();
                setNode(x);
              }}
              style={[
                s.flowNode,
                node === x && s.flowSelected,
                i === 3 && { borderStyle: "dashed" },
              ]}
            >
              <Text style={[s.flowText, node === x && { color: C.ink }]}>
                {x}
              </Text>
              {i === 3 ? <Text style={s.retry}>↗ loops back</Text> : null}
            </Pressable>
            {i < 3 ? <Text style={s.flowArrow}>↓</Text> : null}
          </React.Fragment>
        ))}
      </View>
      {node ? (
        <Feedback
          text={
            node === "RETRY PATH"
              ? "You went after the system, not the symptom."
              : "You picked a visible step. The retry path is where the duplicate entered."
          }
          onPress={() => done("double-ping", outcome)}
        />
      ) : null}
    </View>
  );
}
const memoryWords = [
  "EMBER",
  "WINDOW",
  "RIVER",
  "ATLAS",
  "COPPER",
  "ORBIT",
  "MINT",
  "SIGNAL",
];
function MemoryChallenge({ done }: any) {
  const [phase, setPhase] = useState<"ready" | "show" | "pick">("ready");
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [next, setNext] = useState("");
  useEffect(() => {
    if (phase !== "show") return;
    const timer = setInterval(
      () =>
        setAt((v) => {
          if (v >= 7) {
            clearInterval(timer);
            setPhase("pick");
            return v;
          }
          return v + 1;
        }),
      600,
    );
    return () => clearInterval(timer);
  }, [phase]);
  const pool = [
    "EMBER",
    "GARDEN",
    "WINDOW",
    "RIVER",
    "POCKET",
    "ATLAS",
    "COPPER",
    "THREAD",
    "ORBIT",
    "MINT",
    "SIGNAL",
    "MARBLE",
  ];
  if (phase === "ready")
    return (
      <View style={s.memoryReady}>
        <Text style={s.bigFive}>5</Text>
        <Text style={s.darkLead}>Eight words. No trick. Ready?</Text>
        <PrimaryButton
          label="Start"
          lightMode
          onPress={() => setPhase("show")}
        />
      </View>
    );
  if (phase === "show")
    return (
      <View style={s.wordStage}>
        <Text style={s.flashWord}>{memoryWords[at]}</Text>
        <View style={s.miniProgress}>
          <View
            style={{
              height: 3,
              backgroundColor: C.white,
              width: `${((at + 1) / 8) * 100}%`,
            }}
          />
        </View>
      </View>
    );
  const remembered = picked.filter((x) => memoryWords.includes(x)).length;
  const outcome = next.includes("categories")
    ? "pattern"
    : next.includes("order")
      ? "details"
      : "story";
  return (
    <View style={{ gap: 16 }}>
      <Text style={s.darkLead}>Select any words you remember. It's okay if you don't remember any.</Text>
      <View style={s.wordGrid}>
        {pool.map((x) => (
          <Pressable
            key={x}
            accessibilityRole="checkbox"
            accessibilityLabel={x}
            accessibilityState={{ checked: picked.includes(x) }}
            onPress={() => {
              light();
              setPicked((p) =>
                p.includes(x) ? p.filter((v) => v !== x) : [...p, x],
              );
            }}
            style={[
              s.wordChip,
              picked.includes(x) && { backgroundColor: C.white },
            ]}
          >
            <Text
              style={[s.wordChipText, picked.includes(x) && { color: C.ink }]}
            >
              {x}
            </Text>
          </Pressable>
        ))}
      </View>
      {(
        <>
          <Text style={s.prompt}>What would you test next?</Text>
          {[
            "Whether categories help recall",
            "Whether order changes memory",
            "Whether people remember images better",
          ].map((x) => (
            <DarkChoice
              key={x}
              label={x}
              selected={next === x}
              onPress={() => setNext(x)}
            />
          ))}
        </>
      )}
      {next ? (
        <Feedback
          text={`You remembered ${remembered} of 8. What caught our attention was the question you asked next.`}
          onPress={() => done("five-seconds", outcome)}
        />
      ) : null}
    </View>
  );
}
function CritiqueChallenge({ done }: any) {
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const outcome =
    reason === "Missing feedback"
      ? "evidence"
      : reason === "Unclear action"
        ? "message"
        : target === "notice"
          ? "student"
          : "process";
  return (
    <View style={{ gap: 18 }}>
      <View style={s.badUi}>
        <View style={s.browserBar}>
          <View style={s.dot} />
          <View style={s.dot} />
          <View style={s.dot} />
        </View>
        <Text style={s.badTitle}>Move-in portal</Text>
        <Text style={s.badCopy}>
          Complete all required steps and review all policies prior to selecting
          an arrival appointment time and parking permit zone.
        </Text>
        <Pressable
          onPress={() => setTarget("notice")}
          style={[s.warning, target === "notice" && s.badSelected]}
        >
          <Text style={s.warningText}>! 6 Things need attention</Text>
        </Pressable>
        <View style={s.badRow}>
          <Pressable
            onPress={() => setTarget("menu")}
            style={[s.badBox, target === "menu" && s.badSelected]}
          >
            <Text style={s.badSmall}>
              Documents{`\n`}Policies{`\n`}Contacts{`\n`}Faq
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTarget("action")}
            style={[s.badBox, target === "action" && s.badSelected]}
          >
            <Text style={s.badSmall}>
              Arrival window{`\n\n`}No time selected
            </Text>
            <View style={s.fakeButton}>
              <Text style={s.fakeButtonText}>Continue</Text>
            </View>
          </Pressable>
        </View>
      </View>
      {target ? (
        <>
          <Text style={s.prompt}>Why that first?</Text>
          {[
            "Confusing hierarchy",
            "Too much information",
            "Unclear action",
            "Missing feedback",
          ].map((x) => (
            <DarkChoice
              key={x}
              label={x}
              selected={reason === x}
              onPress={() => setReason(x)}
            />
          ))}
        </>
      ) : null}
      {reason ? (
        <Feedback
          text="You noticed where the interface made the student do the organizing."
          onPress={() => done("first-fix", outcome)}
        />
      ) : null}
    </View>
  );
}

const curiosityNodes = [
  {
    id: "living-world",
    symbol: "⌁",
    title: "LIVING WORLD",
    clue: "A city tree survives where the others fail.",
  },
  {
    id: "people",
    symbol: "◎",
    title: "PEOPLE",
    clue: "Two people remember the same moment differently.",
  },
  {
    id: "machines",
    symbol: "⚙",
    title: "MACHINES",
    clue: "A simple tool works better after one tiny change.",
  },
  {
    id: "systems",
    symbol: "⇄",
    title: "SYSTEMS",
    clue: "A fair-looking rule creates an unfair result.",
  },
  {
    id: "stories",
    symbol: "¶",
    title: "STORIES",
    clue: "One missing voice changes what the story means.",
  },
] as const;

function CuriosityChallenge({ done }: any) {
  const [firstChoice, setFirstChoice] = useState("");
  const [selected, setSelected] = useState("");
  const [question, setQuestion] = useState("");
  const node = curiosityNodes.find((item) => item.id === selected);
  return (
    <View style={{ gap: 18 }}>
      <View style={s.constellation}>
        <View style={s.constellationLineOne} />
        <View style={s.constellationLineTwo} />
        {curiosityNodes.map((item, index) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.clue}`}
            accessibilityState={{ selected: selected === item.id }}
            onPress={() => {
              light();
              if (!firstChoice) setFirstChoice(item.id);
              setSelected(item.id);
              setQuestion("");
            }}
            style={[
              s.curiosityNode,
              index === 4 && s.curiosityNodeWide,
              selected === item.id && s.curiosityNodeSelected,
            ]}
          >
            <Text
              style={[
                s.curiositySymbol,
                selected === item.id && { color: C.ink },
              ]}
            >
              {item.symbol}
            </Text>
            <Text
              style={[
                s.curiosityTitle,
                selected === item.id && { color: C.ink },
              ]}
            >
              {item.title}
            </Text>
          </Pressable>
        ))}
      </View>
      {node ? (
        <View style={s.clueCard}>
          <Text style={s.feedbackLabel}>The clue you opened</Text>
          <Text style={s.clueText}>{node.clue}</Text>
          <Text style={s.cluePrompt}>What do you immediately wonder?</Text>
        </View>
      ) : null}
      {node ? (
        <View style={{ gap: 10 }}>
          {[
            ["cause", "What caused this?"],
            ["next", "What happens next?"],
            ["affected", "Who is affected by this?"],
            ["test", "How could I test this?"],
            ["change", "How could I change this?"],
          ].map(([id, label]) => (
            <DarkChoice
              key={id}
              label={label}
              selected={question === id}
              onPress={() => setQuestion(id)}
            />
          ))}
        </View>
      ) : null}
      {question ? (
        <Feedback
          text="That first pull and the question behind it show us where your mind goes before a subject label can guide it."
          onPress={() =>
            done("curiosity-map", firstChoice || selected, {
              "curiosity-question": question,
            })
          }
        />
      ) : null}
    </View>
  );
}

const classroomScenes = [
  {
    id: "debate",
    symbol: "↔",
    title: "THE DEBATE",
    scene: "Ideas collide in a live room.",
  },
  {
    id: "problem",
    symbol: "∑",
    title: "THE PROBLEM",
    scene: "One hard puzzle fills the board.",
  },
  {
    id: "lab",
    symbol: "△",
    title: "THE LAB",
    scene: "Evidence is waiting to be collected.",
  },
  {
    id: "studio",
    symbol: "✦",
    title: "THE STUDIO",
    scene: "Rough work becomes a new version.",
  },
  {
    id: "case",
    symbol: "§",
    title: "THE CASE",
    scene: "A real decision has no perfect answer.",
  },
] as const;

function ClassroomChallenge({ done }: any) {
  const [room, setRoom] = useState("");
  return (
    <View style={{ gap: 18 }}>
      <View style={s.roomGrid}>
        {classroomScenes.map((item, index) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.scene}`}
            accessibilityState={{ selected: room === item.id }}
            onPress={() => {
              light();
              setRoom(item.id);
            }}
            style={[
              s.roomCard,
              index === 4 && s.roomCardWide,
              room === item.id && s.roomCardSelected,
            ]}
          >
            <Text style={[s.roomSymbol, room === item.id && { color: C.ink }]}>
              {item.symbol}
            </Text>
            <Text style={[s.roomTitle, room === item.id && { color: C.ink }]}>
              {item.title}
            </Text>
            <Text style={[s.roomScene, room === item.id && { color: C.ink }]}>
              {item.scene}
            </Text>
          </Pressable>
        ))}
      </View>
      {room ? (
        <Feedback
          text="You chose the shape of the learning before knowing the subject. That helps us find classes you may actually want to attend."
          onPress={() => done("classroom-snapshots", room)}
        />
      ) : null}
    </View>
  );
}

const resultMajors = [
  {
    id: "economics",
    name: "ECONOMICS",
    level: "Strong curiosity",
    color: C.orange,
    why: "You didn't come in considering it. But you kept asking about incentives, behavior, and what the numbers meant.",
  },
  {
    id: "computer-science-bs",
    name: "COMPUTER SCIENCE",
    level: "Strong curiosity",
    color: C.cobalt,
    why: "Already on your radar. You consistently followed problems back to the system causing them.",
  },
  {
    id: "public-policy",
    name: "PUBLIC POLICY",
    level: "Worth testing",
    color: C.teal,
    why: "You leaned in when evidence conflicted and there wasn't one clean answer.",
  },
];
const modeCopy: Record<string, string> = {
  analyze: "patterns and evidence",
  build: "turning ideas into working things",
  create: "making new possibilities",
  explain: "making difficult ideas clear",
  investigate: "following the next unanswered question",
  organize: "coordinating people and moving parts",
  persuade: "building a case others can respond to",
  serve: "work that is directly useful to people",
  strategize: "decisions, constraints, and tradeoffs",
  synthesize: "connecting ideas that do not fit neatly together",
};
const fieldworkSignalCopy: Record<string, string> = {
  investigate: "following unanswered questions",
  deepFocus: "sustained focus",
  build: "making a working answer",
  iteration: "staying through revision",
  collaborative: "working with other people",
  discuss: "thinking through conversation",
  ambiguity: "tolerating an unclear answer",
  publicFacing: "working in public",
  explain: "making ideas clear",
  synthesize: "connecting unlike ideas",
  strategize: "weighing decisions and tradeoffs",
};

function buildEvidence(
  strengths: string[],
  enjoyment: string[],
  answers: Record<string, string>,
  branchAnswers: Record<string, string>,
  outcomes: Record<string, string>,
  reflections: Record<string, FieldworkReflection> = {},
) {
  let profile = createEvidenceProfile();
  profile = applySubjectSelections(profile, { strengths, enjoyment });
  Object.entries(answers).forEach(([question, answer]) => {
    profile = applyQuestionResponse(profile, question, answer);
  });
  const branchDefinitions = Object.values(subjectBranchDefinitions);
  Object.entries(branchAnswers).forEach(([question, answer]) => {
    profile = applyQuestionResponse(
      profile,
      question,
      answer,
      branchDefinitions,
    );
  });
  Object.entries(outcomes).forEach(([challenge, outcome]) => {
    profile = applyChallengeOutcome(profile, challenge, outcome);
  });
  Object.values(reflections).forEach((reflection) => {
    if (!isKnownFieldworkMissionId(reflection.missionId)) return;
    const signals = signalsForFieldworkReflection(reflection);
    if (!Object.keys(signals).length) return;
    profile = applyFieldworkObservation(profile, {
      id: reflection.missionId,
      label: `Fieldwork felt ${reflection.energy}`,
      signals,
      weight: 1.1,
    });
  });
  return profile;
}
function displayResults(
  fits: MajorFitResult[],
  declared: string[],
  school: SchoolData,
  answers: {
    profile: Record<string, string>;
    subjects: Record<string, string>;
    strengths: string[];
    enjoyment: string[];
    challenges: Record<string, string>;
  } = {
    profile: {},
    subjects: {},
    strengths: [],
    enjoyment: [],
    challenges: {},
  },
) {
  const picked: Array<MajorFitResult & { family: string }> = [];
  const families = new Set<string>();
  for (const fit of fits) {
    const family =
      majors.find((major) => major.id === fit.id)?.family ?? fit.id;
    if (!families.has(family)) {
      picked.push({ ...fit, family });
      families.add(family);
    }
    if (picked.length === 3) break;
  }
  return picked.map((fit, i) => {
    const campusPrograms = school.catalog.programs
      .filter((program) => program.family === fit.family)
      .slice(0, 3);
    const declaredFamilies = school.catalog.programs
      .filter((program) => declared.includes(program.name))
      .map((program) => program.family);
    const prior = declaredFamilies.includes(fit.family as any);
    const reasons = fit.reasons
      .slice(0, 2)
      .map((reason) => modeCopy[reason.dimension] ?? reason.dimension)
      .join(" and ");
    const persistedAnswers = Object.fromEntries(
      Object.entries({ ...answers.profile, ...answers.subjects }).map(
        ([questionId, optionId]) => [questionId, [optionId]],
      ),
    );
    return {
      id: directionId(fit.family),
      family: fit.family,
      name: fit.family.toUpperCase(),
      campusPrograms,
      sourceMajorId: fit.id,
      sourceMajorName: fit.name,
      score: fit.score,
      reasons: fit.reasons,
      level:
        fit.score >= 82
          ? "Strong curiosity"
          : fit.score >= 72
            ? "Worth testing"
            : "A different angle",
      color: [C.orange, C.cobalt, C.teal][i],
      why: `${prior ? "This overlaps with your admissions starting point." : "This adds a direction you may not have named yet."} Your choices kept pointing toward ${reasons}.`,
      receipts: getEvidenceReceipts({
        result: fit,
        profileAnswers: persistedAnswers,
        subjects: {
          strengths: answers.strengths,
          enjoyment: answers.enjoyment,
        },
        challengeOutcomes: answers.challenges,
        limit: 3,
      }),
    };
  });
}
function Reveal({
  go,
  results = resultMajors,
  declared = [],
  onOpen,
  evidenceSummary,
  onSharpen,
  onStart,
}: any) {
  const flood = useRef(new Animated.Value(0)).current;
  const hero = useRef(new Animated.Value(0)).current;
  const a = useRef([
    new Animated.Value(45),
    new Animated.Value(45),
    new Animated.Value(45),
  ]).current;
  const lead = results[0];
  const declaredLabel = declared.length
    ? declared.slice(0, 2).join(" + ")
    : "No major picked yet";
  const surprise =
    results.find(
      (result: any) =>
        !declared.some(
          (name: string) =>
            name.toLowerCase().includes(result.name.toLowerCase()) ||
            result.name
              .toLowerCase()
              .includes(name.toLowerCase().replace(/ \(.+\)/, "")),
        ),
    ) ?? results[0];
  useEffect(() => {
    success();
    Animated.parallel([
      Animated.timing(flood, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(hero, {
        toValue: 1,
        delay: 170,
        damping: 12,
        stiffness: 115,
        useNativeDriver: true,
      }),
      ...a.map((v, i) =>
        Animated.spring(v, {
          toValue: 0,
          delay: 300 + i * 110,
          damping: 13,
          stiffness: 130,
          useNativeDriver: true,
        }),
      ),
    ]).start();
  }, []);
  return (
    <Animated.View
      style={[
        s.page,
        {
          backgroundColor: flood.interpolate({
            inputRange: [0, 1],
            outputRange: ["#242424", C.bg],
          }),
        },
      ]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header onBack={() => go("tabs")} />
        <ScrollView
          contentContainerStyle={s.revealScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.revealEyebrow}>The big reveal</Text>
          <Text style={s.revealTitle}>Your choices{`\n`}have a plot.</Text>
          <Text style={s.revealLead}>
            One direction would not stop showing up. Two more are absolutely
            worth a look.
          </Text>

          <Animated.View
            style={{
              opacity: hero,
              transform: [
                {
                  scale: hero.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1],
                  }),
                },
              ],
            }}
          >
            <PressableCard
              accessibilityLabel={`Open your lead direction: ${lead?.name ?? "new direction"}`}
              onPress={() => {
                onOpen?.(lead?.id);
                go("major");
              }}
              style={[s.leadResultCard, { backgroundColor: lead?.color }]}
            >
              <View style={s.leadResultTop}>
                <View style={s.leadResultBadge}>
                  <Text style={s.leadResultBadgeText}>
                    A starting direction
                  </Text>
                </View>
                <Text style={s.leadResultRank}>01</Text>
              </View>
              <Text style={s.leadResultName}>{lead?.name}</Text>
              <Text style={s.leadMajorLabel}>
                Example programs · not ranked
              </Text>
              <Text style={s.leadMajorName}>
                {lead?.campusPrograms
                  ?.map((program: any) => program.name)
                  .join(" · ") || lead?.name}
              </Text>
              <Text style={s.leadResultWhy}>{lead?.why}</Text>
              {lead?.receipts?.length ? (
                <View style={s.leadSignalRow}>
                  {lead.receipts.slice(0, 2).map((receipt: any) => (
                    <View key={receipt.id} style={s.leadSignalChip}>
                      <Text style={s.leadSignalText}>{receipt.text}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <View style={s.leadResultAction}>
                <Text style={s.leadResultActionText}>Okay, why this one?</Text>
                <Text style={s.leadResultArrow}>→</Text>
              </View>
            </PressableCard>
          </Animated.View>

          <View style={s.choiceStory}>
            <Text style={s.choiceStoryKicker}>Clues differ</Text>
            <View style={s.choiceStoryRow}>
              <View style={s.choiceStorySide}>
                <Text style={s.choiceStoryLabel}>You came in with</Text>
                <Text style={s.choiceStoryValue}>{declaredLabel}</Text>
              </View>
              <Text style={s.choiceStoryArrow}>→</Text>
              <View style={s.choiceStorySide}>
                <Text style={s.choiceStoryLabel}>Your choices showed</Text>
                <Text style={s.choiceStoryValue}>{lead?.name}</Text>
              </View>
            </View>
            <Text style={s.choiceStoryFoot}>{evidenceSummary}</Text>
          </View>

          <View style={s.alsoHeader}>
            <Text style={s.alsoTitle}>Also in the mix</Text>
            <Text style={s.alsoBody}>Strong alternatives, not runners-up.</Text>
          </View>
          {results.slice(1).map((r: any, i: number) => (
            <Animated.View
              key={r.id}
              style={{ transform: [{ translateY: a[i + 1] }] }}
            >
              <PressableCard
                onPress={() => {
                  onOpen?.(r.id);
                  go("major");
                }}
                style={[s.resultCard, { borderTopColor: r.color }]}
              >
                <View style={s.resultTop}>
                  <Text style={[s.resultRank, { color: r.color }]}>
                    0{i + 2}
                  </Text>
                  <Text style={s.resultLevel}>{r.level}</Text>
                </View>
                <Text style={s.resultName}>{r.name}</Text>
                {r.campusPrograms?.length ? (
                  <View style={s.programPreview}>
                    <Text style={s.programPreviewLabel}>At your school</Text>
                    <Text style={s.programPreviewNames}>
                      {r.campusPrograms
                        .map((program: Major) => program.name)
                        .join(" · ")}
                    </Text>
                  </View>
                ) : null}
                <Text style={s.resultWhy}>{r.why}</Text>
                {r.receipts?.length ? (
                  <View style={s.receiptStack}>
                    <Text style={s.receiptHeading}>Why it's here</Text>
                    {r.receipts.slice(0, 2).map((receipt: any, at: number) => (
                      <View key={receipt.id} style={s.receiptRow}>
                        <Text style={[s.receiptNumber, { color: r.color }]}>
                          0{at + 1}
                        </Text>
                        <Text style={s.receiptText}>{receipt.text}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                <Text style={s.open}>Take a closer look →</Text>
              </PressableCard>
            </Animated.View>
          ))}
          <View style={s.contradiction}>
            <Text style={s.contraKicker}>The interesting part</Text>
            <Text style={s.contraTitle}>
              {surprise?.name ?? "A new direction"} wasn't on your list.
            </Text>
            <Text style={s.contraBody}>
              It still produced one of your strongest curiosity signals. Don't
              believe us. Test it.
            </Text>
          </View>
          <PrimaryButton
            label="Try a first experiment"
            onPress={() => onStart(results[0]?.id)}
          />
          <Pressable
            accessibilityRole="button"
            style={s.resetButton}
            onPress={onSharpen}
          >
            <Text style={[s.resetButtonText, { color: C.cobalt }]}>
              Sharpen these results with optional challenges
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}
function Section({ number, title, children }: any) {
  return (
    <View style={s.section}>
      <Text style={s.sectionNum}>{number}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
function Info({ label, value }: any) {
  return (
    <View style={s.info}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}
function MajorDetail({ go, focus, school, pattern, onBack, onStart }: any) {
  const [segment, setSegment] = useState<FieldNoteSegment>("why");
  const name = focus?.name ?? "AN INTEREST DIRECTION";
  const programs = focus.program
    ? [focus.program]
    : school.catalog.programs
        .filter((program: any) => program.family === focus?.family)
        .slice(0, 3);
  const programNames = programs.map((program: any) => program.name).join(" · ");
  const [outcomeProgramId, setOutcomeProgramId] = useState(
    programs.find((program: Major) => program.id === focus?.sourceMajorId)
      ?.id ??
      programs[0]?.id ??
      "",
  );
  const outcomeProgram =
    programs.find((program: Major) => program.id === outcomeProgramId) ??
    programs[0];
  const careerOutcome = getCareerOutcome({
    schoolId: school.id,
    majorId: outcomeProgram?.id ?? "",
    family: focus.family,
  });
  const hasVerifiedCatalog = school.dataDepth !== "generic";
  const nextTest = selectNextBestFieldworkMission(
    { reasons: focus?.reasons ?? [] },
    pattern,
  );
  const nextMission = missions.find(
    (mission) => mission.id === nextTest.missionId,
  );
  const resources = getResourceRecommendations(name, school);
  const videoResource = resources.find(
    (resource) => resource.type === "video_search",
  );
  return (
    <Page>
      <Header onBack={onBack} />
      <View style={s.fieldNoteContext}>
        <Text style={[s.eyebrow, { color: C.orange }]}>
          Scout's notes / current best guess
        </Text>
        <Text style={s.fieldNoteContextTitle}>{name}</Text>
      </View>
      <SegmentedFieldNote
        selectedSegment={segment}
        onSegmentChange={setSegment}
        sections={{
          why: (
            <View>
              <Text style={s.detailSubtitle}>
                {focus.program
                  ? "A program you chose to explore. Any matching clues describe its broad field—not a verified program-specific fit."
                  : "A broad direction worth testing because its everyday work overlaps with the patterns you showed. It is not a major recommendation yet."}
              </Text>
              <Section number="01" title="Why it surfaced">
                <Text style={s.sectionBody}>
                  {focus?.why ??
                    "Several different pieces of evidence pointed in this direction."}
                </Text>
                {focus?.receipts?.length ? (
                  <View style={s.detailReceiptStack}>
                    {focus.receipts.map((receipt: any, at: number) => (
                      <View key={receipt.id} style={s.receiptRow}>
                        <Text style={s.receiptNumber}>0{at + 1}</Text>
                        <Text style={s.receiptText}>{receipt.text}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Section>
              <Section number="02" title="What the work may feel like">
                <View style={s.tagRow}>
                  {["questions", "real work", "revision", "tradeoffs"].map(
                    (item) => (
                      <Text key={item} style={s.tag}>
                        {item}
                      </Text>
                    ),
                  )}
                </View>
              </Section>
              <Section number="03" title={`At ${school.shortName}`}>
                <Info
                  label={
                    hasVerifiedCatalog ? "PROGRAMS TO PREVIEW" : "CAMPUS CHECK"
                  }
                  value={
                    programNames ||
                    `Search ${school.shortName}'s official catalog for programs in this direction`
                  }
                />
                <Info
                  label="A low-risk first look"
                  value={`Preview one introductory course connected to ${name.toLowerCase()}`}
                />
              </Section>
              <Section number="04" title="The honest version">
                <Text style={s.sectionBody}>
                  The label is the clean part. Real coursework includes
                  repetition, unclear moments, revision, and tasks that will not
                  feel exciting. Test those too.
                </Text>
              </Section>
            </View>
          ),
          test: (
            <HypothesisTestCard
              known={nextTest.known}
              uncertainty={nextTest.uncertainty}
              rationale={nextTest.rationale}
              testTitle={nextMission?.title ?? "Run one real-world test"}
              testTime={nextMission?.time ?? "15 min"}
              falsificationPrompts={nextTest.falsificationPrompts}
              onStartTest={() => onStart(focus.id, nextTest.missionId)}
            />
          ),
          work: (
            <View>
              <Text style={s.resourceIntro}>
                Use these as starting points, not proof. Compare the interesting
                moments with the routine work people repeat every week.
              </Text>
              {resources.map((resource) => (
                <ResourceDiscoveryCard
                  key={`${resource.type}-${resource.url}`}
                  resource={resource}
                />
              ))}
            </View>
          ),
          outcomes: (
            <View>
              <Text style={s.resourceIntro}>
                Compare the work with the life it can support. Salary is one
                piece of the decision—not a promise or a fit score.
              </Text>
              {programs.map((program: Major) => (
                <SelectTile
                  key={program.id}
                  label={program.name}
                  selected={outcomeProgram?.id === program.id}
                  onPress={() => setOutcomeProgramId(program.id)}
                />
              ))}
              <CareerOutcomesCard
                outcome={careerOutcome}
                schoolName={school.shortName}
              />
            </View>
          ),
        }}
        actions={{
          why: {
            label: `SPEND A TUESDAY IN ${name}`,
            onPress: () => go("day"),
          },
          test: {
            label: "START THE BEST TEST",
            onPress: () => onStart(focus.id, nextTest.missionId),
          },
          work: {
            label: videoResource
              ? "OPEN VIDEO DISCOVERY"
              : `SPEND A TUESDAY IN ${name}`,
            onPress: () =>
              videoResource ? openResource(videoResource.url) : go("day"),
          },
          outcomes: {
            label: "OPEN THE OUTCOMES SOURCE",
            onPress: () => void openResource(careerOutcome.source.url),
          },
        }}
      />
    </Page>
  );
}
function Tuesday({
  go,
  focus,
  program,
}: {
  go: (screen: Screen) => void;
  focus?: Pick<MajorFitResult, "id" | "name"> & { family?: string };
  program?: Major;
}) {
  const [at, setAt] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const choice = answers[at] ?? "";
  const name = focus?.name ?? "EXPLORE THE WORK";
  const moments = getTuesdayMoments(program ?? focus);
  if (at === moments.length) {
    return (
      <Page>
        <Header onBack={() => setAt(moments.length - 1)} />
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={s.dayKicker}>Your first reactions</Text>
          <Text style={s.dayTitle}>What would you try?</Text>
          <Text style={s.moment}>
            These are reactions to imagined tasks, not a verdict on{" "}
            {name.toLowerCase()}. Trying the work is the next useful clue.
          </Text>
          {moments.map((moment, index) => (
            <View
              key={moment.place}
              style={{
                marginTop: 22,
                padding: 18,
                backgroundColor: C.white,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: C.line,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "800", color: C.ink }}>
                {moment.place}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 22,
                  marginTop: 8,
                  color: C.muted,
                }}
              >
                {moment.question}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 22,
                  marginTop: 10,
                  fontWeight: "700",
                  color: C.ink,
                }}
              >
                {answers[index]}
              </Text>
            </View>
          ))}
          <Text style={[s.moment, { marginTop: 24 }]}>
            {answers.every(
              (answer, index) => answer === moments[index].choices[2],
            )
              ? "None of these caught your interest. You can explore another field, or try one small task to check your reaction."
              : "Choose one small work sample next. Notice whether doing it feels different from reading about it."}
          </Text>
          <Text
            style={{
              fontSize: 12,
              lineHeight: 18,
              color: C.muted,
              marginTop: 12,
            }}
          >
            These reactions stay in this visit only and do not change your
            ranking.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => go("major")}
            style={{ paddingVertical: 20 }}
          >
            <Text style={{ color: C.cobalt, fontWeight: "800" }}>
              Back to field details
            </Text>
          </Pressable>
        </ScrollView>
        <View style={s.footer}>
          <PrimaryButton
            label="Try a real work sample"
            onPress={() => go("tabs")}
          />
        </View>
      </Page>
    );
  }
  const m = moments[at];
  return (
    <Page>
      <Header
        step={at + 1}
        total={moments.length}
        onBack={() => (at > 0 ? setAt(at - 1) : go("major"))}
      />
      <ScrollView
        key={at}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24 }}
      >
        <Text style={s.dayKicker}>A tuesday in</Text>
        <Text style={s.dayTitle}>{name}</Text>
        <Text
          style={{
            fontSize: 13,
            lineHeight: 19,
            color: C.muted,
            marginTop: 10,
          }}
        >
          Examples from {program?.family ?? focus?.family ?? "different fields"}
          . Not a campus schedule.
        </Text>
        <View style={[s.timeLine, { marginTop: 24 }]}>
          <Text style={s.time}>{m.time}</Text>
          <View style={s.timeDot} />
          <View style={s.timeRule} />
        </View>
        <Text style={s.place}>{m.place}</Text>
        <Text style={s.moment}>{m.text}</Text>
        <Text style={[s.place, { marginTop: 20 }]}>{m.question}</Text>
        <Text
          style={{ fontSize: 13, lineHeight: 19, color: C.muted, marginTop: 8 }}
        >
          No experience needed. Choose based on interest.
        </Text>
        <View style={{ gap: 10, marginTop: 16 }}>
          {m.choices.map((x) => (
            <SelectTile
              key={x}
              label={x}
              selected={choice === x}
              onPress={() =>
                setAnswers((previous) => {
                  const next = [...previous];
                  next[at] = x;
                  return next;
                })
              }
            />
          ))}
        </View>
        <Text
          style={{
            fontSize: 12,
            lineHeight: 18,
            color: C.muted,
            marginTop: 16,
          }}
        >
          For reflection only. These answers do not change your ranking.
        </Text>
      </ScrollView>
      <View style={s.footer}>
        <PrimaryButton
          disabled={!choice}
          label={at === moments.length - 1 ? "SEE MY TAKEAWAYS" : "NEXT MOMENT"}
          onPress={() => {
            if (choice) setAt(at + 1);
          }}
        />
      </View>
    </Page>
  );
}
function Trade({ go, focus }: any) {
  const [answer, setAnswer] = useState("");
  const isEcon = focus?.id === "economics";
  return (
    <Page>
      <Header onBack={() => go("day")} />
      <ScrollView contentContainerStyle={s.detailScroll}>
        <Text style={s.tradeOverline}>
          {focus?.name ?? "THE FIELD"} / The honest exchange
        </Text>
        <Text style={s.tradeTitle}>Every major{`\n`}is a trade.</Text>
        <View style={s.tradeGrid}>
          <View style={[s.tradeHalf, { backgroundColor: C.teal }]}>
            <Text style={s.tradeLabel}>You get</Text>
            <Text style={s.tradeCopy}>
              {isEcon
                ? "Questions about incentives, markets, decisions, and why people respond to changing constraints."
                : `More time doing work that connects with ${focus?.why?.split("toward ")[1] ?? "the patterns you showed"}.`}
            </Text>
          </View>
          <View style={[s.tradeHalf, { backgroundColor: C.orange }]}>
            <Text style={s.tradeLabel}>You give</Text>
            <Text style={s.tradeCopy}>
              {isEcon
                ? "Comfort with models, quantitative reasoning, ambiguity, and answers that are not always clean."
                : "Time spent on prerequisites, repetition, difficult feedback, and parts of the field that will feel much less interesting than its best questions."}
            </Text>
          </View>
        </View>
        <Text style={s.tradeQuestion}>
          Does that trade still sound worth exploring?
        </Text>
        <View style={{ gap: 10 }}>
          {["Yes", "Not sure", "Probably not"].map((x) => (
            <SelectTile
              key={x}
              label={x}
              selected={answer === x}
              onPress={() => setAnswer(x)}
            />
          ))}
        </View>
      </ScrollView>
      <View style={s.footer}>
        <PrimaryButton
          disabled={!answer}
          label="Start my campus quest"
          onPress={() => go("tabs")}
        />
      </View>
    </Page>
  );
}

function ClubMatchCard({ club, rank, schoolId }: any) {
  const intelligence = clubIntelligence(schoolId, club);
  const sourceUrl =
    club.maizePagesUrl ??
    club.clubUrl ??
    club.sourceUrl ??
    club.sourceUrls?.[0] ??
    club.directoryUrl;
  const accessLabel =
    club.membershipAccess === "open"
      ? "OPEN TO JOIN"
      : club.membershipAccess === "audition"
        ? "AUDITION"
        : club.membershipAccess === "application" ||
            club.membershipAccess === "application-or-selection"
          ? "APPLICATION"
          : "CHECK DETAILS";
  return (
    <PressableCard
      onPress={() => sourceUrl && openResource(sourceUrl)}
      style={s.clubCard}
    >
      <View style={s.clubTop}>
        <Text style={s.clubRank}>0{rank}</Text>
        <Text style={s.clubAccess}>{accessLabel}</Text>
      </View>
      <Text style={s.clubName}>{club.name}</Text>
      <Text style={s.clubDescription}>{club.description}</Text>
      <View style={s.clubIntelRow}>
        <Text style={s.clubIntelPill}>{intelligence.accessLabel}</Text>
        <Text style={s.clubIntelPill}>{intelligence.commitmentLabel}</Text>
      </View>
      <View style={s.clubTags}>
        {club.categories.slice(0, 3).map((tag: string) => (
          <Text key={tag} style={s.clubTag}>
            {tag}
          </Text>
        ))}
      </View>
      <Text style={s.clubWhy}>{club.whyFieldwork}</Text>
      <Text style={s.clubFreshness}>
        Reviewed {intelligence.reviewedOn} · Verify current details
      </Text>
      <Text style={s.open}>Open official page ↗</Text>
    </PressableCard>
  );
}
function CampusActionCard({ action }: { action: CampusAction }) {
  return (
    <PressableCard
      onPress={() => action.url && openResource(action.url)}
      style={s.actionCard}
    >
      <View style={s.actionTop}>
        <Text style={s.actionKind}>{action.kind.toUpperCase()}</Text>
        <Text style={s.actionEffort}>{action.effort.toUpperCase()}</Text>
      </View>
      <Text style={s.actionTitle}>{action.title}</Text>
      <Text style={s.actionDetail}>{action.detail}</Text>
      {action.url ? <Text style={s.open}>Open official source ↗</Text> : null}
    </PressableCard>
  );
}

function StudentStoryCard({ story }: { story: MatchedStudentStory }) {
  return (
    <View style={s.storyCard}>
      <Text style={s.storyLabel}>
        Illustrative composite · not a testimonial
      </Text>
      <Text style={s.storyTitle}>{story.title}</Text>
      <Text style={s.storyStarting}>{story.startingPoint}</Text>
      <Text style={s.storyExperiment}>The experiment · {story.experiment}</Text>
      <Text style={s.storyBody}>{story.turningPoint}</Text>
      <Text style={s.storyTakeaway}>{story.takeaway}</Text>
    </View>
  );
}
function matchingClubs(clubFits: any[], clubs: readonly any[]) {
  return clubFits
    .slice(0, 3)
    .map((fit) => clubs.find((club) => club.id === fit.id))
    .filter(Boolean);
}
function CampusDirectoryCard({ school }: { school: SchoolData }) {
  return (
    <View style={s.campusCard}>
      <Text style={s.campusCardKicker}>Try it on campus</Text>
      <Text style={s.campusCardTitle}>Find people doing the work.</Text>
      <Text style={s.campusCardBody}>
        Search {school.shortName}'s student-organization directory by activity:
        build, debate, publish, perform, research, or serve. Club names are
        often better clues than major labels.
      </Text>
      <View style={s.clubTags}>
        {["BUILD", "DEBATE", "PUBLISH", "SERVE"].map((tag) => (
          <Text key={tag} style={s.clubTag}>
            {tag}
          </Text>
        ))}
      </View>
    </View>
  );
}
function SemesterPlanCard({ plan }: any) {
  return (
    <View style={s.semesterCard}>
      <View style={s.semesterTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.semesterKicker}>First semester</Text>
          <Text style={s.semesterTitle}>Bring this to your advisor</Text>
        </View>
        <Text style={s.semesterBadge}>Draft</Text>
      </View>
      {plan.slots.map((slot: any, index: number) => (
        <View key={slot.id} style={s.semesterSlot}>
          <Text style={s.semesterSlotNum}>0{index + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.semesterSlotTitle}>{slot.title}</Text>
            <Text style={s.semesterSlotPurpose}>{slot.purpose}</Text>
            <Text style={s.semesterSlotCredits}>
              {slot.creditRange[1]
                ? `${slot.creditRange[0]}–${slot.creditRange[1]} CREDITS · VERIFY`
                : "CAMPUS LIFE · VERIFY NEXT EVENT"}
            </Text>
          </View>
        </View>
      ))}
      <Text style={s.semesterDisclaimer}>{plan.disclaimer}</Text>
    </View>
  );
}
function Path({
  clubFits,
  clubs,
  results,
  session,
  dispatch,
  school,
  pattern,
  decisionPriorities,
  requestedMission,
  onMissionOpened,
  onSharpen,
  onEditProfile,
}: any) {
  const focus = resolveFieldworkFocus(
    school,
    session.activeFocusByCampus[school.id],
    results[0]?.id,
  );
  const planMajorId = focus.id;
  const missionPrefix = `${school.id}:${planMajorId}:`;
  const completed = selectCompletedMissionIds(session as SessionState).filter(
    (id) => id.startsWith(missionPrefix) && isKnownFieldworkMissionId(id),
  );
  const [choosingFocus, setChoosingFocus] = useState(false);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{
    missionTitle: string;
    energy: ReflectionEnergy;
  } | null>(null);
  const [pendingShift, setPendingShift] = useState<any>(null);
  const [patternShift, setPatternShift] = useState<any>(null);
  const actions = campusActionsForSchool(
    school.id,
    clubFits.map((fit: any) => fit.id),
  );
  const planResult = results.find(
    (result: any) =>
      result.id === planMajorId || result.family === focus.family,
  );
  const semesterPlan = buildFirstSemesterPlan(focus.program, {
    careerOptions: decisionPriorities.earnings + decisionPriorities.flexibility,
    prestige: decisionPriorities.recognition,
    workload: decisionPriorities.balance,
    belonging: decisionPriorities.impact,
  });
  const bestTest = selectNextBestFieldworkMission(
    { reasons: planResult?.reasons ?? [] },
    pattern,
    missions
      .filter((mission) => !completed.includes(missionPrefix + mission.id))
      .map((mission) => mission.id),
  );
  const bestMissionId = missionPrefix + bestTest.missionId;
  const nextMission = missions.find(
    (mission) => !completed.includes(missionPrefix + mission.id),
  );
  const briefFor = (missionId: string) =>
    buildMissionBrief(
      missionId,
      focus,
      school,
      actions.find((action: CampusAction) => action.url),
    );
  const openMission = (missionId: string) => {
    light();
    setActiveMissionId(missionId);
  };

  useEffect(() => {
    if (session.activeFocusByCampus[school.id] !== planMajorId) {
      dispatch(sessionActions.fieldworkFocusSet(school.id, planMajorId));
    }
  }, [dispatch, school.id, planMajorId, session.activeFocusByCampus]);
  useEffect(() => {
    if (!requestedMission || !isKnownFieldworkMissionId(requestedMission))
      return;
    setActiveMissionId(missionPrefix + requestedMission);
    onMissionOpened();
  }, [requestedMission, missionPrefix, onMissionOpened]);
  useEffect(() => {
    if (!pendingShift) return;
    const saved = session.reflections[pendingShift.missionId];
    if (saved?.recordedAt !== pendingShift.recordedAt) return;
    setPatternShift({
      ...pendingShift,
      after: results.map((result: any) => ({
        id: result.id,
        name: result.name,
      })),
    });
    setPendingShift(null);
  }, [pendingShift, results, session.reflections]);

  if (choosingFocus)
    return (
      <FocusPicker
        school={school}
        currentId={planMajorId}
        savedIds={session.shortlist}
        onClose={() => setChoosingFocus(false)}
        onSelect={(id) => {
          dispatch(sessionActions.fieldworkFocusSet(school.id, id));
          setActiveMissionId(null);
          setChoosingFocus(false);
        }}
      />
    );
  if (celebration)
    return (
      <MissionCelebration
        missionTitle={celebration.missionTitle}
        energy={celebration.energy}
        onContinue={() => setCelebration(null)}
      />
    );
  if (patternShift)
    return (
      <PatternShiftReveal
        before={patternShift.before}
        after={patternShift.after}
        energy={patternShift.energy}
        focusedField={patternShift.focusedField}
        focusedDirection={patternShift.focusedDirection}
        changedSignals={patternShift.changedSignals}
        onDismiss={() => setPatternShift(null)}
        onNextTest={() => {
          setPatternShift(null);
          if (nextMission) openMission(missionPrefix + nextMission.id);
          else setChoosingFocus(true);
        }}
        nextTestLabel={
          nextMission ? "TRY THE NEXT MISSION" : "EXPLORE ANOTHER DIRECTION"
        }
      />
    );
  if (activeMissionId)
    return (
      <MissionWorkspace
        key={activeMissionId}
        missionId={activeMissionId}
        family={focus.family}
        fieldName={focus.name}
        brief={briefFor(activeMissionId)}
        planned={session.missions[activeMissionId]?.status === "planned"}
        reflection={session.reflections[activeMissionId]}
        onClose={() => setActiveMissionId(null)}
        onPlan={() =>
          dispatch(
            sessionActions.missionStatusSet(
              activeMissionId,
              "planned",
              new Date().toISOString(),
            ),
          )
        }
        onRemove={() => {
          dispatch({ type: "reflection/removed", missionId: activeMissionId });
          dispatch({ type: "mission/removed", missionId: activeMissionId });
          setActiveMissionId(null);
        }}
        onSave={(reflection) => {
          const changedSignals = Object.keys(
            signalsForFieldworkReflection(reflection),
          ).map(
            (dimension) =>
              fieldworkSignalCopy[dimension] ??
              modeCopy[dimension] ??
              dimension,
          );
          setPendingShift({
            missionId: reflection.missionId,
            recordedAt: reflection.recordedAt,
            energy: reflection.energy,
            focusedField: focus.name,
            focusedDirection: focus.family,
            changedSignals,
            before: results.map((result: any) => ({
              id: result.id,
              name: result.name,
            })),
          });
          dispatch(sessionActions.reflectionSaved(reflection));
          dispatch(
            sessionActions.missionStatusSet(
              reflection.missionId,
              "completed",
              reflection.recordedAt,
            ),
          );
          success();
          setCelebration({
            missionTitle: briefFor(reflection.missionId).title,
            energy: reflection.energy,
          });
          setActiveMissionId(null);
        }}
      />
    );
  return (
    <ScrollView contentContainerStyle={s.tabScroll}>
      <Text style={s.eyebrow}>{school.shortName} / Fieldwork</Text>
      <View style={s.unitBanner}>
        <View style={{ flex: 1 }}>
          <Text style={s.unitEyebrow}>Currently exploring</Text>
          <Text style={s.unitTitle}>{focus.name}</Text>
        </View>
        <View style={s.unitScore}>
          <Text style={s.unitScoreValue}>
            {completed.length}/{missions.length}
          </Text>
          <Text style={s.unitScoreLabel}>complete</Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => setChoosingFocus(true)}
        style={s.resetButton}
      >
        <Text style={[s.resetButtonText, { color: C.cobalt }]}>
          Change field
        </Text>
      </Pressable>
      <View style={s.evidenceTrack}>
        <View
          style={[
            s.evidenceFill,
            { width: `${(completed.length / missions.length) * 100}%` },
          ]}
        />
      </View>
      {!completed.includes(missionPrefix + "work-sample") ? (
        <View style={s.emptyShortlist}>
          <Text style={s.emptyShortlistKicker}>
            Start here · 15 min · From home
          </Text>
          <Text style={s.emptyShortlistTitle}>
            {briefFor(missionPrefix + "work-sample").title}
          </Text>
          <Text style={s.emptyShortlistBody}>
            A short exercise. No campus access or experience needed.
          </Text>
          <PrimaryButton
            label="Try the work"
            onPress={() => openMission(missionPrefix + "work-sample")}
          />
        </View>
      ) : null}
      {completed.length === missions.length ? (
        <View style={s.emptyShortlist}>
          <Text style={s.emptyShortlistTitle}>
            You have a real body of evidence.
          </Text>
          <Text style={s.emptyShortlistBody}>
            Review your reflections, compare another direction, or take your
            questions to an advisor. You don't need to pick a permanent winner.
          </Text>
          <PrimaryButton
            label="Test another direction"
            onPress={() => setChoosingFocus(true)}
          />
        </View>
      ) : completed.includes(missionPrefix + "work-sample") &&
        !completed.includes(bestMissionId) ? (
        <View style={s.pathHypothesisWrap}>
          <HypothesisTestCard
            known={bestTest.known}
            uncertainty={bestTest.uncertainty}
            rationale={bestTest.rationale}
            testTitle={briefFor(bestMissionId).title}
            testTime={
              missions.find((mission) => mission.id === bestTest.missionId)
                ?.time ?? "15 min"
            }
            falsificationPrompts={bestTest.falsificationPrompts}
            onStartTest={() => openMission(bestMissionId)}
          />
        </View>
      ) : null}
      <Text style={s.listHeading}>Your experiments</Text>
      {missions.map((mission, index) => {
        const id = missionPrefix + mission.id;
        const done = completed.includes(id);
        const planned = session.missions[id]?.status === "planned";
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityLabel={
              briefFor(id).title +
              (done
                ? ", completed"
                : planned
                  ? ", in progress"
                  : ", not started")
            }
            onPress={() => openMission(id)}
            style={[s.mission, done && s.missionDone, planned && s.missionNext]}
          >
            <View style={[s.missionNode, done && { backgroundColor: C.teal }]}>
              <Text
                style={{ color: done ? C.white : C.cobalt, fontWeight: "700" }}
              >
                {done ? "✓" : String(index + 1).padStart(2, "0")}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.missionPhase}>
                {done ? "Completed" : planned ? "In progress" : mission.phase}
              </Text>
              <Text style={s.missionTitle}>{briefFor(id).title}</Text>
              <Text style={s.missionTime}>
                {mission.time} · {done ? "Review reflection" : "View brief"}
              </Text>
            </View>
          </Pressable>
        );
      })}
      <View style={s.privacyCard}>
        <Text style={s.coachTitle}>Refine your suggestions</Text>
        <Text style={s.privacyBody}>
          Answer a few questions or try a short challenge.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onSharpen}
          style={s.textAction}
        >
          <Text style={s.textActionLabel}>Explore your interests →</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={s.resetButton}
          onPress={onEditProfile}
        >
          <Text style={[s.resetButtonText, { color: C.cobalt }]}>
            Edit interests and priorities
          </Text>
        </Pressable>
      </View>
      <SemesterPlanCard plan={semesterPlan} />
      <Text style={s.listHeading}>People worth talking to</Text>
      {matchingClubs(clubFits, clubs).length ? (
        matchingClubs(clubFits, clubs)
          .slice(0, 2)
          .map((club: any, i: number) => (
            <ClubMatchCard
              key={club.id}
              club={club}
              rank={i + 1}
              schoolId={school.id}
            />
          ))
      ) : (
        <CampusDirectoryCard school={school} />
      )}
      <Text style={s.listHeading}>Campus starting points</Text>
      {actions.slice(0, 3).map((action: CampusAction) => (
        <CampusActionCard key={action.id} action={action} />
      ))}
    </ScrollView>
  );
}
function Explore({
  results,
  clubFits,
  clubs,
  session,
  dispatch,
  school,
  stories,
  onOpen,
  onStart,
  onCompare,
}: any) {
  const [query, setQuery] = useState("");
  const saved = session.shortlist as string[];
  const programs = school.catalog.programs;
  const savedMajors = saved
    .map((id) => programs.find((major: any) => major.id === id))
    .filter(Boolean);
  const list = useMemo(
    () =>
      programs.filter((m: any) =>
        m.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, programs],
  );
  const toggleSaved = (majorId: string) => {
    const action = saved.includes(majorId) ? "removed" : "added";
    dispatch(sessionActions.shortlistToggled(majorId));
    analytics.track({
      name: "shortlist_changed",
      payload: { campusId: school.id, majorId, action },
    });
  };
  return (
    <ScrollView
      contentContainerStyle={s.tabScroll}
      keyboardShouldPersistTaps="handled"
    >
      <Intro
        eyebrow={school.shortName}
        title="Explore majors"
        body="Save a few, then compare the work."
      />
      <Text style={s.listHeading}>
        Saved majors{savedMajors.length ? ` · ${savedMajors.length}` : ""}
      </Text>
      {savedMajors.length >= 2 ? (
        <PrimaryButton label="Compare saved majors" onPress={onCompare} />
      ) : null}
      {savedMajors.length === 0 ? (
        <Text style={s.catalogNote}>
          Nothing saved yet. Use + to add a major below.
        </Text>
      ) : (
        savedMajors.map((major) => (
          <View
            key={major.id}
            style={[s.shortCard, { borderLeftColor: C.teal }]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${major.name} details`}
              onPress={() => onOpen(major.id)}
              style={{ minHeight: 48 }}
            >
              <Text style={s.shortName}>{major.name}</Text>
              <Text style={s.shortLevel}>{major.school} · View details</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={s.textAction}
              onPress={() => onStart(major.id, "work-sample")}
            >
              <Text style={s.textActionLabel}>Try the work →</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${major.name} from saved programs`}
              onPress={() => toggleSaved(major.id)}
              style={s.resetButton}
            >
              <Text style={s.resetButtonText}>Remove from saved</Text>
            </Pressable>
          </View>
        ))
      )}
      <Text style={s.listHeading}>
        {school.dataDepth === "generic" ? "Broad fields" : "All majors"} ·{" "}
        {programs.length}
      </Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        accessibilityLabel="Search the catalog"
        placeholder="Search majors"
        placeholderTextColor="#92928C"
        style={s.searchInput}
      />
      {!list.length ? (
        <Text style={s.catalogNote}>
          No programs match. Try a broader name or clear the search.
        </Text>
      ) : null}
      {list.map((m: any) => (
        <Pressable
          key={m.id}
          accessibilityRole="button"
          accessibilityLabel={`${saved.includes(m.id) ? "Remove" : "Save"} ${m.name}`}
          accessibilityState={{ selected: saved.includes(m.id) }}
          onPress={() => {
            light();
            toggleSaved(m.id);
          }}
          style={s.catalogRow}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.catalogName}>{m.name}</Text>
            <Text style={s.catalogMeta}>
              {m.school} ·{" "}
              {m.access === "direct" ? "Direct entry" : "Entry requirements"}
            </Text>
          </View>
          <Text
            style={[
              s.add,
              saved.includes(m.id) && {
                backgroundColor: C.ink,
                color: C.white,
              },
            ]}
          >
            {saved.includes(m.id) ? "✓" : "+"}
          </Text>
        </Pressable>
      ))}
      <Text style={s.catalogNote}>{school.catalog.note}</Text>
      <Text style={s.listHeading}>Suggested fields</Text>
      {results.map((r: any) => (
        <Pressable
          key={r.id}
          accessibilityRole="button"
          onPress={() => onOpen(r.id)}
          style={[s.shortCard, { borderLeftColor: r.color }]}
        >
          <Text style={s.shortName}>{r.name}</Text>
          <Text style={s.shortLevel}>{r.level} · Broad field</Text>
        </Pressable>
      ))}
      <Text style={s.listHeading}>People exploring similar work</Text>
      {matchingClubs(clubFits, clubs).length ? (
        matchingClubs(clubFits, clubs).map((club: any, i: number) => (
          <ClubMatchCard
            key={club.id}
            club={club}
            rank={i + 1}
            schoolId={school.id}
          />
        ))
      ) : (
        <CampusDirectoryCard school={school} />
      )}
      <Text style={s.listHeading}>Students who took a similar detour</Text>
      {stories.slice(0, 2).map((story: MatchedStudentStory) => (
        <StudentStoryCard key={story.id} story={story} />
      ))}
    </ScrollView>
  );
}
function BeliefEvidenceCard({ map }: any) {
  const statusLabel: Record<string, string> = {
    aligned: "CLUES AGREE",
    worth_testing: "WORTH TESTING",
    in_tension: "CLUES DIFFER",
    not_enough_evidence: "TOO SOON TO CALL",
    unresolved_direction: "NEEDS A REAL TEST",
  };
  return (
    <View style={s.beliefCard}>
      <Text style={s.beliefKicker}>What you thought ↔ what you tried</Text>
      <Text style={s.beliefTitle}>{map.summary}</Text>
      {map.items.slice(0, 3).map((item: any) => (
        <View key={`${item.kind}-${item.label}`} style={s.beliefRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.beliefLabel}>{item.label}</Text>
            <Text style={s.beliefExplanation}>{item.explanation}</Text>
          </View>
          <Text style={s.beliefStatus}>{statusLabel[item.status]}</Text>
        </View>
      ))}
      <Text style={s.beliefDisclaimer}>{map.disclaimer}</Text>
    </View>
  );
}

function PrivacyToggle({ label, value, onPress }: any) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={s.privacyToggle}
    >
      <Text style={s.privacyToggleLabel}>{label}</Text>
      <View style={[s.toggleTrack, value && s.toggleTrackOn]}>
        <View style={[s.toggleThumb, value && s.toggleThumbOn]} />
      </View>
    </Pressable>
  );
}

function You({
  strengths,
  enjoy,
  pattern,
  readiness,
  admittedProgram,
  admittedLikes,
  admittedLikeNote,
  consideredMajors,
  noOtherMajorsYet,
  beliefMap,
  timelineEntries,
  session,
  results,
  onShareAdvisor,
  onExportData,
  onReset,
  decisionPriorities,
  onEditProfile,
  onSharpen,
}: any) {
  const [shareAdmissions, setShareAdmissions] = useState(true);
  const [shareFreeText, setShareFreeText] = useState(false);
  const [shareFieldNotes, setShareFieldNotes] = useState(false);
  const [coachResult, setCoachResult] =
    useState<ReflectionAssistantResult | null>(null);
  const ranked = WORK_MODES.map((mode) => ({
    mode,
    value: pattern.workModes[mode],
  }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
  const rankedPriorities = priorityFactors
    .map(([id, label]) => ({ id, label, value: decisionPriorities[id] }))
    .sort((a, b) => b.value - a.value);
  const latestReflection = Object.values(
    session.reflections as Record<string, FieldworkReflection>,
  ).sort((a, b) => (b.recordedAt ?? "").localeCompare(a.recordedAt ?? ""))[0];
  const runReflectionCoach = async () => {
    if (!latestReflection) return;
    const rawMissionId = latestReflection.missionId.split(":").pop() ?? "";
    const missionTitle =
      missions.find((mission) => mission.id === rawMissionId)?.title ??
      "Your latest fieldwork";
    setCoachResult(
      await createReflectionAssistant()({
        missionTitle,
        energy: latestReflection.energy,
        friction: latestReflection.friction,
        note: latestReflection.note,
        leadingDirections: results.map((item: any) => item.name).slice(0, 3),
      }),
    );
  };
  return (
    <ScrollView contentContainerStyle={s.tabScroll}>
      <Intro
        eyebrow="Your field notes"
        title="What you’re learning"
        body="Your interests, reflections, and next questions."
      />
      <BeliefEvidenceCard map={beliefMap} />
      <View style={s.privacyCard}>
        <PrimaryButton
          label="Edit my interests & priorities"
          onPress={onEditProfile}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onSharpen}
          style={s.resetButton}
        >
          <Text style={[s.resetButtonText, { color: C.cobalt }]}>
            Sharpen my results →
          </Text>
        </Pressable>
      </View>
      <View style={s.lensCard}>
        <Text style={s.lensKicker}>Your priorities</Text>
        <Text style={s.lensTitle}>
          {rankedPriorities[0].label} matters most to you.
        </Text>
        <Text style={s.lensBody}>
          This shapes how we discuss tradeoffs and your semester—not which major
          you are “allowed” to choose.
        </Text>
        <View style={s.lensChips}>
          {rankedPriorities.map((item) => (
            <Text key={item.id} style={s.lensChip}>
              {item.label.toUpperCase()} {item.value}
            </Text>
          ))}
        </View>
      </View>
      <View style={s.readinessCard}>
        <Text style={s.readinessLabel}>Confidence in your results</Text>
        <Text style={s.readinessTitle}>
          {readiness.level === "well_evidenced"
            ? "Several signals agree"
            : readiness.level === "developing"
              ? "Your pattern is taking shape"
              : "Still an early hypothesis"}
        </Text>
        <Text style={s.readinessBody}>{readiness.explanation}</Text>
      </View>
      {ranked.map((item, i) => (
        <View key={item.mode} style={s.modeRow}>
          <Text style={s.modeNum}>0{i + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.modeTitle}>{item.mode.toUpperCase()}</Text>
            <Text style={s.modeBody}>
              {item.value < 0
                ? `Your fieldwork pushed away from ${modeCopy[item.mode] ?? item.mode}.`
                : `You kept leaning toward ${modeCopy[item.mode] ?? item.mode}.`}
            </Text>
            <View style={s.modeTrack}>
              <View
                style={[
                  s.modeFill,
                  item.value < 0 && { backgroundColor: C.orange },
                  {
                    width: `${Math.min(100, Math.max(0, Math.abs(item.value) * 100))}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      ))}
      <Text style={s.listHeading}>Your starting point</Text>
      <Info
        label="Admitted for"
        value={admittedProgram || "Not answered yet"}
      />
      <Info
        label="What pulls you toward it"
        value={
          [...admittedLikes, admittedLikeNote].filter(Boolean).join(" · ") ||
          "Not answered yet"
        }
      />
      <Info
        label="Also considered"
        value={
          noOtherMajorsYet
            ? noOtherMajorsLabel
            : consideredMajors.length
              ? consideredMajors.join(" · ")
              : "Not answered yet"
        }
      />
      <Info
        label="Comes naturally"
        value={(strengths.length ? strengths : ["Not answered yet"]).join(
          " · ",
        )}
      />
      <Info
        label="Actually enjoy"
        value={(enjoy.length ? enjoy : ["Not answered yet"]).join(" · ")}
      />
      <View style={s.timelineWrap}>
        <EvidenceTimeline entries={timelineEntries} />
      </View>
      <View style={s.youContra}>
        <Text style={s.contraKicker}>Important, actually</Text>
        <Text style={s.contraTitle}>You are allowed to change your mind.</Text>
        <Text style={s.contraBody}>
          A campus quest can strengthen the pattern, make it messier, or prove
          it completely wrong. All three are a win.
        </Text>
      </View>
      <Text style={s.listHeading}>Latest reflection</Text>
      <View style={s.coachCard}>
        <Text style={s.coachTitle}>
          {latestReflection
            ? "Review your latest experiment"
            : "Your first reflection will appear here."}
        </Text>
        {coachResult ? (
          <>
            <Text style={s.coachSummary}>{coachResult.summary}</Text>
            {coachResult.followUpQuestions.map((question) => (
              <Text key={question} style={s.coachQuestion}>
                → {question}
              </Text>
            ))}
            <Text style={s.coachSource}>
              {coachResult.source === "local"
                ? "PRIVATE LOCAL SUMMARY"
                : "SECURE PROXY SUMMARY"}
            </Text>
          </>
        ) : null}
        <PrimaryButton
          label="Review reflection"
          disabled={!latestReflection}
          onPress={runReflectionCoach}
        />
      </View>
      <Text style={s.listHeading}>Loop in your advisor</Text>
      <View style={s.privacyCard}>
        <Text style={s.privacyBody}>{privacyControlCopy.sharing}</Text>
        <PrivacyToggle
          label="Include admissions context"
          value={shareAdmissions}
          onPress={() => setShareAdmissions((value) => !value)}
        />
        <PrivacyToggle
          label="Include my free-text admissions note"
          value={shareFreeText}
          onPress={() => setShareFreeText((value) => !value)}
        />
        <PrivacyToggle
          label="Include fieldwork notes"
          value={shareFieldNotes}
          onPress={() => setShareFieldNotes((value) => !value)}
        />
        <PrimaryButton
          label="Create advisor summary"
          onPress={() =>
            onShareAdvisor({
              includeAdmissionsContext: shareAdmissions,
              includeFreeText: shareFreeText,
              includeFieldworkNotes: shareFieldNotes,
            })
          }
        />
      </View>
      <Text style={s.listHeading}>Your data</Text>
      <View style={s.privacyCard}>
        <Text style={s.privacyBody}>{privacyControlCopy.localStorage}</Text>
        <PrimaryButton label="Export my data" onPress={onExportData} />
        <Pressable onPress={onReset} style={s.resetButton}>
          <Text style={s.resetButtonText}>Reset all my clues</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
function TabPanel({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const [visited, setVisited] = useState(active);
  useEffect(() => {
    if (active) setVisited(true);
  }, [active]);
  if (!active && !visited) return null;
  return (
    <View
      style={{ flex: 1, display: active ? "flex" : "none" }}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
    >
      {children}
    </View>
  );
}

function Tabs({
  strengths,
  enjoy,
  pattern,
  readiness,
  clubFits,
  clubs,
  results,
  session,
  dispatch,
  school,
  saveStatus,
  admittedProgram,
  admittedLikes,
  admittedLikeNote,
  consideredMajors,
  noOtherMajorsYet,
  requestedMission,
  onMissionOpened,
  onSharpen,
  onEditProfile,
  onOpen,
  onStart,
  initialTab = "path",
  beliefMap,
  campusActions,
  stories,
  timelineEntries,
  onShareAdvisor,
  onExportData,
  onReset,
  decisionPriorities,
}: any) {
  const [tab, setTab] = useState<Tab>(initialTab);
  useEffect(() => {
    if (requestedMission) setTab("path");
  }, [requestedMission]);
  const [comparisonIds, setComparisonIds] = useState<string[]>(() =>
    (session.shortlist as string[]).slice(0, 3),
  );
  const comparisonCompleted = useRef(false);
  const comparisonEdited = useRef(false);
  useEffect(() => {
    if (
      !comparisonEdited.current &&
      !comparisonIds.length &&
      session.shortlist.length >= 2
    ) {
      setComparisonIds((session.shortlist as string[]).slice(0, 3));
    }
  }, [comparisonIds.length, session.shortlist]);
  const updateComparison = (ids: string[]) => {
    comparisonEdited.current = true;
    setComparisonIds(ids);
    if (ids.length >= 2 && !comparisonCompleted.current) {
      comparisonCompleted.current = true;
      analytics.track({
        name: "comparison_completed",
        payload: {
          campusId: school.id,
          majorIds: ids as [string, string, ...string[]],
        },
      });
    }
  };
  return (
    <Page>
      <View style={{ flex: 1 }}>
        <TabPanel active={tab === "path"}>
          <Path
            key={
              resolveFieldworkFocus(
                school,
                session.activeFocusByCampus[school.id],
                results[0]?.id,
              ).id
            }
            clubFits={clubFits}
            clubs={clubs}
            results={results}
            session={session}
            dispatch={dispatch}
            school={school}
            pattern={pattern}
            requestedMission={requestedMission}
            onMissionOpened={onMissionOpened}
            onSharpen={onSharpen}
            onEditProfile={onEditProfile}
            actions={campusActions}
            decisionPriorities={decisionPriorities}
          />
        </TabPanel>
        <TabPanel active={tab === "explore"}>
          <Explore
            results={results}
            clubFits={clubFits}
            clubs={clubs}
            session={session}
            dispatch={dispatch}
            school={school}
            stories={stories}
            onOpen={(id: string) => onOpen(id, "explore")}
            onStart={onStart}
            onCompare={() => {
              setComparisonIds(
                (session.shortlist as string[])
                  .filter((id) =>
                    school.catalog.programs.some((p: any) => p.id === id),
                  )
                  .slice(0, 3),
              );
              setTab("compare");
            }}
          />
        </TabPanel>
        <TabPanel active={tab === "compare"}>
          <ScrollView contentContainerStyle={s.comparisonScroll}>
            <MajorComparison
              school={school}
              selectedIds={comparisonIds}
              onSelectedIdsChange={updateComparison}
              onProgramPress={(id: string) => onOpen(id, "compare")}
              detailsByProgramId={
                school.id === "umich" ? umichComparisonDetails : undefined
              }
            />
          </ScrollView>
        </TabPanel>
        <TabPanel active={tab === "you"}>
          <You
            strengths={strengths}
            enjoy={enjoy}
            pattern={pattern}
            readiness={readiness}
            admittedProgram={admittedProgram}
            admittedLikes={admittedLikes}
            admittedLikeNote={admittedLikeNote}
            consideredMajors={consideredMajors}
            noOtherMajorsYet={noOtherMajorsYet}
            beliefMap={beliefMap}
            timelineEntries={timelineEntries}
            session={session}
            results={results}
            onShareAdvisor={onShareAdvisor}
            onExportData={onExportData}
            onReset={onReset}
            onEditProfile={onEditProfile}
            onSharpen={onSharpen}
            decisionPriorities={decisionPriorities}
          />
        </TabPanel>
      </View>
      {saveStatus === "error" || saveStatus === "saving" ? (
        <View style={s.saveStrip} accessibilityLiveRegion="polite">
          <Text
            style={[
              s.saveStripText,
              saveStatus === "error" && { color: C.orange },
            ]}
          >
            {saveStatus === "error"
              ? "Couldn’t save your progress. Retrying…"
              : "Saving…"}
          </Text>
        </View>
      ) : null}
      <View style={s.tabBar}>
        {(["path", "explore", "compare", "you"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
            onPress={() => {
              light();
              if (t === "compare" && comparisonIds.length >= 2) {
                analytics.track({
                  name: "comparison_opened",
                  payload: {
                    campusId: school.id,
                    majorIds: comparisonIds as [string, string, ...string[]],
                  },
                });
              }
              Keyboard.dismiss();
              setTab(t);
            }}
            style={[s.tab, tab === t && s.tabActive]}
          >
            <TabIcon name={t} color={tab === t ? C.cobalt : C.muted} />
            <Text
              style={[
                s.tabText,
                tab === t && { color: C.cobalt, fontWeight: "600" },
              ]}
            >
              {t === "path"
                ? "Home"
                : t === "explore"
                  ? "Browse"
                  : t === "compare"
                    ? "Compare"
                    : "Me"}
            </Text>
          </Pressable>
        ))}
      </View>
    </Page>
  );
}

function EditInterests({
  strengths,
  enjoyment,
  priorities,
  onSave,
  onCancel,
}: any) {
  const [natural, setNatural] = useState<string[]>([...strengths]);
  const [enjoyed, setEnjoyed] = useState<string[]>([...enjoyment]);
  const [allocation, setAllocation] = useState({ ...priorities });
  const valid =
    natural.length > 0 &&
    enjoyed.length > 0 &&
    Object.values(allocation).reduce<number>(
      (sum, value) => sum + Number(value),
      0,
    ) === 100;
  return (
    <Page
      footer={
        <PrimaryButton
          disabled={!valid}
          label="Save my changes"
          onPress={() => onSave(natural, enjoyed, allocation)}
        />
      }
    >
      <Header onBack={onCancel} />
      <ScrollView contentContainerStyle={s.onboard}>
        <Intro
          title="Update your starting point"
          body="Your interests can change. Saving updates your recommendations without erasing your missions, reflections, or saved programs."
        />
        {[
          { title: "WHAT COMES NATURALLY", selected: natural, set: setNatural },
          {
            title: "WHAT YOU ACTUALLY ENJOY",
            selected: enjoyed,
            set: setEnjoyed,
          },
        ].map((group) => (
          <View key={group.title}>
            <Text style={s.listHeading}>{group.title}</Text>
            <View style={s.subjectGrid}>
              {subjects.map((subject) => (
                <Pressable
                  key={subject}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${group.title}: ${subject}`}
                  accessibilityState={{
                    checked: group.selected.includes(subject),
                  }}
                  onPress={() =>
                    group.set(
                      group.selected.includes(subject)
                        ? group.selected.filter((item) => item !== subject)
                        : [...group.selected, subject],
                    )
                  }
                  style={[
                    s.subject,
                    group.selected.includes(subject) && s.subjectOn,
                  ]}
                >
                  <Text
                    style={[
                      s.subjectText,
                      group.selected.includes(subject) && { color: C.white },
                    ]}
                  >
                    {subject}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <Text style={s.listHeading}>What matters now</Text>
        <PriorityAllocator value={allocation} onChange={setAllocation} />
        <Text style={s.prototypeNote}>
          Choose at least one subject in each group and allocate exactly 100
          points. Back leaves your saved answers unchanged.
        </Text>
      </ScrollView>
    </Page>
  );
}

const discoveryChallengeIds = [
  "price-move",
  "double-ping",
  "five-seconds",
  "first-fix",
  "curiosity-map",
  "classroom-snapshots",
];

function Main() {
  const {
    state: session,
    dispatch,
    hydrated: sessionHydrated,
    saveStatus,
    loadError,
    retryLoad,
  } = usePersistentSession();
  const [sessionReady, setSessionReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("cover");
  const [requestedMission, setRequestedMission] = useState<string | null>(null);
  const [detailReturn, setDetailReturn] = useState<Screen>("reveal");
  const [returnTab, setReturnTab] = useState<Tab>("path");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [unit, setUnit] = useState("");
  const [admittedProgram, setAdmittedProgram] = useState("");
  const [admittedLikes, setAdmittedLikes] = useState<string[]>([]);
  const [admittedLikeNote, setAdmittedLikeNote] = useState("");
  const [consideredMajors, setConsideredMajors] = useState<string[]>([]);
  const [noOtherMajorsYet, setNoOtherMajorsYet] = useState(false);
  const [consideredDraft, setConsideredDraft] = useState("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [enjoy, setEnjoy] = useState<string[]>([]);
  const [decisionPriorities, setDecisionPriorities] = useState(
    defaultDecisionPriorities,
  );
  const [profileAt, setProfileAt] = useState(0);
  const [profileAnswers, setProfileAnswers] = useState<Record<string, string>>(
    {},
  );
  const [branchAt, setBranchAt] = useState(0);
  const [subjectAnswers, setSubjectAnswers] = useState<Record<string, string>>(
    {},
  );
  const [challengeOutcomes, setChallengeOutcomes] = useState<
    Record<string, string>
  >({});
  const [challenge, setChallenge] = useState(0);
  const [selectedMajorId, setSelectedMajorId] = useState("");
  const onboardingStartedAt = useRef<number | null>(null);
  const revealTracked = useRef(false);
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (!sessionHydrated || sessionReady) return;
    const onboarding = session.onboarding;
    const restoredAnswers = selectScalarProfileAnswers(session);
    const baseQuestionIds = new Set<string>(
      profileQuestions.map(({ id }) => id),
    );
    setSelectedSchoolId(onboarding.campusId ?? "");
    setUnit(onboarding.academicUnit ?? "");
    setAdmittedProgram(
      onboarding.admittedProgram ?? onboarding.declaredMajors[0] ?? "",
    );
    setAdmittedLikes(onboarding.admittedLikes);
    setAdmittedLikeNote(onboarding.admittedLikeNote);
    setConsideredMajors(onboarding.consideredMajors);
    setNoOtherMajorsYet(onboarding.noOtherMajorsYet);
    setStrengths(onboarding.strengths);
    setEnjoy(onboarding.enjoyment);
    setDecisionPriorities(
      onboarding.decisionPriorities ?? defaultDecisionPriorities,
    );
    setProfileAnswers(
      Object.fromEntries(
        Object.entries(restoredAnswers).filter(([id]) =>
          baseQuestionIds.has(id),
        ),
      ),
    );
    const firstUnansweredProfile = profileQuestions.findIndex(
      ({ id }) => !restoredAnswers[id],
    );
    setProfileAt(
      firstUnansweredProfile < 0
        ? profileQuestions.length - 1
        : firstUnansweredProfile,
    );
    setSubjectAnswers(
      Object.fromEntries(
        Object.entries(restoredAnswers).filter(
          ([id]) => !baseQuestionIds.has(id),
        ),
      ),
    );
    setChallengeOutcomes(onboarding.challengeOutcomes);
    setSessionReady(true);
  }, [sessionHydrated, sessionReady, session]);

  useEffect(() => {
    if (!sessionReady) return;
    dispatch(sessionActions.campusSet(selectedSchoolId));
    dispatch(sessionActions.academicUnitSet(unit || null));
    dispatch(sessionActions.admittedProgramSet(admittedProgram || null));
    dispatch(sessionActions.admittedLikesSet(admittedLikes));
    dispatch(sessionActions.admittedLikeNoteSet(admittedLikeNote));
    dispatch(sessionActions.consideredMajorsSet(consideredMajors));
    dispatch(sessionActions.noOtherMajorsYetSet(noOtherMajorsYet));
    dispatch(
      sessionActions.declaredMajorsSet(
        [admittedProgram, ...consideredMajors].filter(Boolean),
      ),
    );
    dispatch(sessionActions.strengthsSet(strengths));
    dispatch(sessionActions.enjoymentSet(enjoy));
    dispatch(sessionActions.decisionPrioritiesSet(decisionPriorities));
    Object.entries({ ...profileAnswers, ...subjectAnswers }).forEach(
      ([questionId, optionId]) =>
        dispatch(sessionActions.profileAnswerSet(questionId, [optionId])),
    );
    Object.entries(challengeOutcomes).forEach(([challengeId, outcomeId]) =>
      dispatch(sessionActions.challengeOutcomeSet(challengeId, outcomeId)),
    );
  }, [
    sessionReady,
    selectedSchoolId,
    unit,
    admittedProgram,
    admittedLikes,
    admittedLikeNote,
    consideredMajors,
    noOtherMajorsYet,
    strengths,
    enjoy,
    decisionPriorities,
    profileAnswers,
    subjectAnswers,
    challengeOutcomes,
    dispatch,
  ]);

  const go = (x: Screen) => {
    Keyboard.dismiss();
    if (screen === "cover" && x === "university") {
      onboardingStartedAt.current = Date.now();
      analytics.track({
        name: "onboarding_started",
        payload: { entryPoint: "fresh" },
      });
    }
    if (screen === "cover" && x === "tabs") {
      analytics.track({
        name: "session_resumed",
        payload: { destination: "fieldwork", daysAwayBucket: "same_day" },
      });
    }
    if (x === "reveal" && !revealTracked.current) {
      revealTracked.current = true;
      const elapsed = onboardingStartedAt.current
        ? Date.now() - onboardingStartedAt.current
        : 0;
      const durationBucket =
        elapsed > 5 * 60_000
          ? "over_5m"
          : elapsed > 2 * 60_000
            ? "2_to_5m"
            : "under_2m";
      analytics.track({
        name: "onboarding_completed",
        payload: {
          campusId: selectedSchoolId,
          challengeCount: Object.keys(challengeOutcomes).length,
          durationBucket,
        },
      });
      analytics.track({
        name: "recommendations_revealed",
        payload: {
          campusId: selectedSchoolId,
          resultCount: shownResults.length,
        },
      });
    }
    setScreen(x);
  };
  const toggle = (x: string, list: string[], set: any, max = 99) => {
    light();
    set(
      list.includes(x)
        ? list.filter((v) => v !== x)
        : list.length < max
          ? [...list, x]
          : list,
    );
  };
  const toggleConsidered = (name: string) => {
    if (name === noOtherMajorsLabel) {
      setNoOtherMajorsYet((current) => !current);
      setConsideredMajors([]);
      light();
      return;
    }
    setNoOtherMajorsYet(false);
    setConsideredMajors((current) => {
      return current.includes(name)
        ? current.filter((item) => item !== name)
        : current.length < 3
          ? [...current, name]
          : current;
    });
  };
  const addConsideredDraft = () => {
    const name = consideredDraft.trim();
    if (!name || name === admittedProgram) return;
    setNoOtherMajorsYet(false);
    setConsideredMajors((current) =>
      current.includes(name) || current.length >= 3
        ? current
        : [...current, name],
    );
    setConsideredDraft("");
    light();
  };
  const toggleAdmittedLike = (reason: string) => {
    const unsure = "I'm still figuring out what I like";
    setAdmittedLikes((current) => {
      if (reason === unsure) return current.includes(unsure) ? [] : [unsure];
      const withoutUnsure = current.filter((item) => item !== unsure);
      return withoutUnsure.includes(reason)
        ? withoutUnsure.filter((item) => item !== reason)
        : withoutUnsure.length < 3
          ? [...withoutUnsure, reason]
          : withoutUnsure;
    });
  };
  const selectedSchool = getSchoolData(selectedSchoolId);
  const priorMajors = [admittedProgram, ...consideredMajors].filter(Boolean);
  const unitOptions =
    selectedSchool.id === "other"
      ? [
          "Arts & Sciences / Undeclared",
          "Engineering / Computing",
          "Business",
          "Health / Human Services",
          "Arts / Design / Performance",
          "Another school or college",
        ]
      : [...selectedSchool.academicUnits];
  const preBranchEvidence = useMemo(
    () => buildEvidence(strengths, enjoy, profileAnswers, {}, {}),
    [strengths, enjoy, profileAnswers],
  );
  const preBranchPattern = useMemo(
    () => normalizeEvidence(preBranchEvidence),
    [preBranchEvidence],
  );
  const observedSignals: DimensionSignal = {
    ...preBranchPattern.workModes,
    ...preBranchPattern.activityModes,
    ...preBranchPattern.environment,
    ...preBranchPattern.friction,
  };
  const branchQuestions = useMemo(
    () => selectSubjectBranchQuestions(enjoy, observedSignals, 3),
    [enjoy, preBranchPattern],
  );
  const patternCue = useMemo(() => {
    const strongest = WORK_MODES.map((mode) => ({
      mode,
      value: preBranchPattern.workModes[mode],
    })).sort((a, b) => b.value - a.value)[0];
    return strongest?.value > 0
      ? modeCopy[strongest.mode]
      : "how you approach open-ended work";
  }, [preBranchPattern]);
  useEffect(() => {
    if (!sessionReady) return;
    const activeIds = new Set(branchQuestions.map(({ id }) => id));
    const staleIds = Object.keys(subjectAnswers).filter(
      (id) => !activeIds.has(id),
    );
    if (!staleIds.length) return;
    setSubjectAnswers(
      Object.fromEntries(
        Object.entries(subjectAnswers).filter(([id]) => activeIds.has(id)),
      ),
    );
    staleIds.forEach((questionId) =>
      dispatch({ type: "onboarding/profileAnswerRemoved", questionId }),
    );
  }, [branchQuestions, dispatch, sessionReady, subjectAnswers]);
  const evidence: EvidenceProfile = useMemo(
    () =>
      buildEvidence(
        strengths,
        enjoy,
        profileAnswers,
        subjectAnswers,
        challengeOutcomes,
        session.reflections,
      ),
    [
      strengths,
      enjoy,
      profileAnswers,
      subjectAnswers,
      challengeOutcomes,
      session.reflections,
    ],
  );
  const fits = useMemo(
    () => rankMajors(evidence, umichMajorProfiles),
    [evidence],
  );
  const shownResults = useMemo(
    () =>
      displayResults(fits, priorMajors, selectedSchool, {
        profile: profileAnswers,
        subjects: subjectAnswers,
        strengths,
        enjoyment: enjoy,
        challenges: challengeOutcomes,
      }),
    [
      fits,
      admittedProgram,
      consideredMajors,
      selectedSchool,
      profileAnswers,
      subjectAnswers,
      strengths,
      enjoy,
      challengeOutcomes,
    ],
  );
  const schoolClubs = [...(schoolClubsById[selectedSchoolId] ?? [])];
  const clubFits = useMemo(
    () => rankClubs(evidence, schoolClubs),
    [evidence, selectedSchoolId],
  );
  const readiness = useMemo(() => computeReadiness(evidence), [evidence]);
  const pattern = useMemo(() => normalizeEvidence(evidence), [evidence]);
  const timelineEntries = useMemo(
    () =>
      buildEvidenceTimeline({
        profile: evidence,
        reflections: session.reflections,
      }),
    [evidence, session.reflections],
  );
  const beliefMap = useMemo(
    () =>
      buildBeliefEvidenceMap(
        {
          admittedFor: admittedProgram,
          consideredMajors,
        },
        evidence,
        umichMajorProfiles,
      ),
    [admittedProgram, consideredMajors, evidence],
  );
  const campusActions = useMemo(
    () =>
      campusActionsForSchool(
        selectedSchoolId,
        clubFits.map((fit) => fit.id),
        6,
      ),
    [selectedSchoolId, clubFits],
  );
  const stories = useMemo(
    () =>
      matchCompositeStories(
        {
          ...pattern.workModes,
          ...pattern.activityModes,
          ...pattern.environment,
          ...pattern.friction,
        },
        3,
      ),
    [pattern],
  );
  const shareAdvisorBrief = (preferences: AdvisorBriefPreferences) => {
    const brief = generateAdvisorBrief({
      session,
      campusName: selectedSchool.name,
      rankedDirections: fits.slice(0, 3),
      evidence: pattern,
      generatedAt: new Date().toISOString(),
      preferences,
    });
    void Share.share({ message: formatAdvisorBrief(brief) }).catch(() =>
      Alert.alert("Unable to share", "Please try opening the brief again."),
    );
  };
  const exportUserData = () => {
    const payload = serializeUserDataExport(
      createUserDataExport(session, new Date().toISOString()),
    );
    void Share.share({ message: payload }).catch(() =>
      Alert.alert("Unable to export", "Please try exporting your data again."),
    );
  };
  const confirmReset = () => {
    Alert.alert(
      "Reset all evidence?",
      "This removes your onboarding answers, saved directions, and fieldwork reflections from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            dispatch(sessionActions.reset());
            setSessionReady(false);
            setScreen("cover");
          },
        },
      ],
    );
  };
  const selectedFocus = resolveFieldworkFocus(
    selectedSchool,
    selectedMajorId,
    shownResults[0]?.id,
  );
  const relatedResult = shownResults.find(
    (result) => result.family === selectedFocus.family,
  );
  const focusResult = shownResults.find(
    (result) => result.id === selectedMajorId,
  ) ?? {
    ...relatedResult,
    ...selectedFocus,
    name: selectedFocus.name.toUpperCase(),
    reasons: relatedResult?.reasons ?? [],
    why:
      relatedResult?.why ??
      "You chose this field to explore. Try its everyday work before drawing a conclusion.",
    campusPrograms: selectedSchool.catalog.programs.filter(
      (program) => program.family === selectedFocus.family,
    ),
    sourceMajorId: selectedFocus.program?.id,
  };
  const startFieldwork = (focusId: string, missionId = "work-sample") => {
    const nextFocus = resolveFieldworkFocus(
      selectedSchool,
      focusId,
      shownResults[0]?.id,
    );
    dispatch(sessionActions.fieldworkFocusSet(selectedSchool.id, nextFocus.id));
    setRequestedMission(missionId);
    setReturnTab("path");
    go("tabs");
  };
  const openProgram = (id: string, tab: Tab) => {
    setSelectedMajorId(id);
    setReturnTab(tab);
    setDetailReturn("tabs");
    go("major");
  };
  const evidenceSummary = [
    strengths.length + enjoy.length ? "your self-reported subjects" : "",
    Object.keys(profileAnswers).length + Object.keys(subjectAnswers).length
      ? "your scenario choices"
      : "",
    Object.keys(challengeOutcomes).length ? "your completed challenges" : "",
    Object.keys(session.reflections).length ? "your fieldwork reflections" : "",
  ]
    .filter(Boolean)
    .join(", ");
  if (screen === "editInterests")
    return (
      <EditInterests
        strengths={strengths}
        enjoyment={enjoy}
        priorities={decisionPriorities}
        onCancel={() => go("tabs")}
        onSave={(
          natural: string[],
          enjoyed: string[],
          priorities: typeof decisionPriorities,
        ) => {
          setStrengths(natural);
          setEnjoy(enjoyed);
          setDecisionPriorities(priorities);
          go("tabs");
        }}
      />
    );
  if (screen === "discovery") {
    const answered = profileQuestions.filter(
      (question) => profileAnswers[question.id],
    ).length;
    const tried = discoveryChallengeIds.filter(
      (id) => challengeOutcomes[id],
    ).length;
    return (
      <Page>
        <Header onBack={() => go("tabs")} />
        <ScrollView contentContainerStyle={s.onboard}>
          <Intro
            title="Sharpen your hypothesis"
            body="Pick either route. These are optional clues about curiosity—not tests of ability. Existing missions and saved programs stay intact."
          />
          <View style={s.privacyCard}>
            <Text style={s.coachTitle}>How you approach the work</Text>
            <Text style={s.privacyBody}>
              {answered}/{profileQuestions.length} choices answered. Then a few
              follow-ups based on your interests.
            </Text>
            <PrimaryButton
              label={
                answered
                  ? "CONTINUE OR REVISIT MY CHOICES"
                  : "TRY THE QUICK CHOICES"
              }
              onPress={() => {
                const nextProfile = profileQuestions.findIndex(
                  (question) => !profileAnswers[question.id],
                );
                const nextBranch = branchQuestions.findIndex(
                  (question) => !subjectAnswers[question.id],
                );
                if (nextProfile < 0 && nextBranch >= 0) {
                  setBranchAt(nextBranch);
                  go("subjectBranch");
                } else {
                  setProfileAt(Math.max(0, nextProfile));
                  go("profile");
                }
              }}
            />
          </View>
          <View style={s.privacyCard}>
            <Text style={s.coachTitle}>Try the work with the labels off</Text>
            <Text style={s.privacyBody}>
              {tried}/{discoveryChallengeIds.length} mini-challenges completed.
              Try one, then leave whenever you want; completed answers save.
            </Text>
            <PrimaryButton
              label={
                tried
                  ? "CONTINUE OR REVISIT CHALLENGES"
                  : "TRY THE MINI-CHALLENGES"
              }
              onPress={() => go("blind")}
            />
          </View>
          <PrimaryButton
            label="See my current results"
            onPress={() => go("reveal")}
          />
        </ScrollView>
      </Page>
    );
  }
  if (!sessionHydrated || !sessionReady) {
    return (
      <Page>
        <View style={s.hydrationCenter} accessibilityLiveRegion="polite">
          <Text style={s.wordmark}>UNLABELED</Text>
          <Text style={s.hydrationText}>
            {loadError
              ? "COULDN'T RESTORE YOUR FIELD NOTES"
              : "RESTORING YOUR FIELD NOTES…"}
          </Text>
          {loadError && (
            <>
              <Text style={s.privacyBody}>
                Your saved progress has not been changed. Try again to restore
                it safely.
              </Text>
              <PrimaryButton label="Try again" onPress={retryLoad} />
            </>
          )}
        </View>
      </Page>
    );
  }
  const canResumeFieldwork = sessionReady && session.onboarding.setupCompleted;
  const hasSavedSetup = Boolean(
    selectedSchoolId ||
    unit ||
    admittedProgram ||
    admittedLikes.length ||
    admittedLikeNote ||
    consideredMajors.length ||
    noOtherMajorsYet ||
    strengths.length ||
    enjoy.length ||
    Object.keys(profileAnswers).length,
  );
  const setupResumeScreen: Screen = !selectedSchoolId
    ? "university"
    : !unit
      ? "unit"
      : !admittedProgram
        ? "declared"
        : !admittedLikes.length && !admittedLikeNote.trim()
          ? "admittedWhy"
          : !consideredMajors.length && !noOtherMajorsYet
            ? "alternatives"
            : !strengths.length
              ? "strengths"
              : !enjoy.length
                ? "enjoy"
                : "priorities";
  if (screen === "cover")
    return (
      <Page
        footer={
          <PrimaryButton
            label={
              canResumeFieldwork
                ? "OPEN MY PLAN"
                : hasSavedSetup
                  ? "CONTINUE SETUP"
                  : "LET'S FIGURE IT OUT"
            }
            onPress={() => go(canResumeFieldwork ? "tabs" : setupResumeScreen)}
          />
        }
      >
        <Header />
        <ScrollView
          contentContainerStyle={[s.cover, { minHeight: height - 220 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.coverMascotWrap}>
            <View style={s.coverMascot}>
              <Image
                accessible={false}
                resizeMode="contain"
                source={scoutGuideImage}
                style={s.coverMascotImage}
              />
            </View>
            <View style={s.coverMascotBubble}>
              <Text style={s.guideName}>Meet scout</Text>
              <Text style={s.coverMascotCopy}>
                Explore the work behind a major, one small experiment at a time.
              </Text>
            </View>
          </View>
          <Text style={s.coverTitle}>Find work that feels like you.</Text>
          <Text style={s.coverBody}>
            A few starting questions. Two possible majors. One small experiment
            you can try before college begins.
          </Text>
          <View style={s.setupPromise}>
            <Text style={s.setupPromiseTitle}>
              About 3 minutes. Zero essays.
            </Text>
            <Text style={s.setupPromiseBody}>
              Your answers save on this device. Leave anytime and continue where
              you stopped.
            </Text>
          </View>
          <View style={s.coverPromises}>
            {[
              ["✓", "DISCOVER YOUR WORK STYLE"],
              ["✦", "UNLOCK A PERSONAL PATH"],
              ["→", "TRY IT IN THE REAL WORLD"],
            ].map(([n, label]) => (
              <View key={n} style={s.coverPromise}>
                <Text style={s.coverPromiseNum}>{n}</Text>
                <Text style={s.coverPromiseText}>{label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Page>
    );
  if (screen === "university")
    return (
      <Page
        footer={
          <PrimaryButton
            disabled={!selectedSchoolId}
            label="Yep, that's my campus"
            onPress={() => go("unit")}
          />
        }
      >
        <Header
          step={1}
          total={8}
          onBack={() => go("cover")}
          onExit={() => go("cover")}
        />
        <ScrollView contentContainerStyle={s.onboard}>
          <Intro
            title="Where are you headed?"
            body="Pick your campus and we'll make this feel way less generic."
          />
          <GuideBubble
            compact
            message="I’ll use your campus to turn the final pattern into places, people, and small missions you can actually try."
          />
          <UniversityPicker
            selectedId={selectedSchoolId}
            onSelect={(id: string) => {
              setSelectedSchoolId(id);
              setUnit("");
              setAdmittedProgram("");
              setAdmittedLikes([]);
              setAdmittedLikeNote("");
              setConsideredMajors([]);
              setNoOtherMajorsYet(false);
              setConsideredDraft("");
            }}
          />
          <Text style={s.prototypeNote}>
            {selectedSchool.dataDepth === "full"
              ? `We have a deeper catalog and campus-resource layer for ${selectedSchool.shortName}.`
              : schoolClubsById[selectedSchool.id]?.length
                ? `We have verified club starting points for ${selectedSchool.shortName}. Academic matches stay broad until its full program catalog is added.`
                : `We'll personalize the work first, then give you honest ways to test it at ${selectedSchool.shortName}. We won't pretend generic data is campus-specific.`}
          </Text>
        </ScrollView>
      </Page>
    );
  if (screen === "unit")
    return (
      <Page
        footer={
          <PrimaryButton
            disabled={!unit}
            label="Next"
            onPress={() => go("declared")}
          />
        }
      >
        <Header
          step={2}
          total={8}
          onBack={() => go("university")}
          onExit={() => go("cover")}
        />
        <ScrollView contentContainerStyle={s.onboard}>
          <Intro
            title="Where are you starting?"
            body="This helps us avoid suggesting a plan that makes zero sense for your school."
          />
          {unitOptions.map((x) => (
            <SelectTile
              key={x}
              label={x}
              selected={unit === x}
              onPress={() => setUnit(x)}
            />
          ))}
        </ScrollView>
      </Page>
    );
  if (screen === "declared")
    return (
      <Page
        footer={
          <PrimaryButton
            disabled={!admittedProgram}
            label="Next"
            onPress={() => go("admittedWhy")}
          />
        }
      >
        <Header
          step={3}
          total={8}
          onBack={() => go("unit")}
          onExit={() => go("cover")}
        />
        <ScrollView contentContainerStyle={s.onboard}>
          <Intro
            eyebrow="YOUR STARTING POINT"
            title="What were you admitted for?"
            body="Choose what's on your offer—or undeclared. It's your starting point, not your entire identity."
          />
          <View style={s.countRow}>
            <Text style={s.micro}>
              {selectedSchool.shortName.toUpperCase()} Catalog ·{" "}
              {selectedSchool.dataDepth.toUpperCase()}
            </Text>
          </View>
          <Text style={s.inputLabel}>Exact program on your offer</Text>
          <TextInput
            value={admittedProgram}
            onChangeText={(name) => {
              if (name !== admittedProgram) {
                setAdmittedLikes([]);
                setAdmittedLikeNote("");
              }
              setAdmittedProgram(name);
              setConsideredMajors((current) =>
                current.filter((item) => item !== name),
              );
            }}
            placeholder="Type the exact program or undeclared"
            placeholderTextColor="#8A918B"
            autoCapitalize="words"
            style={s.searchInput}
          />
          <Text style={s.pickerDivider}>
            Or choose from our current catalog
          </Text>
          <DeclaredPicker
            programs={selectedSchool.catalog.programs}
            selected={admittedProgram ? [admittedProgram] : []}
            emptyLabel="I was admitted undeclared / exploratory"
            onToggle={(name: string) => {
              const nextProgram = admittedProgram === name ? "" : name;
              if (nextProgram !== admittedProgram) {
                setAdmittedLikes([]);
                setAdmittedLikeNote("");
              }
              setAdmittedProgram(nextProgram);
              setConsideredMajors((current) =>
                current.filter((item) => item !== nextProgram),
              );
            }}
          />
          <Text style={s.prototypeNote}>{selectedSchool.catalog.note}</Text>
        </ScrollView>
      </Page>
    );
  if (screen === "admittedWhy")
    return (
      <Page
        footer={
          <PrimaryButton
            disabled={!admittedLikes.length && !admittedLikeNote.trim()}
            label="Next"
            onPress={() => go("alternatives")}
          />
        }
      >
        <Header
          step={4}
          total={8}
          onBack={() => go("declared")}
          onExit={() => go("cover")}
        />
        <ScrollView contentContainerStyle={s.onboard}>
          <Intro
            eyebrow={admittedProgram.toUpperCase()}
            title="What do you like about it?"
            body="Pick up to three. The reason matters way more than the label."
          />
          <AdmissionReasonsPicker
            reasons={admittedReasons}
            selected={admittedLikes}
            note={admittedLikeNote}
            onToggle={toggleAdmittedLike}
            onNoteChange={setAdmittedLikeNote}
          />
        </ScrollView>
      </Page>
    );
  if (screen === "alternatives")
    return (
      <Page
        footer={
          <PrimaryButton
            disabled={!consideredMajors.length && !noOtherMajorsYet}
            label="Next"
            onPress={() => go("strengths")}
          />
        }
      >
        <Header
          step={5}
          total={8}
          onBack={() => go("admittedWhy")}
          onExit={() => go("cover")}
        />
        <ScrollView contentContainerStyle={s.onboard}>
          <Intro
            title="What else were you considering?"
            body="Add up to three other majors—even if they make absolutely no sense together yet."
          />
          <AlternativesPicker
            programs={selectedSchool.catalog.programs}
            selected={consideredMajors}
            exclude={[admittedProgram]}
            onToggle={toggleConsidered}
            noOtherMajorsYet={noOtherMajorsYet}
            noOtherMajorsLabel={noOtherMajorsLabel}
            draft={consideredDraft}
            onDraftChange={setConsideredDraft}
            onAddDraft={addConsideredDraft}
          />
        </ScrollView>
      </Page>
    );
  if (screen === "strengths" || screen === "enjoy") {
    const isEnjoy = screen === "enjoy",
      list = isEnjoy ? enjoy : strengths,
      set = isEnjoy ? setEnjoy : setStrengths;
    return (
      <Page
        footer={
          <PrimaryButton
            disabled={!list.length}
            label="Next"
            onPress={() => go(isEnjoy ? "priorities" : "enjoy")}
          />
        }
      >
        <Header
          step={isEnjoy ? 7 : 6}
          total={8}
          onBack={() => go(isEnjoy ? "strengths" : "alternatives")}
          onExit={() => go("cover")}
        />
        <ScrollView contentContainerStyle={s.onboard}>
          <Intro
            eyebrow={isEnjoy ? "NOW FORGET YOUR GRADES" : undefined}
            title={
              isEnjoy ? "What did you actually enjoy?" : "What came naturally?"
            }
            body={
              isEnjoy
                ? "Pick what pulled you in. We'll ask what part of each subject you liked next."
                : "The classes where things tended to click."
            }
          />
          <GuideBubble
            compact
            mood="encourage"
            message={
              isEnjoy
                ? "Enjoyment and being good at something are different clues. Choose what made you want to keep going."
                : "This is only one clue. Easy doesn’t automatically mean right—and hard doesn’t mean wrong."
            }
          />
          <View style={s.subjectGrid}>
            {subjects.map((x) => (
              <Pressable
                key={x}
                accessibilityRole="checkbox"
                accessibilityLabel={x}
                accessibilityState={{ checked: list.includes(x) }}
                onPress={() => toggle(x, list, set)}
                style={[s.subject, list.includes(x) && s.subjectOn]}
              >
                <Text
                  style={[
                    s.subjectText,
                    list.includes(x) && { color: C.white },
                  ]}
                >
                  {x}
                </Text>
                <Text
                  style={[
                    s.subjectPlus,
                    list.includes(x) && { color: C.white },
                  ]}
                >
                  {list.includes(x) ? "✓" : "+"}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Page>
    );
  }
  if (screen === "priorities") {
    const allocated = Object.values(decisionPriorities).reduce(
      (sum, points) => sum + points,
      0,
    );
    return (
      <Page
        footer={
          <PrimaryButton
            disabled={allocated !== 100}
            label="Build my shortlist"
            onPress={() => {
              dispatch(sessionActions.setupCompletedSet(true));
              go("reveal");
            }}
          />
        }
      >
        <Header
          step={8}
          total={8}
          onBack={() => go("enjoy")}
          onExit={() => go("cover")}
        />
        <ScrollView contentContainerStyle={s.onboard}>
          <Intro
            eyebrow="SPEND YOUR 100 POINTS"
            title="What actually matters to you?"
            body="There is no perfect major. Spend your points on the tradeoffs you care about most right now."
          />
          <PriorityAllocator
            value={decisionPriorities}
            onChange={setDecisionPriorities}
          />
        </ScrollView>
      </Page>
    );
  }
  if (screen === "profile")
    return (
      <ProfileQuestion
        index={profileAt}
        answer={profileAnswers[profileQuestions[profileAt].id]}
        onBack={() => {
          if (profileAt === 0) go("discovery");
          else setProfileAt(profileAt - 1);
        }}
        onExit={() => go("discovery")}
        onAnswer={(answer: string) => {
          const id = profileQuestions[profileAt].id;
          setProfileAnswers((v) => ({ ...v, [id]: answer }));
        }}
        onContinue={() => {
          if (profileAt === profileQuestions.length - 1) {
            setBranchAt(0);
            go(branchQuestions.length ? "subjectBranch" : "reveal");
          } else setProfileAt(profileAt + 1);
        }}
      />
    );
  if (screen === "subjectBranch") {
    const question = branchQuestions[branchAt];
    return (
      <SubjectBranchQuestion
        question={question}
        index={branchAt}
        total={branchQuestions.length}
        answer={subjectAnswers[question.id]}
        patternCue={patternCue}
        onExit={() => go("discovery")}
        onBack={() => {
          if (branchAt === 0) {
            setProfileAt(profileQuestions.length - 1);
            go("profile");
          } else setBranchAt((v) => v - 1);
        }}
        onAnswer={(answer: string) => {
          setSubjectAnswers((v) => ({ ...v, [question.id]: answer }));
        }}
        onContinue={() => {
          if (branchAt === branchQuestions.length - 1) go("reveal");
          else setBranchAt(branchAt + 1);
        }}
      />
    );
  }
  if (screen === "blind")
    return (
      <Page
        dark
        footer={
          <PrimaryButton
            lightMode
            label="Hide the labels"
            onPress={() => {
              light();
              setChallenge(
                Math.max(
                  0,
                  discoveryChallengeIds.findIndex(
                    (id) => !challengeOutcomes[id],
                  ),
                ),
              );
              go("challenge");
            }}
          />
        }
      >
        <Header
          step={10}
          total={10}
          dark
          onExit={() => go("discovery")}
          onBack={() => {
            go("discovery");
          }}
        />
        <View style={s.blindCenter}>
          <Text style={s.blindSmall}>For the next few minutes</Text>
          <Text style={s.blindTitle}>Forget what{`\n`}you picked.</Text>
          <Text style={s.blindBody}>
            We won't tell you what you're studying. Choose whatever makes you
            want to keep going.
          </Text>
          <View style={s.blindStamp}>
            <Text style={s.blindStampText}>Labels off</Text>
          </View>
        </View>
      </Page>
    );
  if (screen === "challenge") {
    const done = (
      challengeId: string,
      outcomeId: string,
      additionalOutcomes: Record<string, string> = {},
    ) => {
      medium();
      setChallengeOutcomes((v) => ({
        ...v,
        [challengeId]: outcomeId,
        ...additionalOutcomes,
      }));
      if (challenge === challengeInfo.length - 1) go("complete");
      else setChallenge(challenge + 1);
    };
    return (
      <ChallengeShell
        key={challenge}
        index={challenge}
        onExit={() => go("discovery")}
        onBack={() =>
          challenge > 0 ? setChallenge(challenge - 1) : go("blind")
        }
      >
        {challenge === 0 ? (
          <PriceChallenge done={done} />
        ) : challenge === 1 ? (
          <FlowChallenge done={done} />
        ) : challenge === 2 ? (
          <MemoryChallenge done={done} />
        ) : challenge === 3 ? (
          <CritiqueChallenge done={done} />
        ) : challenge === 4 ? (
          <CuriosityChallenge done={done} />
        ) : (
          <ClassroomChallenge done={done} />
        )}
      </ChallengeShell>
    );
  }
  if (screen === "complete")
    return (
      <Page
        dark
        footer={
          <PrimaryButton
            lightMode
            label="Okay, show me"
            onPress={() => go("reveal")}
          />
        }
      >
        <Header dark />
        <View style={s.complete}>
          <Image
            accessible={false}
            resizeMode="contain"
            source={scoutGuideImage}
            style={s.completeScout}
          />
          <Text style={s.completeCount}>
            {challengeInfo.length} / {challengeInfo.length} Complete
          </Text>
          <Text style={s.completeTitle}>Ready to see{`\n`}what you chose?</Text>
          <Text style={s.completeBody}>
            The labels come back now. Your assumptions don't get to lead.
          </Text>
        </View>
      </Page>
    );
  if (screen === "reveal")
    return (
      <Reveal
        go={go}
        results={shownResults}
        declared={priorMajors}
        evidenceSummary={`This list uses ${evidenceSummary || "the clues collected so far"}. It's a starting hypothesis, not an ability score.`}
        onSharpen={() => go("discovery")}
        onStart={startFieldwork}
        onOpen={(majorId: string) => {
          setSelectedMajorId(majorId);
          setDetailReturn("reveal");
          analytics.track({
            name: "result_opened",
            payload: {
              campusId: selectedSchool.id,
              majorId,
              rank: Math.max(
                1,
                shownResults.findIndex((result) => result.id === majorId) + 1,
              ),
              origin: "reveal",
            },
          });
        }}
      />
    );
  if (screen === "major")
    return (
      <MajorDetail
        key={focusResult.id}
        go={go}
        onBack={() => go(detailReturn)}
        onStart={startFieldwork}
        focus={focusResult}
        school={selectedSchool}
        pattern={pattern}
      />
    );
  if (screen === "day")
    return (
      <Tuesday
        key={focusResult?.id}
        go={(next: Screen) =>
          next === "tabs" ? startFieldwork(focusResult.id) : go(next)
        }
        focus={focusResult}
        program={selectedSchool.catalog.programs.find(
          (program) => program.id === focusResult?.id,
        )}
      />
    );
  if (screen === "trade")
    return (
      <Trade
        go={(next: Screen) =>
          next === "tabs" ? startFieldwork(focusResult.id) : go(next)
        }
        focus={focusResult}
      />
    );
  return (
    <Tabs
      strengths={strengths}
      enjoy={enjoy}
      profileAnswers={profileAnswers}
      pattern={pattern}
      readiness={readiness}
      clubFits={clubFits}
      clubs={schoolClubs}
      results={shownResults}
      session={session}
      dispatch={dispatch}
      school={selectedSchool}
      saveStatus={saveStatus}
      admittedProgram={admittedProgram}
      admittedLikes={admittedLikes}
      admittedLikeNote={admittedLikeNote}
      consideredMajors={consideredMajors}
      noOtherMajorsYet={noOtherMajorsYet}
      requestedMission={requestedMission}
      onMissionOpened={() => setRequestedMission(null)}
      onSharpen={() => go("discovery")}
      onEditProfile={() => go("editInterests")}
      onOpen={openProgram}
      onStart={startFieldwork}
      initialTab={returnTab}
      beliefMap={beliefMap}
      campusActions={campusActions}
      stories={stories}
      timelineEntries={timelineEntries}
      onShareAdvisor={shareAdvisorBrief}
      onExportData={exportUserData}
      onReset={confirmReset}
      decisionPriorities={decisionPriorities}
    />
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Main />
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  textAction: { minHeight: 44, justifyContent: "center", paddingVertical: 10 },
  textActionLabel: { color: C.cobalt, fontSize: 15, fontWeight: "600" },
  page: { flex: 1, backgroundColor: C.bg },
  hydrationCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  hydrationText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
  },
  darkPage: { backgroundColor: C.ink },
  top: {
    height: 64,
    marginHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  wordmark: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.ink,
  },
  guideRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  guideRowCompact: { marginBottom: 12 },
  guideAvatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: C.tint,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  guideAvatarCompact: { width: 58, height: 58, borderRadius: 12 },
  guideAvatarImage: { width: 72, height: 72, marginTop: 6 },
  guideAvatarImageCompact: { width: 66, height: 66 },
  guideBubble: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  guideName: {
    color: C.teal,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  guideMessage: {
    color: C.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 3,
  },
  celebrationPage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 24,
    backgroundColor: C.bg,
    overflow: "hidden",
  },
  celebrationBit: {
    position: "absolute",
    width: 12,
    height: 24,
    borderRadius: 4,
  },
  celebrationScout: { width: 230, height: 230, marginBottom: 2 },
  celebrationKicker: {
    color: C.teal,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  celebrationTitle: {
    color: C.ink,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -1.5,
    marginTop: 8,
  },
  celebrationMission: {
    color: C.muted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 7,
    maxWidth: 320,
  },
  celebrationReward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF4CE",
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F2D66F",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 18,
  },
  celebrationRewardIcon: { color: C.orange, fontSize: 18, fontWeight: "700" },
  celebrationRewardText: {
    color: "#85620A",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  celebrationInsight: {
    color: C.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 18,
    maxWidth: 320,
  },
  celebrationAction: { alignSelf: "stretch", marginTop: 22 },
  back: { fontSize: 16, fontWeight: "700", minWidth: 70, color: C.ink },
  micro: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    color: C.muted,
  },
  progressTrack: {
    height: 10,
    flex: 1,
    backgroundColor: C.line,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: { height: 10, backgroundColor: C.teal, borderRadius: 999 },
  footer: { padding: 16, paddingHorizontal: 24, backgroundColor: C.bg },
  buttonEdge: {
    borderRadius: 12,
    overflow: "hidden",
  },
  button: {
    minHeight: 52,
    backgroundColor: C.cobalt,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  buttonText: {
    color: C.white,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  buttonArrow: { color: C.white, fontSize: 23, fontWeight: "700" },
  card: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  cardSelected: { backgroundColor: C.cobalt, borderColor: C.cobalt },
  eyebrow: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
    color: C.muted,
    marginBottom: 10,
  },
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    letterSpacing: -0.7,
    color: C.ink,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    color: C.muted,
    marginTop: 8,
    maxWidth: 340,
  },
  profileScroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  questionProgress: {
    height: 4,
    backgroundColor: C.line,
    marginBottom: 8,
    borderRadius: 2,
  },
  questionProgressFill: {
    height: 4,
    backgroundColor: C.orange,
    borderRadius: 2,
  },
  questionCount: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
    marginBottom: 16,
  },
  questionChoices: { gap: 8 },
  profileChoice: {
    minHeight: 70,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileChoiceTitle: { fontSize: 17, fontWeight: "700", color: C.ink },
  profileChoiceBody: {
    fontSize: 13,
    lineHeight: 18,
    color: C.muted,
    marginTop: 3,
  },
  profileChoiceArrow: { fontSize: 20, fontWeight: "700", color: C.muted },
  cover: { justifyContent: "center", paddingHorizontal: 24, paddingBottom: 40 },
  coverMascotWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  coverMascot: {
    width: 92,
    height: 92,
    borderRadius: 12,
    backgroundColor: C.tint,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverMascotImage: { width: 104, height: 104, marginTop: 8 },
  coverMascotBubble: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 14,
  },
  coverMascotCopy: {
    color: C.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  freshmanBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6EDFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 22,
  },
  freshmanBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.cobalt,
  },
  coverKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.orange,
    marginBottom: 20,
  },
  coverTitle: {
    fontSize: 48,
    lineHeight: 50,
    fontWeight: "700",
    letterSpacing: -2.5,
    color: C.ink,
  },
  coverBody: {
    fontSize: 18,
    lineHeight: 27,
    color: "#4E5650",
    marginTop: 22,
    maxWidth: 345,
  },
  coverPromises: { marginTop: 30, borderTopWidth: 1, borderTopColor: C.line },
  coverPromise: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  coverPromiseNum: {
    width: 38,
    fontSize: 17,
    fontWeight: "700",
    color: C.orange,
  },
  coverPromiseText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.ink,
  },
  coverRule: {
    height: 1,
    backgroundColor: C.ink,
    marginTop: 28,
    marginBottom: 13,
  },
  coverCaption: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  onboard: { padding: 24, paddingBottom: 40 },
  searchText: { fontSize: 16, fontWeight: "700", color: C.ink },
  schoolCard: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  schoolM: {
    width: 48,
    height: 48,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#FFCB05",
    color: "#00274C",
    fontSize: 28,
    fontWeight: "700",
  },
  schoolName: { fontWeight: "700", fontSize: 16 },
  schoolPlace: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    color: C.muted,
    marginTop: 4,
  },
  schoolCheck: { marginLeft: "auto", color: C.white, fontSize: 18 },
  prototypeNote: {
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
    marginTop: 14,
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
  count: { fontSize: 12, fontWeight: "700" },
  subjectGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  subject: {
    width: "48%",
    minHeight: 88,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 12,
    padding: 14,
    justifyContent: "space-between",
    backgroundColor: C.white,
  },
  subjectOn: { backgroundColor: C.cobalt, borderColor: C.cobalt },
  subjectText: {
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 19,
    color: C.ink,
  },
  subjectPlus: {
    fontSize: 18,
    color: C.muted,
    fontWeight: "600",
    alignSelf: "flex-end",
  },
  blindCenter: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  blindSmall: {
    color: "#9F9F99",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 20,
  },
  blindTitle: {
    fontSize: 55,
    lineHeight: 56,
    color: "#F4F3ED",
    fontWeight: "700",
    letterSpacing: -2.4,
  },
  blindBody: {
    fontSize: 18,
    lineHeight: 27,
    color: "#B3B3AD",
    marginTop: 24,
    maxWidth: 340,
  },
  blindStamp: {
    borderWidth: 1,
    borderColor: "#777772",
    padding: 10,
    alignSelf: "flex-start",
    marginTop: 38,
    transform: [{ rotate: "-3deg" }],
  },
  blindStampText: { color: "#A7A7A1", fontWeight: "700", letterSpacing: 0.3 },
  challengeScroll: { padding: 24, paddingBottom: 48 },
  challengeKicker: {
    color: "#9E9E98",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 39,
    lineHeight: 41,
    fontWeight: "700",
    letterSpacing: -1.2,
    color: "#F7F6F0",
  },
  challengeBody: {
    fontSize: 16,
    lineHeight: 23,
    color: "#AAA9A3",
    marginTop: 10,
    marginBottom: 26,
  },
  simCard: { backgroundColor: "#F5F4ED", borderRadius: 4, padding: 20 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  price: { fontSize: 52, fontWeight: "700", letterSpacing: -2, color: C.ink },
  priceNote: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
    marginTop: 10,
  },
  metrics: {
    flexDirection: "row",
    gap: 50,
    borderTopWidth: 1,
    borderTopColor: "#C9C8C1",
    marginTop: 18,
    paddingTop: 18,
  },
  metricValue: { fontSize: 22, fontWeight: "700", color: C.ink },
  metricLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
    marginTop: 3,
  },
  slider: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#96958F",
  },
  tick: {
    flex: 1,
    height: 42,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  tickDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#96958F",
    marginBottom: -5,
  },
  tickDotActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.ink,
    marginBottom: -12,
    borderWidth: 4,
    borderColor: C.white,
  },
  range: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  darkMicro: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
  },
  prompt: { color: "#F5F4ED", fontSize: 17, fontWeight: "700", marginTop: 4 },
  darkChoice: {
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: "#5D5D59",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  darkChoiceSelected: { backgroundColor: "#F3F2EC", borderColor: "#F3F2EC" },
  darkChoiceText: {
    color: "#D2D1CB",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  choiceCircle: { fontSize: 12, color: "transparent" },
  feedback: {
    backgroundColor: "#343431",
    padding: 18,
    borderLeftWidth: 3,
    borderLeftColor: "#F4F3ED",
    marginTop: 8,
    gap: 14,
  },
  feedbackLabel: {
    color: "#9D9C96",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  feedbackText: {
    color: "#F5F4ED",
    fontSize: 19,
    lineHeight: 27,
    fontWeight: "700",
  },
  constellation: {
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#50504D",
    overflow: "hidden",
  },
  constellationLineOne: {
    position: "absolute",
    width: 320,
    height: 1,
    backgroundColor: "#4C4C48",
    top: 94,
    left: 12,
    transform: [{ rotate: "18deg" }],
  },
  constellationLineTwo: {
    position: "absolute",
    width: 260,
    height: 1,
    backgroundColor: "#4C4C48",
    top: 178,
    left: 42,
    transform: [{ rotate: "-24deg" }],
  },
  curiosityNode: {
    width: "48%",
    minHeight: 112,
    borderRadius: 56,
    borderWidth: 1.5,
    borderColor: "#777772",
    backgroundColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  curiosityNodeWide: { width: "100%", minHeight: 92 },
  curiosityNodeSelected: {
    backgroundColor: "#F5F4ED",
    borderColor: "#F5F4ED",
  },
  curiositySymbol: {
    color: "#F5F4ED",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
  },
  curiosityTitle: {
    color: "#C8C7C1",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginTop: 7,
    textAlign: "center",
  },
  clueCard: {
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
    backgroundColor: "#30302D",
    padding: 18,
  },
  clueText: {
    color: "#F5F4ED",
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "600",
    marginTop: 10,
  },
  cluePrompt: {
    color: "#AAA9A3",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  roomGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  roomCard: {
    width: "48%",
    minHeight: 160,
    borderWidth: 1.5,
    borderColor: "#666661",
    padding: 16,
    justifyContent: "flex-end",
  },
  roomCardWide: { width: "100%", minHeight: 132 },
  roomCardSelected: {
    backgroundColor: "#F5F4ED",
    borderColor: "#F5F4ED",
  },
  roomSymbol: {
    color: "#F5F4ED",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "700",
    marginBottom: "auto",
  },
  roomTitle: {
    color: "#F5F4ED",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  roomScene: {
    color: "#AAA9A3",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  flowCard: {
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#50504D",
  },
  flowNode: {
    width: "88%",
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: "#787873",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  flowSelected: { backgroundColor: "#F5F4ED", borderColor: "#F5F4ED" },
  flowText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: "#D0CFC9",
  },
  retry: { fontSize: 12, color: C.muted, marginTop: 3 },
  flowArrow: { color: "#777772", fontSize: 18 },
  memoryReady: { minHeight: 420, justifyContent: "center", gap: 20 },
  bigFive: {
    fontSize: 100,
    fontWeight: "700",
    color: C.white,
    lineHeight: 105,
  },
  darkLead: { fontSize: 20, color: "#BBBAB4" },
  wordStage: { height: 420, alignItems: "center", justifyContent: "center" },
  flashWord: {
    fontSize: 46,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.white,
  },
  miniProgress: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    height: 3,
    backgroundColor: "#4B4B48",
  },
  wordGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  wordChip: {
    width: "47%",
    height: 52,
    borderWidth: 1.5,
    borderColor: "#777772",
    alignItems: "center",
    justifyContent: "center",
  },
  wordChipText: {
    color: "#E3E2DC",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  badUi: { backgroundColor: "#E7E6DF", paddingBottom: 16 },
  browserBar: {
    height: 26,
    backgroundColor: "#CAC9C2",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#888780" },
  badTitle: {
    fontSize: 18,
    fontWeight: "700",
    padding: 14,
    paddingBottom: 5,
    color: C.ink,
  },
  badCopy: {
    fontSize: 12,
    lineHeight: 14,
    color: C.muted,
    paddingHorizontal: 14,
  },
  warning: { margin: 14, padding: 10, backgroundColor: "#D5D4CD" },
  warningText: { fontSize: 12, fontWeight: "700", color: C.ink },
  badRow: { flexDirection: "row", gap: 8, paddingHorizontal: 14 },
  badBox: {
    flex: 1,
    minHeight: 124,
    backgroundColor: "#F7F6EF",
    borderWidth: 1,
    borderColor: "#CECDC6",
    padding: 10,
  },
  badSelected: { borderColor: C.ink, borderWidth: 3 },
  badSmall: { fontSize: 12, lineHeight: 16, fontWeight: "600", color: C.muted },
  fakeButton: { backgroundColor: "#888780", padding: 8, marginTop: "auto" },
  fakeButtonText: {
    fontSize: 12,
    color: C.white,
    fontWeight: "700",
    textAlign: "center",
  },
  complete: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  completeScout: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 14,
  },
  completeCount: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: "#969690",
    marginBottom: 18,
  },
  completeTitle: {
    fontSize: 50,
    lineHeight: 52,
    fontWeight: "700",
    letterSpacing: -2,
    color: C.white,
  },
  completeBody: {
    fontSize: 17,
    lineHeight: 25,
    color: "#AAA9A3",
    marginTop: 22,
    maxWidth: 330,
  },
  revealScroll: { padding: 24, paddingBottom: 50 },
  revealEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.orange,
    marginTop: 20,
    marginBottom: 15,
  },
  revealTitle: {
    fontSize: 52,
    lineHeight: 52,
    fontWeight: "700",
    letterSpacing: -2.4,
    color: C.ink,
  },
  revealLead: { fontSize: 17, color: C.muted, marginTop: 14, marginBottom: 28 },
  leadResultCard: {
    padding: 22,
    borderWidth: 0,
    marginBottom: 18,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 6,
  },
  leadResultTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leadResultBadge: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  leadResultBadgeText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  leadResultRank: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 14,
    fontWeight: "700",
  },
  leadResultName: {
    color: C.white,
    fontSize: 38,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -1.4,
    marginTop: 28,
  },
  leadMajorLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginTop: 24,
  },
  leadMajorName: {
    color: C.white,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "700",
    marginTop: 5,
  },
  leadResultWhy: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },
  leadSignalRow: { gap: 8, marginTop: 18 },
  leadSignalChip: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.24)",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leadSignalText: {
    color: C.white,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  leadResultAction: {
    borderTopColor: "rgba(255,255,255,0.25)",
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 17,
  },
  leadResultActionText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  leadResultArrow: { color: C.white, fontSize: 22, fontWeight: "700" },
  choiceStory: {
    backgroundColor: C.ink,
    borderRadius: 12,
    padding: 18,
    marginBottom: 30,
  },
  choiceStoryKicker: {
    color: C.yellow,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  choiceStoryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  choiceStorySide: { flex: 1 },
  choiceStoryLabel: {
    color: "#9AA7BC",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 7,
  },
  choiceStoryValue: {
    color: C.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  choiceStoryArrow: { color: C.yellow, fontSize: 20, fontWeight: "700" },
  choiceStoryFoot: {
    color: "#AEB8C9",
    fontSize: 12,
    lineHeight: 16,
    borderTopColor: "#435069",
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 14,
  },
  alsoHeader: { marginBottom: 14 },
  alsoTitle: {
    color: C.ink,
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  alsoBody: { color: C.muted, fontSize: 13, marginTop: 4 },
  resultCard: { padding: 18, marginBottom: 14, borderTopWidth: 6 },
  resultTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultRank: { fontSize: 12, fontWeight: "700" },
  resultLevel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
  },
  resultName: {
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginTop: 18,
  },
  resultWhy: { fontSize: 15, lineHeight: 22, color: "#55554F", marginTop: 10 },
  receiptStack: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.line,
    gap: 8,
  },
  detailReceiptStack: { marginTop: 16, gap: 8 },
  receiptHeading: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
    marginBottom: 2,
  },
  receiptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F5F1E9",
    borderRadius: 10,
    padding: 11,
  },
  receiptNumber: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: C.orange,
  },
  receiptText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: C.ink,
  },
  open: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3, marginTop: 18 },
  contradiction: {
    backgroundColor: "#F1CB49",
    padding: 20,
    marginVertical: 12,
    marginBottom: 20,
  },
  contraKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  contraTitle: { fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  contraBody: { fontSize: 15, lineHeight: 22, marginTop: 8 },
  detailScroll: { padding: 24, paddingBottom: 46 },
  fieldNoteContext: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 12,
  },
  fieldNoteContextTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "700",
    letterSpacing: -1.2,
    color: C.ink,
  },
  detailTitle: {
    fontSize: 58,
    fontWeight: "700",
    letterSpacing: -2.5,
    color: C.ink,
  },
  detailSubtitle: {
    fontSize: 19,
    lineHeight: 28,
    color: C.muted,
    marginTop: 12,
    marginBottom: 28,
  },
  section: {
    borderTopWidth: 2,
    borderTopColor: C.ink,
    paddingTop: 12,
    paddingBottom: 26,
  },
  sectionNum: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.orange,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionBody: { fontSize: 16, lineHeight: 24, color: "#50504B" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: C.ink,
    color: C.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: "600",
    fontSize: 12,
  },
  info: { borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 14 },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
    marginBottom: 5,
  },
  infoValue: { fontSize: 15, lineHeight: 21, fontWeight: "700" },
  hypothesisWrap: { marginBottom: 28 },
  pathHypothesisWrap: { marginBottom: 22 },
  resourceIntro: {
    fontSize: 14,
    lineHeight: 21,
    color: C.muted,
    marginBottom: 14,
  },
  resourceCard: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
  },
  resourceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  resourceType: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.orange,
  },
  resourceProvider: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
    textAlign: "right",
  },
  resourceTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
    color: C.ink,
    marginTop: 12,
  },
  resourceBody: {
    fontSize: 13,
    lineHeight: 19,
    color: C.muted,
    marginTop: 6,
  },
  dayWrap: { flex: 1, padding: 24 },
  dayKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.orange,
  },
  dayTitle: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1,
    marginTop: 5,
  },
  timeLine: { marginTop: 38, flexDirection: "row", alignItems: "center" },
  time: { fontSize: 30, fontWeight: "700", letterSpacing: -1 },
  timeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.orange,
    marginLeft: 14,
  },
  timeRule: { height: 2, backgroundColor: C.line, flex: 1 },
  place: { fontSize: 20, fontWeight: "700", marginTop: 22 },
  moment: { fontSize: 17, lineHeight: 26, color: "#54544F", marginTop: 10 },
  tradeOverline: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.orange,
  },
  tradeTitle: {
    fontSize: 50,
    lineHeight: 52,
    fontWeight: "700",
    letterSpacing: -2,
    marginTop: 14,
    marginBottom: 24,
  },
  tradeGrid: { gap: 8 },
  tradeHalf: { padding: 20, minHeight: 170 },
  tradeLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.white,
  },
  tradeCopy: {
    fontSize: 19,
    lineHeight: 27,
    fontWeight: "600",
    color: C.white,
    marginTop: 18,
  },
  tradeQuestion: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "700",
    marginVertical: 28,
  },
  saveStrip: {
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
  },
  saveStripText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  tabBar: {
    minHeight: 66,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
    backgroundColor: C.white,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabActive: {},
  tabIcon: { fontSize: 22, color: "#999993" },
  tabText: {
    fontSize: 12,
    fontWeight: "400",
    color: C.muted,
    marginTop: 5,
  },
  tabScroll: { padding: 24, paddingBottom: 48 },
  dailyBar: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  dailyStats: { flexDirection: "row", alignItems: "center", gap: 8 },
  dailyStat: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
  },
  dailyStatIcon: { fontSize: 15 },
  dailyStatValue: { color: C.orange, fontSize: 14, fontWeight: "700" },
  unitBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  unitEyebrow: {
    color: C.muted,
    fontSize: 14,
    fontWeight: "400",
  },
  unitTitle: {
    color: C.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 7,
  },
  unitBody: {
    color: C.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 7,
  },
  unitScore: {
    minWidth: 62,
    paddingTop: 4,
    alignItems: "flex-end",
  },
  unitScoreValue: {
    color: C.ink,
    fontSize: 20,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  unitScoreLabel: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  pathSectionLead: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    marginTop: -5,
    marginBottom: 16,
  },
  comparisonScroll: { paddingBottom: 40 },
  evidenceTrack: {
    height: 3,
    backgroundColor: C.line,
    marginTop: 0,
    marginHorizontal: 0,
    marginBottom: 24,
    borderRadius: 999,
    overflow: "hidden",
  },
  evidenceFill: { height: 3, backgroundColor: C.cobalt, borderRadius: 999 },
  mission: {
    flexDirection: "row",
    gap: 14,
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  missionLeft: { alignSelf: "flex-start" },
  missionRight: { alignSelf: "flex-end" },
  missionDone: { borderColor: "#9ADCCB", backgroundColor: "#F0FBF7" },
  missionNext: { borderColor: C.cobalt, backgroundColor: C.tint },
  missionNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  missionPhase: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  missionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    color: C.ink,
    marginTop: 4,
  },
  missionBody: { fontSize: 13, lineHeight: 18, color: C.muted, marginTop: 5 },
  missionTime: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
    marginTop: 10,
  },
  reflectionCard: {
    marginTop: -4,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.tint,
    borderWidth: 1,
    borderColor: "#B8D5CE",
  },
  reflectionScoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  reflectionScout: { width: 82, height: 82 },
  reflectionKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  reflectionTitle: { fontSize: 21, fontWeight: "700", marginTop: 8 },
  reflectionBody: {
    fontSize: 13,
    lineHeight: 19,
    color: C.muted,
    marginTop: 6,
  },
  reflectionQuestion: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.ink,
    marginTop: 4,
  },
  reflectionNoteInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#B8D5CE",
    borderRadius: 12,
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    lineHeight: 19,
    color: C.ink,
    textAlignVertical: "top",
    marginBottom: 14,
  },
  energyRow: { flexDirection: "row", gap: 7, marginVertical: 16 },
  energyChoice: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.teal,
    borderRadius: 10,
    backgroundColor: C.white,
  },
  energyChoiceSelected: { backgroundColor: C.teal },
  energyChoiceText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  removeEvidence: { alignItems: "center", paddingVertical: 14 },
  removeEvidenceText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.orange,
  },
  listHeading: {
    fontSize: 18,
    fontWeight: "600",
    color: C.ink,
    marginTop: 28,
    marginBottom: 12,
  },
  shortCard: {
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingVertical: 14,
    marginBottom: 8,
  },
  shortName: { fontSize: 16, fontWeight: "700" },
  shortLevel: { fontSize: 12, fontWeight: "600", color: C.muted, marginTop: 4 },
  emptyShortlist: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: C.tint,
    gap: 10,
  },
  emptyShortlistKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.orange,
  },
  emptyShortlistTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "700",
    color: C.ink,
    marginTop: 7,
  },
  emptyShortlistBody: {
    fontSize: 15,
    lineHeight: 22,
    color: C.muted,
    marginTop: 5,
  },
  searchInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.ink,
    backgroundColor: C.white,
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
    marginTop: 24,
    marginBottom: 9,
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
  catalogRow: {
    minHeight: 76,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    flexDirection: "row",
    alignItems: "center",
  },
  catalogName: { fontSize: 15, fontWeight: "600" },
  catalogMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
    marginTop: 4,
  },
  catalogNote: {
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
    marginTop: -14,
    marginBottom: 14,
  },
  add: {
    width: 32,
    height: 32,
    borderRadius: 16,
    color: C.cobalt,
    backgroundColor: C.tint,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    lineHeight: 30,
    fontWeight: "600",
  },
  clubCard: { padding: 17, marginBottom: 12, borderRadius: 12 },
  campusCard: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#E9F3EF",
    borderWidth: 1.5,
    borderColor: "#BFD8CF",
  },
  campusCardKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  campusCardTitle: {
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 10,
  },
  campusCardBody: {
    fontSize: 14,
    lineHeight: 21,
    color: C.muted,
    marginTop: 8,
  },
  clubTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clubRank: { fontSize: 12, fontWeight: "700", color: C.orange },
  clubAccess: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  clubName: {
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 14,
  },
  clubDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: C.muted,
    marginTop: 7,
  },
  clubIntelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },
  clubIntelPill: {
    fontSize: 12,
    fontWeight: "700",
    color: C.teal,
    backgroundColor: "#E8F4F0",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  clubTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  clubTag: {
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "#ECEAE2",
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: "#4E4E49",
  },
  clubWhy: {
    fontSize: 13,
    lineHeight: 19,
    color: C.ink,
    borderTopWidth: 1,
    borderTopColor: C.line,
    marginTop: 14,
    paddingTop: 12,
  },
  clubFreshness: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    color: C.muted,
    marginTop: 12,
  },
  actionCard: { padding: 17, marginBottom: 12, borderRadius: 12 },
  actionTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  actionKind: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  actionEffort: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.muted,
  },
  actionTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "700",
    marginTop: 13,
  },
  actionDetail: { fontSize: 14, lineHeight: 20, color: C.muted, marginTop: 7 },
  storyCard: {
    backgroundColor: "#F2ECDD",
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DDD1B8",
  },
  storyLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.orange,
  },
  storyTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    marginTop: 10,
  },
  storyStarting: { fontSize: 13, lineHeight: 19, color: C.muted, marginTop: 7 },
  storyExperiment: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
    color: C.teal,
    marginTop: 13,
  },
  storyBody: { fontSize: 14, lineHeight: 21, color: C.ink, marginTop: 8 },
  storyTakeaway: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    borderTopWidth: 1,
    borderTopColor: "#D6C9AE",
    marginTop: 13,
    paddingTop: 11,
  },
  beliefCard: {
    paddingVertical: 16,
    marginBottom: 22,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  beliefKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.cobalt,
  },
  beliefTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "700",
    marginTop: 9,
  },
  beliefRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 12,
    marginTop: 12,
  },
  beliefLabel: { fontSize: 14, fontWeight: "700", color: C.ink },
  beliefExplanation: {
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
    marginTop: 4,
  },
  beliefStatus: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
    maxWidth: 95,
    textAlign: "right",
  },
  beliefDisclaimer: {
    fontSize: 12,
    lineHeight: 17,
    color: C.muted,
    marginTop: 14,
  },
  readinessCard: {
    backgroundColor: C.cobalt,
    padding: 18,
    marginBottom: 22,
    borderRadius: 12,
  },
  readinessLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.white,
  },
  readinessTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.white,
    marginTop: 9,
  },
  readinessBody: {
    fontSize: 14,
    lineHeight: 20,
    color: C.white,
    marginTop: 7,
  },
  modeRow: {
    flexDirection: "row",
    gap: 18,
    borderTopWidth: 2,
    borderTopColor: C.ink,
    paddingVertical: 16,
  },
  modeNum: { fontSize: 12, fontWeight: "700", color: C.orange },
  modeTitle: { fontSize: 18, fontWeight: "700" },
  modeBody: { fontSize: 14, lineHeight: 20, color: C.muted, marginTop: 5 },
  modeTrack: { height: 4, backgroundColor: C.line, marginTop: 10 },
  modeFill: { height: 4, backgroundColor: C.orange },
  youContra: {
    backgroundColor: "#F1CB49",
    padding: 20,
    marginTop: 22,
    borderRadius: 12,
  },
  timelineWrap: {
    borderTopWidth: 2,
    borderTopColor: C.ink,
    marginTop: 26,
    paddingTop: 24,
  },
  privacyToggle: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 8,
  },
  privacyToggleLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: C.ink,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    backgroundColor: C.line,
  },
  toggleTrackOn: { backgroundColor: C.teal },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.white,
  },
  toggleThumbOn: { alignSelf: "flex-end" },
  coachCard: {
    paddingVertical: 16,
    gap: 10,
  },
  coachTitle: { fontSize: 18, lineHeight: 24, fontWeight: "700", color: C.ink },
  coachSummary: { fontSize: 14, lineHeight: 21, color: C.muted },
  coachQuestion: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: C.ink,
  },
  coachSource: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  privacyCard: {
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingVertical: 20,
    marginTop: 20,
    gap: 10,
  },
  privacyBody: { fontSize: 13, lineHeight: 19, color: C.muted },
  resetButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: C.orange,
  },
  subjectBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F6F2",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    marginBottom: 12,
  },
  subjectBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  branchChoice: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  branchChoiceText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
    color: C.ink,
    flex: 1,
  },
  notGradeCard: {
    backgroundColor: "#F1CB49",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  notGradeTitle: { fontSize: 16, fontWeight: "700", color: C.ink },
  notGradeBody: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4D4938",
    marginTop: 5,
  },
  exitSetup: {
    minWidth: 76,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.cobalt,
  },
  setupPromise: {
    backgroundColor: C.tint,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  setupPromiseTitle: { fontSize: 15, fontWeight: "700", color: C.ink },
  setupPromiseBody: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: C.muted,
  },
  priorityPool: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.ink,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  priorityPoolLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: "#D9DEEA",
  },
  priorityPoolValue: { fontSize: 26, fontWeight: "700", color: C.yellow },
  priorityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.white,
  },
  priorityLabel: { fontSize: 15, fontWeight: "700", color: C.ink },
  priorityDetail: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 15,
    color: C.muted,
  },
  priorityControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  priorityStep: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: C.tint,
  },
  priorityStepText: { fontSize: 20, fontWeight: "700", color: C.cobalt },
  priorityValue: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: C.ink,
  },
  programPreview: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.tint,
  },
  programPreviewLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.cobalt,
  },
  programPreviewNames: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: C.ink,
  },
  semesterCard: {
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingVertical: 24,
    marginBottom: 22,
  },
  semesterTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  semesterKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  semesterTitle: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "700",
    color: C.ink,
  },
  semesterBadge: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.cobalt,
    backgroundColor: C.tint,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },
  semesterSlot: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 14,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  semesterSlotNum: { fontSize: 12, fontWeight: "700", color: C.orange },
  semesterSlotTitle: { fontSize: 14, fontWeight: "700", color: C.ink },
  semesterSlotPurpose: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 21,
    color: C.muted,
  },
  semesterSlotCredits: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.teal,
  },
  semesterDisclaimer: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
  },
  lensCard: {
    marginTop: 14,
    marginBottom: 18,
    padding: 18,
    borderRadius: 12,
    backgroundColor: C.tint,
  },
  lensKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.cobalt,
  },
  lensTitle: { marginTop: 6, fontSize: 18, fontWeight: "700", color: C.ink },
  lensBody: { marginTop: 5, fontSize: 12, lineHeight: 18, color: C.muted },
  lensChips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  lensChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.white,
    fontSize: 12,
    fontWeight: "700",
    color: C.ink,
  },
});
