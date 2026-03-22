# Product Requirements Document (PRD): VibeSet

## 1. Project Overview
**VibeSet** is a high-performance workout tracking application inspired by **Setgraph**. The primary goal is to provide a frictionless, data-dense interface for serious lifters who want to log their sets quickly while gaining deep insights into their progressive overload and training volume.

The "Setgraph" philosophy centers on **speed of entry** and **immediate visual feedback** on performance relative to previous sessions.

---

## 2. Target Audience
- **Strength Athletes & Bodybuilders**: Individuals who track every set, rep, and weight.
- **Data-Driven Lifters**: Users who want to see volume charts and AI-generated training advice.
- **Minimalists**: People who find existing apps (like Strong or Hevy) too "clunky" or slow for mid-set logging.

---

## 3. Core Features

### 3.1. Rapid Workout Logging
- **Grid-based Entry**: Quick entry for Weight, Reps, and RPE (Rate of Perceived Exertion).
- **Set Duplication**: One-tap duplication of the previous set to minimize typing.
- **Real-time PB Tracking**: Visual indicators (Trophy icon) when a personal best is achieved during a session.
- **Rest Timer**: Integrated, customizable rest timer that triggers automatically after a set is logged.

### 3.2. Exercise Management
- **Library**: A pre-defined list of common exercises categorized by muscle group.
- **Muscle Group Focus**: Visual breakdown of training volume by muscle group (Chest, Back, Legs, etc.).

### 3.3. Workout Templates
- **Pre-defined Routines**: Ability to create and save templates for common workouts (e.g., "Push Day", "Legs A").
- **Quick Start**: Start a session from a template with one tap.

### 3.4. Analytics & Visualization
- **Volume Tracking**: Area charts showing total volume over time.
- **Max Weight Progress**: Tracking the heaviest weight lifted for specific exercises.

### 3.5. Personalization & UI
- **Dark Mode First**: Optimized for gym environments with high-contrast dark UI.
- **Accent Colors**: Customizable theme accents (Emerald, Blue, Purple, Amber, Rose).
- **Unit Toggle**: Support for both Metric (kg) and Imperial (lb) units.

---

## 4. Technical Specifications
- **Frontend**: React 19 (TypeScript).
- **Styling**: Tailwind CSS (Utility-first, responsive design).
- **Icons**: Lucide-react (Consistent, clean iconography).
- **Charts**: Recharts (Responsive data visualization).
- **State Management**: React Hooks (useState, useMemo, useEffect).

---

## 5. User Experience (UX) Principles
- **Minimal Taps**: Every common action (logging a set, starting a timer) should be achievable in 1-2 taps.
- **High Information Density**: Use a "Mission Control" aesthetic—lots of data visible at once without feeling cluttered.
- **Immediate Feedback**: Animations and haptic-like visual cues when sets are completed or PBs are hit.

---

## 6. Success Metrics
- **Time per Set Logged**: Aiming for < 3 seconds.
- **Retention**: Users returning for at least 3 workouts per week.

---

## 7. Future Roadmap
- **Custom Exercises**: Allow users to add their own exercises.
- **Plate Calculator**: Quick tool to determine which plates to put on the bar.
- **Social Sharing**: Exporting "Vibe Cards" of workout summaries for social media.
- **Cloud Sync**: Firebase integration for cross-device persistence.
