# Product Requirements Document (PRD): VibeSet

## 1. Project Overview
**VibeSet** is a high-performance workout tracking application inspired by **Setgraph**. The primary goal is to provide a frictionless, data-dense interface for serious lifters who want to log their sets quickly while gaining deep insights into their progressive overload and training volume.

The "Setgraph" philosophy centers on **speed of entry** and **immediate visual feedback** on performance relative to previous sessions.

---

## 2. Target Audience
- **Strength Athletes & Bodybuilders**: Individuals who track every set, rep, and weight.
- **Data-Driven Lifters**: Users who want to see volume charts and progressive overload feedback.
- **Minimalists**: People who find existing apps (like Strong or Hevy) too "clunky" or slow for mid-set logging.

---

## 3. Core Features

### 3.1. Rapid Workout Logging
- **Inline Entry**: Compact weight × reps input for fast logging.
- **Set Repeat**: One-tap to repeat previous set's weight/reps/RPE.
- **Real-time PB Tracking**: Visual indicators (Trophy icon) when a personal best is achieved.
- **Compared to Previous**: Shows % change in Sets, Reps, Volume, and lb/rep vs last session.
- **Rest Timer**: Integrated, customizable rest timer triggered after set logging.

### 3.2. Exercise Management
- **Library**: Pre-defined exercises categorized by muscle group (Chest, Back, Legs, Shoulders, Arms, Core).
- **Custom Exercises**: Users can add their own exercises.
- **Body Tab** (FUTURE): Full exercise library browser with last-performed dates.

### 3.3. Workout Templates
- **Save as Template**: Save current workout as a reusable template.
- **Quick Start**: Start a session from a template with one tap.

### 3.4. Today Tab
- **Weekly View**: Default view showing current week with workout days highlighted (green dots).
- **Calendar Expand**: Tap calendar icon to toggle full monthly view.
- **Today's Session**: Shows exercises, sets, reps, volume for today.
- **Weekly Summary**: Total workouts, sets, volume for the week.

### 3.5. Session History
- **Past Workouts**: List of completed sessions with dates, duration, exercises, and total volume.
- **Delete Sessions**: Swipe/hover to delete past sessions.

### 3.6. Personalization & UI
- **Dark Mode First**: Optimized for gym environments with high-contrast dark UI.
- **Accent Colors**: Customizable theme accents (Emerald, Blue, Purple, Amber, Rose).
- **Unit Toggle**: Support for both Metric (kg) and Imperial (lb) units.
- **Rest Timer Setting**: Adjustable rest duration (15s - 5min).

---

## 4. Technical Specifications
- **Frontend**: React 19 (TypeScript).
- **Styling**: Tailwind CSS (Utility-first, responsive design).
- **Icons**: Lucide-react (Consistent, clean iconography).
- **Charts**: Recharts (Responsive data visualization).
- **State Management**: React Hooks (useState, useMemo, useEffect).
- **Persistence**: localStorage (sessions, templates, settings, custom exercises).
- **Build Tool**: Vite 6.

---

## 5. Current Status (as of March 2026)

### What Works
- ✅ Workout logging with weight × reps
- ✅ Rest timer (auto-triggered, customizable duration)
- ✅ Session stopwatch
- ✅ Personal best tracking
- ✅ "Compared to Previous" feature (sets, reps, volume, lb/rep)
- ✅ Exercise repeat on hover
- ✅ Exercise picker modal (grouped by muscle)
- ✅ Custom exercise creation
- ✅ Workout templates (save, start from template)
- ✅ Session history with delete
- ✅ Today tab (weekly view + expand to monthly calendar)
- ✅ VibeSet logo navigation (smart back/home)
- ✅ Settings (theme, units, accent color, rest timer)
- ✅ localStorage persistence

### Hidden (Future Feature)
- 🔄 Body Tab (exercise library browser) — code preserved, UI hidden

### Known Bugs
- None currently (all fixed as of latest commit)

---

## 6. Recent Changes Log

### v1.0.0 — March 2026
- Rebranded from VibeLift → VibeSet
- Removed all AI/Gemini integration
- Complete UI redesign to match Setgraph's minimal aesthetic
- Fixed React hook violations (useMemo in nested functions)
- Added "Compared to Previous" feature
- Added set repeat functionality
- Redesigned Today tab with weekly view + calendar expand
- Added VibeSet logo navigation logic
- Hidden Body tab (preserved for future)

---

## 7. Future Roadmap

### High Priority
- [ ] Plate Calculator — show which plates to load on barbell
- [ ] Exercise-specific analytics — charts showing progress over time per exercise
- [ ] Notes on sets/exercises — ability to add notes to individual sets

### Medium Priority
- [ ] Body Tab — full exercise library browser with search and last-performed dates
- [ ] Supersets — link exercises together
- [ ] Workout duration tracking — better session time display
- [ ] Export data — CSV/JSON export for power users

### Low Priority
- [ ] Cloud sync — cross-device persistence (Firebase or Supabase)
- [ ] Social sharing — export workout summaries as images
- [ ] Workout streaks — gamification for consistency
- [ ] Estimated 1RM — calculate one-rep max from working sets

### UI/UX Improvements
- [ ] Swipe gestures — swipe sets for repeat/delete
- [ ] Haptic feedback — visual/tactile confirmation on actions
- [ ] Light mode refinement — better contrast in light theme

---

## 8. Success Metrics
- **Time per Set Logged**: Aiming for < 3 seconds.
- **Retention**: Users returning for at least 3 workouts per week.
- **Feature Adoption**: "Compared to Previous" viewed on >80% of exercises logged.
