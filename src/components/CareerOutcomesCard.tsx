import { colors as C } from "../design/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { openResource } from "../features/resources/openResource";
import type { CareerOutcome } from "../domain/careerOutcomes";

type CareerOutcomesCardProps = {
  outcome: CareerOutcome;
  schoolName: string;
};

const money = (amount: number) =>
  `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export function CareerOutcomesCard({
  outcome,
  schoolName,
}: CareerOutcomesCardProps) {
  const primary =
    outcome.earnings.figures.find((figure) => figure.statistic === "median") ??
    outcome.earnings.figures[0];
  const national = outcome.scope === "national_family";
  const payLabel =
    outcome.earnings.period === "starting_salary"
      ? "reported starting salary"
      : outcome.earnings.period === "annualized_internship"
        ? "annualized internship pay"
        : "annual wage across career stages";
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>
        {national ? "NATIONAL CONTEXT" : "SCHOOL-REPORTED OUTCOMES"}
      </Text>
      <Text style={styles.title}>Where this path can lead</Text>
      <Text style={styles.population}>{outcome.population}</Text>
      <View style={styles.paths}>
        {outcome.occupations.map((occupation) => (
          <Text key={occupation} style={styles.path}>
            {occupation}
          </Text>
        ))}
      </View>
      <View style={styles.salaryBox}>
        <Text style={styles.salary}>{money(primary.amount)}</Text>
        <Text style={styles.salaryLabel}>
          {primary.statistic.toUpperCase()} · {payLabel.toUpperCase()}
        </Text>
        <Text style={styles.meta}>
          {national
            ? `${outcome.cohortYear} DATA · U.S.`
            : `CLASS / REPORT YEAR ${outcome.cohortYear}`}
          {outcome.monthsAfterGraduation
            ? ` · ${outcome.monthsAfterGraduation} MONTHS AFTER GRADUATION`
            : ""}
        </Text>
        {outcome.earnings.figures
          .filter((figure) => figure !== primary)
          .map((figure) => (
            <Text key={figure.statistic} style={styles.detail}>
              {figure.statistic === "mean" ? "Mean" : "Median"}:{" "}
              {money(figure.amount)}
            </Text>
          ))}
        {outcome.earnings.range ? (
          <Text style={styles.detail}>
            Reported range: {money(outcome.earnings.range.low)}–
            {money(outcome.earnings.range.high)} (min–max)
          </Text>
        ) : null}
        {national ? (
          <Text style={styles.warning}>
            Not a starting salary or an outcome specific to {schoolName}{" "}
            graduates.
          </Text>
        ) : null}
      </View>
      <Text style={styles.sectionLabel}>Coverage matters</Text>
      <Text style={styles.body}>
        {outcome.coverage?.sampleSize
          ? `Salary sample: ${outcome.coverage.sampleSize}. `
          : ""}
        {outcome.coverage?.reportingRate !== undefined
          ? `${outcome.coverage.reportingRate}% reporting. `
          : ""}
        {outcome.coverage?.note ??
          "Sample size and reporting coverage are not provided in this record."}
      </Text>
      <Text style={styles.sectionLabel}>Example employers</Text>
      <Text style={styles.body}>
        {outcome.employers.length
          ? outcome.employers.join(" · ")
          : `School-major employer destinations are not curated for ${schoolName} yet. National wage data cannot tell us which employers hired its graduates.`}
      </Text>
      <Text style={styles.caveat}>
        {outcome.caveat} Some career paths require additional education,
        licensing, or experience.
      </Text>
      <Text style={styles.meta}>
        Source reviewed {outcome.source.reviewedOn}
      </Text>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open source: ${outcome.source.label}`}
        onPress={() => void openResource(outcome.source.url)}
        style={styles.source}
      >
        <Text style={styles.sourceText}>{outcome.source.label} ↗</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.cobalt,
  },
  title: { fontSize: 23, fontWeight: "700", color: C.ink, marginTop: 6 },
  population: { fontSize: 12, lineHeight: 18, color: C.muted, marginTop: 7 },
  paths: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  path: {
    backgroundColor: "#EEF0FF",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: "700",
    color: C.ink,
  },
  salaryBox: {
    backgroundColor: C.tint,
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
  },
  salary: { fontSize: 34, fontWeight: "700", color: C.ink },
  salaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
    letterSpacing: 0.3,
    color: "#137D65",
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    lineHeight: 13,
    fontWeight: "600",
    color: C.muted,
    marginTop: 7,
  },
  detail: { fontSize: 12, lineHeight: 18, color: C.ink, marginTop: 5 },
  warning: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: "#526071",
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: C.ink,
    marginTop: 18,
  },
  body: { fontSize: 12, lineHeight: 18, color: C.muted, marginTop: 6 },
  caveat: { fontSize: 12, lineHeight: 15, color: C.muted, marginTop: 18 },
  source: { minHeight: 44, justifyContent: "center", marginTop: 8 },
  sourceText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: C.cobalt,
  },
});
