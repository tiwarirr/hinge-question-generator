# Hinge Question Generator — Design Document

## Design Philosophy

The app is designed for teachers who need a fast, distraction-free tool to create diagnostic assessments. The interface prioritizes clarity over decoration — every element serves a purpose.

**Core principles:**
- **Task-first**: The UI gets out of the way so teachers can focus on crafting questions
- **Progressive complexity**: Simple by default, powerful when needed
- **Accessible**: Works on any device, any screen size, for both teachers and students
- **Instant feedback**: Every action has an immediate, visible result

---

## Color System

### Primary Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Indigo | `#4F46E5` | Buttons, links, active states, sidebar |
| Primary Dark | Indigo 700 | `#4338CA` | Button hover, sidebar active item |
| Primary Light | Indigo 50 | `#EEF2FF` | Selected states, highlights |

### Semantic Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Correct | Green | `#10B981` | Correct answer badges, success states |
| Correct Light | Green 50 | `#ECFDF5` | Correct option backgrounds |
| Distractor | Red | `#EF4444` | Incorrect answer indicators, misconceptions |
| Distractor Light | Red 50 | `#FEF2F2` | Distractor option backgrounds |
| Warning | Yellow | `#F59E0B` | Moderate performance (50-70%) |
| Neutral | Gray 50-900 | `#F9FAFB` → `#111827` | Text, borders, backgrounds |

### Chart Colors

```
Correct:    #10B981 (green)
Incorrect:  #EF4444 (red)
Accent 1:   #6366F1 (indigo)
Accent 2:   #F59E0B (amber)
Accent 3:   #EC4899 (pink)
```

---

## Typography

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Page title | 24px (text-2xl) | Bold (700) | System stack |
| Section heading | 18px (text-lg) | Semibold (600) | System stack |
| Body text | 14px (text-sm) | Normal (400) | System stack |
| Small labels | 12px (text-xs) | Medium (500) | System stack |
| Code/mono | 14px | Normal (400) | Monospace |

**Font stack:** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

---

## Layout Structure

### Teacher View (Authenticated)

```
+------------------+----------------------------------------+
|                  |                                        |
|    Sidebar       |         Main Content Area              |
|    (256px)       |         (fluid, max-w-6xl)             |
|                  |                                        |
|  - Dashboard     |   +----------------------------+       |
|  - AI Generate   |   |  Page Title                |       |
|  - Create Q's    |   +----------------------------+       |
|  - My Questions  |   |                            |       |
|  - New Session   |   |  Content Cards             |       |
|                  |   |  (white, rounded, shadow)   |       |
|  [User info]     |   |                            |       |
|  [Sign out]      |   +----------------------------+       |
|                  |                                        |
+------------------+----------------------------------------+
```

**Sidebar:**
- Fixed width: 256px
- Background: Indigo 800 (`#3730A3`)
- Text: White, Indigo 200 for inactive items
- Active item: Indigo 600 background
- Bottom section: User name + sign out

**Main area:**
- Max width: 1152px (max-w-6xl), centered
- Padding: 32px (p-8)
- Background: Gray 50 (`#F9FAFB`)

### Student View (Unauthenticated)

```
+----------------------------------------------+
|                                              |
|           Centered Card (max-w-md)           |
|                                              |
|   +--------------------------------------+   |
|   |  Session Title                       |   |
|   |  Topic: ...                          |   |
|   |                                      |   |
|   |  [Your Name]                         |   |
|   |  [Join & Start]                      |   |
|   +--------------------------------------+   |
|                                              |
+----------------------------------------------+
```

- Full viewport height
- Content centered vertically and horizontally
- White card with shadow on gray background
- No sidebar, no navigation

---

## Component Design

### Cards

All content sections use consistent card styling:
```
Background:   white
Border:       1px solid gray-100
Border radius: 12px (rounded-xl)
Shadow:       0 1px 2px rgba(0,0,0,0.05) (shadow-sm)
Padding:      24px (p-6)
```

### Buttons

| Type | Background | Text | Hover | Usage |
|------|-----------|------|-------|-------|
| Primary | Indigo 600 | White | Indigo 700 | Main actions (Generate, Save, Create) |
| Success | Green 600 | White | Green 700 | Save/confirm actions |
| Danger text | Transparent | Red 600 | Red 700 | Delete, close |
| Ghost | Transparent | Gray 600 | Gray 100 bg | Secondary actions |
| Outline | Border gray-300 | Gray 600 | Gray 50 bg | Cancel, back |

**Button sizes:**
- Default: `px-4 py-2.5 text-sm`
- Small: `px-3 py-1.5 text-xs`
- Large: `px-6 py-3 text-base`

### Form Inputs

