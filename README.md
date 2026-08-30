# UNLABELED

**Choose the work before the label.**

An Expo React Native prototype that helps incoming freshmen discover majors by
trying the underlying work, then turns their curiosity into campus fieldwork.

## Run locally

Node 22+ recommended. Use a compatible Expo Go version on your phone, on the same network as this computer.

```bash
npm ci
npm start
```

For the already-installed iOS simulator development build, use `npm start -- --localhost --port 8081`. Keep Metro running during the walkthrough; if the simulator shows a connection error, confirm the server is running and reload the app.

For a new native build, `npm run ios` requires macOS and Xcode; `npm run android` requires Android Studio. Expo generates the native folders, which are excluded from Git.

### Browser backup

`npm run web` runs the same app in a browser. To prepare a static backup that does not depend on Metro:

```sh
npx expo export --platform web --output-dir dist
python3 -m http.server 8083 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8083`. This serves the compiled app locally; it is not a public deployment. Native sharing and reset dialogs should be demonstrated on iOS. Screenshots of the verified browser flow are in [demo/](demo/).

## Demo and product strategy

See [DEMO.md](DEMO.md) for the five-minute walkthrough and submission checklist.

Major names hide the actual work. Students may enjoy a subject's reputation but dislike its recurring assignments—or discover a field they never considered. Small, reversible experiments help them gather evidence before committing. The app starts with a shortlist, comparison, an at-home task, and a reflection that informs the next experiment.

The primary product metric would be completing one real experiment and choosing a useful next step, rather than time spent in the app. [BETA.md](BETA.md) describes a proposed validation study; it has not been conducted.

## Scope and limitations

- Progress persists locally on the device. There is no account or cloud sync.
- Work samples and core exploration work offline after the app bundle loads. External university pages need connectivity. Development builds still need Metro to load JavaScript.
- Michigan has the deepest catalog. Other campuses have starter or broad-field content, labeled in the app.
- Fit scores are deterministic heuristics, not validated psychometrics or admissions predictions.
- Semester plans are planning scaffolds, not verified schedules. Confirm current requirements and access with an academic advisor.
- Student stories are labeled illustrative composites, not testimonials.

## Verification

```sh
npm run typecheck
npm test
npx expo export --platform ios
```

An export verifies bundling; it is not an installable IPA or an App Store release.

## Content and assets

Original exploratory exercises are in `src/features/fieldwork/workSamples.ts`. University and career records include official source links in the data modules; verify current details. Institutional marks identify schools, with no affiliation or endorsement implied. Scout illustrations are bundled prototype assets; confirm their provenance and usage rights before distribution beyond this exercise. Dependency licenses remain with their authors.

## AI scenario content

See [OpenRouter setup](OPENROUTER.md) for the private key location and reviewed, offline scenario generation.
