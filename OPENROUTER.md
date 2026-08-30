# Generate specific Tuesday scenarios

Put your key in `.env.local` in the project root, beside `package.json`:

```dotenv
OPENROUTER_API_KEY=your-key-here
OPENROUTER_MODEL=your-chosen-model-id
```

Copy `.env.example` to `.env.local` to start. `.env.local` is ignored by Git. Do not paste the key into chat, source code, `app.json`, or any `EXPO_PUBLIC_*` variable. Only the developer script reads it; the mobile app never calls OpenRouter or receives the key.

Choose a model/endpoint supporting [structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs). The script uses the [OpenRouter API](https://openrouter.ai/docs/quickstart), requires supported parameters, and validates the response locally. Generation uses your OpenRouter credits; set a spending limit on the key.

From the project root, run:

```bash
rtk npm run scenarios:generate -- "Social & Behavioral Sciences"
```

Use any catalog family name or `economics`. Use `rtk npm run scenarios:generate -- --all` to generate all 12 sets sequentially (12 paid requests). Running without an argument lists the accepted keys. Node 22+ is required. No new packages or server are needed.

The command sends only the field name and example scenarios. It does not send student answers, profiles, notes, or campus identifiers. It writes a timestamped JSON draft under `content-drafts/`; it does not change the app automatically.

Before publishing a draft, check every scenario:

- Could a beginner explain exactly what they would do and with what material?
- Does the question ask about interest in that task, rather than expertise or persistence?
- Are the three answers clearly interested, uncertain, and uninterested, without a socially preferred answer?
- Is the example plausible, free of invented campus/course claims, and specific to the named field?
- Do the three scenes show different parts of the work, including routine checking or revision?

After reviewing, merge the draft's field entry into `src/features/tuesday/approvedScenarios.json`, preserving other entries. The app uses valid approved entries and falls back to the bundled examples if an entry is missing or malformed. Run `rtk npm run typecheck` and `rtk npm test`, then reload Expo and review all three screens.

The app now bundles 36 AI-assisted, editorially reviewed scenarios (reviewed August 30, 2026), covering all 11 broad fields plus economics. Review corrected field drift, unsupported causal claims, jargon, and mismatched titles. These are illustrative examples, not exhaustive or verified campus schedules. Named majors use their broad-family examples unless dedicated content exists; economics also resolves by its program name across school-specific IDs.

Generation uses fixed, human-authored anchors rather than earlier AI output. Each draft must preserve the anchor's discipline/title and the app's interested/unsure/uninterested answer scale. Structural validation cannot establish factual accuracy or field relevance; editorial review remains required.

Tuesday answers are temporary reflection choices, not ranking evidence. The takeaway screen repeats each task and the student's reaction, preserves answers when stepping back, and offers a real work sample in the selected field. Leaving the experience clears those temporary answers; completing real fieldwork and reflecting on it supplies ranking evidence.

If we later add live personalization, keep this key in a backend secret store and add authenticated, rate-limited requests. Never move it into the Expo bundle. The current integration generates content before release, so users get instant, offline questions and unreviewed AI output never reaches them.