```
Border:        1px solid gray-300
Border radius: 8px (rounded-lg)
Padding:       12px 16px (px-4 py-2.5)
Focus:         ring-2 ring-indigo-500, border-indigo-500
Placeholder:   gray-400
```

### Badges / Tags

| Type | Background | Text | Usage |
|------|-----------|------|-------|
| Correct | Green 100 | Green 800 | Correct answer label |
| Distractor | Red 100 | Red 800 | Incorrect answer label |
| Active | Green 100 | Green 700 | Session status |
| Closed | Gray 100 | Gray 500 | Session status |
| Topic | Gray 100 | Gray 600 | Question topic tag |
| Question # | Indigo 50 | Indigo 600 | Question number |

---

## Page Designs

### 1. Login / Register

```
+------------------------------------------+
|                                          |
|     Hinge Question Generator             |
|     Sign in to your account              |
|                                          |
|     +----------------------------------+ |
|     |  Email                           | |
|     +----------------------------------+ |
|     |  Password                        | |
|     +----------------------------------+ |
|     |  [        Sign in        ]       | |
|     +----------------------------------+ |
|                                          |
|     Don't have an account? Register      |
|                                          |
+------------------------------------------+
```

- Centered card, max-width 448px
- Clean form with labels above inputs
- Error messages in red-50 background

### 2. Dashboard

```
+------------------------------------------+
|  Dashboard                               |
+------------------------------------------+
|  +----------+  +----------+  +----------+|
|  | Total Q's|  | Sessions |  | Quick    ||
|  |    24    |  |     8    |  | Action   ||
|  +----------+  +----------+  +----------+|
+------------------------------------------+
|  Recent Sessions                    +New |
+------------------------------------------+
|  [Active] Photosynthesis - P3   Close Rpt|
|  [Closed] Fractions Quiz        Close Rpt|
|  [Active] WW2 Period 5          Close Rpt|
+------------------------------------------+
```

- Stat cards: 3-column grid
- Session list: full-width, each row is a card
- Status badge + action buttons on the right

### 3. Generate Questions (AI)

```
+------------------------------------------+
|  Generate Hinge Questions                |
+------------------------------------------+
|  Topic: [________________]               |
|  Subtopic: [_____________]               |
|  Count: [5]     Grade: [Middle School v] |
|  [Generate Questions]                    |
+------------------------------------------+
|  Generated Questions (5)   Clear  Save   |
+------------------------------------------+
|  Q1                          Edit Remove |
|  What is the degree of...                |
|  +------------------------------------+  |
|  | A. 6               [Correct]       |  |
|  | B. 5    Misconception: Added wrong |  |
|  | C. 3    Misconception: One var     |  |
|  | D. 4    Misconception: Terms       |  |
|  +------------------------------------+  |
+------------------------------------------+
```

- Input form at top
- Generated questions listed below
- Each question is an editable card
- Inline editing mode with textareas

### 4. Create Question (Manual)

```
+------------------------------------------+
|  Create Question Manually                |
+------------------------------------------+
|  Topic: [________]  Subtopic: [________] |
+------------------------------------------+
|  Question Stem                           |
|  +------------------------------------+  |
|  | B I U | List | fx Equation | Img   |  |
|  +------------------------------------+  |
|  |                                    |  |
|  | Type your question here...         |  |
|  |                                    |  |
|  +------------------------------------+  |
|                                          |
|  Answer Options                          |
|  +------------------------------------+  |
|  | (A) Correct Answer                 |  |
|  | [Rich text editor - compact]       |  |
|  +------------------------------------+  |
|  | (B) Distractor                     |  |
|  | [Rich text editor - compact]       |  |
|  | Misconception: [_______________]   |  |
|  +------------------------------------+  |
|  | (C) ...                            |  |
|  | (D) ...                            |  |
|                                          |
|  [Show Preview]                          |
|  [+ Add This Question]                   |
+------------------------------------------+
|  Questions to Save (3)      [Save All]   |
+------------------------------------------+
|  Q1: What is...         [Remove]         |
|  Q2: Which of...        [Remove]         |
|  Q3: If x = ...         [Remove]         |
+------------------------------------------+
```

- Rich text editor with toolbar
- Equation panel expands inline with preview
- Options use compact editor variant
- Batch list at bottom

### 5. Student Quiz View

