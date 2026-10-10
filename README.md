# Harshit OS

Harshit OS is a Windows-inspired interactive portfolio desktop with an original crimson, black, and restrained gold identity. Visitors unlock the experience, open portfolio applications in a shared window manager, and explore an Academic Performance Center populated with user-supplied semester records.

## Run and verify

Requires Node.js 18 or later. The app has no third-party runtime dependencies.

```sh
npm run dev
```

Open the URL printed by the server (normally http://localhost:4173). Press Enter or Space, or choose **Unlock portfolio**. If a port is occupied, the server tries the next port through 4180.

- `npm test` runs calculation and application-render smoke tests.
- `npm run build` copies the static site into `dist/`.
- `npm start` runs the same local server as `npm run dev`.

## Desktop controls

- Select a shortcut with one click; double-click or tap twice to open it. Arrow keys move selection, Enter opens, and Escape clears transient UI.
- Drag desktop shortcuts to reposition them on a snapping grid; occupied cells swap shortcuts. Arrow-key navigation follows the grid. Positions and order persist locally. On mobile, shortcuts use a scrollable three-column launcher grid. Right-click a shortcut or the wallpaper for its context menu.
- Drag a window title bar to move it and use the bottom-right grip to resize. Double-click the title bar to maximize/restore. Taskbar buttons focus, restore, or minimize applications.
- Start/search opens apps, projects, skills, subjects, semesters, coding lab assessments, and configured achievements. Recent projects and subjects open directly to their detail views. `Ctrl+K` opens search; use Tab or Arrow Down to navigate results.
- The taskbar includes pinned apps, Task View, show desktop, quick settings, live clock/calendar, and a lock control. These are website interactions; quick settings do not control the visitor’s device.
- Settings persist wallpaper, accent, reduced motion, icon visibility, lock-screen preference, window geometry, shortcut positions/order/names, and recent applications/projects/subjects locally. Restart and shut down affect only this portfolio. Open-window/application view state is not persisted.

## Application and state architecture

- `src/core/store.js` is the authoritative window and preference store. It owns window creation, focus, maximize, restore, minimize, close, and geometry persistence.
- `src/apps/registry.js` declares application IDs and window configuration. `src/apps/views.js` renders app content without implementing window chrome.
- `src/shell/render.js` renders desktop shortcuts, taskbar state, shared windows, Start menu, and calendar.
- `src/main.js` connects pointer, keyboard, menu, and application actions.
- `src/styles/tokens.css` defines the design tokens; `src/styles/shell.css` contains shell and responsive styles.
- `src/utils/desktop-layout.js` normalizes saved icon cells and swaps icons on occupied drop targets. `src/utils/portfolio-search.js` builds searchable results from configured data.

## Replace profile and project content

- `src/data/profile.js`: name, role, education, introduction, links, email, and optional resume file path.
- `src/data/projects.js`: project name, summary, stack, status, contribution, challenge, and optional verified URLs.
- `src/data/skills.js`: skill groups and contextual descriptions (no unsupported proficiency scores).
- `src/data/github.js`: configured GitHub profile link. Repository details and contribution statistics are intentionally omitted until supplied.
- `src/data/achievements.js`: verified experience or awards. It intentionally starts empty.

## LeetCode dashboard

The LeetCode app fetches the public profile, solved counts, topic skills, contest summary/history, badges, and recent submissions from the documented `alfa-leetcode-api` endpoints. The API base is configurable through `globalThis.LEETCODE_API_BASE_URL` before the app modules load, or by editing `src/data/leetcode-config.js`. Successful normalized data is cached locally for five minutes; no LeetCode credentials are requested or stored. Missing provider fields remain unavailable.

## Academic records

The Academic Center keeps data, calculations, and presentation separate:

- `src/data/academics/semesters.js`: four supplied semester GPAs and the separate supplied CGPA.
- `src/data/academics/subjects.js`: all 44 supplied subject names, course codes, marks, grades, and configured technical tags. Credits and course types remain marked as not supplied.
- `src/data/academics/assessments.js`: empty because individual assessment breakdowns were not supplied.
- `src/utils/academics/analytics.js`: GPA series, configured technical-course selection, filters, and summary metrics.
- `src/apps/academic-chart.js` and `src/apps/academic-view.js`: accessible SVG GPA chart and five-section Academic Center UI.
- `src/utils/academics/calculations.js`: reusable percentage, aggregate, extrema, and threshold calculations.

The academic view presents the marks and grades as user-supplied records; no official transcript, credit values, or assessment breakdowns were provided. The GPA chart uses a fixed 0–10 axis. Standout Scores uses a configurable course-code allowlist and score bands for display only; those bands do not alter supplied grades.

## Environment limitation

The app uses browser-native JavaScript modules and CSS. React/Vite and third-party packages are not installed; a previous installation attempt failed with `ENOTFOUND registry.npmjs.org`, so this remains a temporary network constraint. No React imports or dependencies were added. GitHub API data, resume downloads, verified contact channels, live class comparisons, and official academic document verification require configuration and are not claimed here.

Tablet styles compress the taskbar and stack academic panels; mobile switches to a scrollable app grid and full-screen windows. The server and app remain runnable with `npm run dev`. Browser visual verification has not been available in this environment; verify the lock screen, LeetCode dashboard rendering, desktop interactions, and narrow layouts in a browser.
