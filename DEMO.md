# Interview walkthrough

## The pitch — 20 seconds

“Choosing a major is difficult when you only know the labels. UNLABELED helps incoming students compare the work behind two possibilities, try a small piece of it before college begins, and use that experience to decide what to explore next.”

## Prepare

1. Start Metro with `npm start -- --localhost --port 8081` for the installed simulator build. Leave that terminal running.
2. Open UNLABELED. Use Michigan for the deepest catalog.
3. Use an isolated demo device or simulator; don't clear a real student's notes for a presentation.
4. Keep the exported browser backup available if Simulator or Metro fails: `python3 -m http.server 8083 --bind 127.0.0.1 --directory dist`, then open `http://127.0.0.1:8083`. Build it first with `npx expo export --platform web --output-dir dist`. Screenshots are in `demo/`.

## Walkthrough — about 5 minutes

1. **Starting point.** Show the short setup: campus, admissions context, subjects enjoyed, and priorities. These are clues, not judgments about ability.
2. **Two possibilities.** In Browse, search for Economics and Psychology and save them. Tap Compare saved majors. Explain the difference in recurring tasks and what remains uncertain.
3. **Try the work.** Open Economics and start its work sample, or choose it from Home's field selector. The fictional notebook pop-up can be explored from home with paper; no university login is needed.
4. **Actually try a small part.** At $4: revenue $160, costs $110, profit $50. At $6: revenue $150, costs $80, profit $70. With 30% fewer buyers: profits are $26 and $40 respectively. Discuss the profit/access tradeoff and which demand assumption to test. Fractional expected buyers are an illustrative model, not literal sales.
5. **Reflect.** Start the mission, then choose “I tried it — reflect.” Record energy, curiosity, willingness to repeat, and whether the reaction came from the work or setting. Mark presenter answers as demonstration data in the optional note.
6. **See the consequence.** Save the reflection. Explain the before/after interest direction. A held ranking is a valid result; the app must not manufacture a change. Setting-related reactions are saved without changing rankings.
7. **Continue later.** Return to the plan, reopen the completed mission, then relaunch to demonstrate persistence. Switch to Psychology to show Economics progress is retained separately.

## Keep the claims honest

- Recommendations are hypotheses, not final decisions or validated aptitude assessments.
- Broad interest directions and specific university majors are different.
- Course and career information is sourced context, not a guarantee.
- The live demo makes no AI request and spends no OpenRouter credits.
- The current app is a prototype, not a production release.

## Submission checklist

- [ ] Final tested changes committed and pushed within the exercise window.
- [ ] Reviewer access confirmed. A pending invitation to `jonathanli12` needs identity confirmation.
- [ ] 30-minute walkthrough booked within two days of receiving the exercise.
- [ ] Demo device open, Metro healthy, and browser backup accessible.

Initial commit: August 30, 2026, 14:21:17 EDT. The 150-minute final-commit deadline is 16:51:17 EDT. Preserve real commit timestamps.