```
+------------------------------------------+
|  Photosynthesis Quiz           Q 2 of 5  |
|  Student: John                           |
+--------------------------------==========  ← progress bar
|                                          |
|  +------------------------------------+  |
|  |                                    |  |
|  |  What is the primary function of   |  |
|  |  chlorophyll in photosynthesis?    |  |
|  |                                    |  |
|  |  +------------------------------+  |  |
|  |  | A. Absorb light energy       |  |  |
|  |  +------------------------------+  |  |
|  |  | B. Store glucose             |  |  |
|  |  +------------------------------+  |  |
|  |  | C. Release carbon dioxide    |  |  |
|  |  +------------------------------+  |  |
|  |  | D. Transport water           |  |  |
|  |  +------------------------------+  |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
```

- Full-screen, no sidebar
- Header with session info + progress
- Progress bar (indigo, animated)
- Large touch-friendly option buttons
- Options have hover/active states

### 6. Diagnostic Report

```
+------------------------------------------+
|  Diagnostic Report        [Export CSV]   |
|  Photosynthesis Quiz · Biology           |
+------------------------------------------+
|  +----------+ +----------+ +----------+  |
|  | Students | | Questions| | Score    |  |
|  |    28    | |     5    | |   72%    |  |
|  +----------+ +----------+ +----------+  |
|  | Misconceptions Found                 |  |
|  |      8                               |  |
|  +--------------------------------------+|
+------------------------------------------+
|  Question Performance                    |
|  [=====bar chart=====]                   |
+------------------------------------------+
|  Misconception Map                       |
|  ██████████████  Confuses energy 34%     |
|  ████████        Wrong organelle 22%     |
|  █████           Partial process 15%     |
+------------------------------------------+
|  Detailed Breakdown                      |
|  Q1. What is...                85% ✓     |
|  A. Absorb light [78%]                   |
|  B. Store glucose [12%] Confuses...      |
|  C. Release CO2 [7%]  Ignores...         |
|  D. Transport H2O [3%] Mixes up...       |
+------------------------------------------+
|  AI Recommendations                      |
|  ## Summary                              |
|  Most students understand the basics...  |
|  ## Reteaching Strategies                |
|  - Focus on energy conversion...         |
+------------------------------------------+
```

- Stat cards at top (4-column grid)
- Bar chart using Recharts
- Misconception ranked list with progress bars
- Per-question breakdown with option distribution
- AI recommendations in markdown-rendered section

---

## Interaction Patterns

### Loading States

| Context | Pattern |
|---------|---------|
| Page load | Gray pulsing text: "Loading..." |
| AI generation | Button text changes to "Generating with AI..." |
| Saving | Button text changes to "Saving..." |
| Student join | Spinner icon + "Loading session..." |

### Error Handling

| Context | Pattern |
|---------|---------|
| Form validation | Red-50 banner at top of form |
| API error | Red-50 banner with error message |
| Not found | Centered card with icon + message |
| Session closed | Lock icon + "Session Closed" message |

### Confirmations

| Action | Pattern |
|--------|---------|
| Delete question | Browser confirm dialog |
| Close session | Browser confirm with warning text |
| Clear questions | Immediate, no confirmation |

---

## Responsive Behavior

### Breakpoints (Tailwind defaults)

| Name | Width | Usage |
|------|-------|-------|
| sm | 640px | Not heavily used |
| md | 768px | Grid columns collapse, sidebar hides |
| lg | 1024px | Full layout |

### Mobile Adaptations

- **Sidebar**: Collapses to top nav on small screens
- **Grid layouts**: Stack to single column
- **Question cards**: Full width
- **Student view**: Already mobile-optimized (centered card)
- **Charts**: Responsive container adapts width

---

## Accessibility

- All interactive elements have focus states (ring-2)
- Color is never the only indicator (text labels accompany color)
- Form inputs have associated labels
- Buttons have descriptive text
- Sufficient color contrast (WCAG AA)
- Keyboard navigable (tab order follows visual order)

---

## Iconography

The app uses Unicode symbols instead of an icon library to minimize dependencies:

| Symbol | Usage |
|--------|-------|
| ✓ (&#10003;) | Success/completion |
| ⚠ (&#9888;) | Error/warning |
| 🔒 (&#128247;) | Session closed |
| 📷 (&#128247;) | Image upload |
| 𝑥 (&#119975;) | Equation/math |
| • (&#8226;) | Bullet list |
| 1. | Numbered list |

---

## Data Visualization

### Charts (Recharts)

**Question Performance — Stacked Bar Chart**
- X-axis: Question labels (Q1, Q2, ...)
- Y-axis: Percentage (0-100%)
- Green bar: Correct responses
- Red bar: Incorrect responses
- Tooltip shows exact percentages

**Misconception Map — Horizontal Progress Bars**
- Each row: misconception name + bar + percentage
- Sorted by frequency (highest first)
- Red fill on gray background
- Percentage label on the right

---

## Design Tokens Summary

```css
/* Spacing */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;

/* Border Radius */
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

/* Transitions */
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
```
