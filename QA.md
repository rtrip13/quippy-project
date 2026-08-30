# Functional QA — August 30, 2026

Status: automated checks pass. The main native flows and failure guards were exercised on iPhone 16 Pro; remaining coverage limits are listed below. Earlier browser/iPhone 17 notes are retained as separate verification history.

## Fixes from this pass

- Storage read failures and invalid JSON no longer enable saving an empty session over existing progress. The restore screen explains the failure and offers Retry.
- Advisor briefs honor the admissions disclosure toggle in generated questions and tensions, not just the starting-point section.
- Redacted session exports also remove legacy declared-major admissions choices.
- Shared advisor text now includes fieldwork evidence and includes reflection notes only when explicitly enabled.
- Resource, career-source, and campus-club buttons catch native link-opening failures and show a recoverable alert.
- Comparison search explains an empty result instead of leaving a blank picker.
- Added missing text-action styles referenced by newly changed buttons, resolving the final type-check errors.

## Validation

- `npm test`: 88 tests pass, including existing scoring, school content, comparison, fieldwork, persistence, privacy, and advisor checks.
- New/extended regression cases reproduced three advisor/export failures before their fixes. Storage cases cover read rejection, retry recovery, malformed JSON, and a genuinely empty device.
- `npm run typecheck`: passes.
- `git diff --check`: passes.
- No dependencies added; pre-existing changes preserved.

## iPhone 16 Pro native verification

Device: iPhone 16 Pro simulator, iOS 26.5, app `com.rtrip13.unlabeled`. Continued from the existing Michigan session without resetting it. Simulator focus was checked before interactions because another run sometimes selected a different device.

Additional failures reproduced, fixed, and retested:

- Clearing the last comparison selection automatically restored saved programs. Explicit comparison edits now prevent automatic reseeding; clearing all selections stays empty.
- The memory challenge hid its next question until four words were selected, leaving users who recalled fewer words stuck. It now explains that zero recalled words is valid, exposes the follow-up question, and identifies word choices as checked/unchecked controls. Completed the challenge with zero words selected.
- The campus “Capture the signal” card did nothing. It now opens the event reflection form; opening and backing out does not mark the event complete. The form reminds users to reflect only on activities they actually tried.
- Editing a completed reflection replayed the new-clue celebration and claimed another ten points. Updates now go directly to the ranking explanation with “Clue updated”; the completed count remains unchanged.

| Area | Native checks and results |
| --- | --- |
| Navigation and focus | Home, Browse, Compare, Me; field search including no matches; switching Computing/Social focus preserves each field's progress. |
| Fieldwork | Start saves an in-progress mission without completing it; empty reflection cannot save; unsaved-edit warning and Keep editing preserve choices; saved setting-driven evidence does not alter rankings; review/update retains one completed mission; removal confirmation Cancel preserves evidence. |
| Browse and compare | Save two programs; compare saved programs; select three, fourth disabled; search with no matches; clear all comparison selections without changing saved programs. |
| Program details | Actuarial Mathematics Why/Test It/See Work/Outcomes; all three Tuesday moments; Next disabled before an answer; takeaway recap; handoff into the correct work sample. |
| Challenges | All six completed: price endpoints, ping retry, memory with zero recalled words, critique, curiosity, classroom. |
| Questionnaire | Revisited all eleven questions and three subject follow-ups; changed an answer; Save and exit; reopened and verified preservation; completed reveal and returned Home. |
| Priorities | Cannot exceed 100; 95-point allocation disables Save; reallocate to 100 and save; updated values appear in Me. |
| Privacy and dialogs | Admissions disclosure toggle; advisor summary opens native share sheet and can be dismissed; reset confirmation Cancel retains progress. No share destination selected. |
| Persistence | Terminated and relaunched this device's app; Open my plan remains available; saved programs, edited priorities, questionnaire choice, and fieldwork reflection survive. |

Remaining limits: fresh native onboarding and confirmed destructive reset/removal were not performed on iPhone 16 Pro. Storage failures are covered by automated regression tests, but storage/link failures were not injected into the native runtime. Full VoiceOver, keyboard permutations, every catalog entry/external destination, Android runtime, and a production binary remain unverified. No external messages were sent. Test answers, two saved programs, priority edits, and one demonstration reflection remain in this simulator session.

## Final interview-readiness verification

The consolidated app passes 88 tests, TypeScript checking, and production exports for iOS, Android, and web. A binary/text scan of all 35 exported files found no occurrence of the actual OpenRouter API key.

The web build was exercised through fresh Michigan onboarding, the incomplete-priority-allocation guard, saving Economics and Psychology, opening their comparison, Economics details, all three Tuesday steps, disabled Next before answering, back/answer preservation, the takeaway recap, and the handoff into the Economics work sample. A demonstration reflection saved successfully, moved Business & Economics from #2 to #1, and the completed mission and reflection remained available after reload.

The UI design pass separately checked all four main tabs at a phone-sized web viewport, comparison search and its empty state, and the three-major limit. Screenshots in `demo/` are browser captures, not native-device screenshots. The static browser backup runs without Metro after export.

Native iOS launch and partial fresh onboarding were checked on an isolated iPhone 17 Pro simulator, but competing Simulator interactions prevented a full native end-to-end certification. Native share/reset dialogs, VoiceOver, and Android runtime behavior remain outside this final interactive coverage. No production-release binary or complete screen recording was created.
