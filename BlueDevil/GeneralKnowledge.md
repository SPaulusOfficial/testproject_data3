# 🛡️ AI Guardrails – Technical-Functional Framework for Agents and Modules

We are developing a modular, AI-powered platform for automating typical activities within Salesforce projects. The Project Assistant Suite accompanies the entire project lifecycle – from PreSales through Solution Design to Rollout and Hypercare – and uses specialized AI agents for extraction, structuring, and generation of relevant artifacts such as stories, data models, test cases, or training materials. The goal is to initially use this platform internally for efficiency improvement and later establish it as a productized system in the market.

This document describes the binding framework ("Guardrails") for all AI-powered components within the Project Assistant Suite. It defines what is allowed, which technologies and methods may be used, and which architectural and security-related guidelines must be followed.

---

## 1. 🔧 Technological Framework

* The platform is based exclusively on **Open Source technologies**.
* Permitted programming languages: **TypeScript/JavaScript**.
* Services are **containerized (Docker)**

---

## 2. 🧠 AI Logic & Agent Design

* AI functionalities are encapsulated in **modular agents**.
* Each agent must be **controllable via Custom UI or CLI**.

---

## 3. 🔁 Workflow and Process Control

* Workflows may only start on explicit triggers (Event or API).
* Process states are persistently stored and versionable.

---

## 4. 🔐 Security & Compliance

* Access is controlled via **OAuth2/Username&Password**


---

## 5. 🧭 Data Management & Traceability

* All artifacts (stories, data models, releases, reports) are versioned.
* Changes are tracked via the **Change Engine** with graph structure.
* Each agent must save its outputs and make them referable (Traceability).
* No blackbox logic without logging allowed.

---

## 6. 📊 Monitoring & Quality Assurance



---

## 7. ❗ Restrictions

* No direct access to Salesforce production systems
* No use of closed-source AI models without usage of privacy layer

---

> This document is binding for all contributors and agent instances. It may only be changed with review by the Security and AI responsible person.



Salesfive – UI Implementation Guidelines

Copy‑paste this spec directly into your design‑system repository or provide it to an AI coding assistant. It contains every brand‑token, typographic rule and component spec required to recreate Salesfive digital interfaces (web‑app, presentations, landing pages).

1 Basic Layout & Structure

AreaDimensions & BehaviorContent / Components





Left Side-Bar

• Fixed width ≈ 260 px • Full height, dark gradient • Flex column with gap-y-4

1. Profile Avatar (80 px Ø) 2. Name + Email (small, gray text) 3. Primary Navigation (Icon + Label, Hover-Highlight, Active-State) 4. Secondary Links (Book a Demo, Settings, Referral)

Main-Frame

• Flex column, flex-1 • Padding xl (left/right 32 px, top 24 px) • Max-width 1440 px, centered

Header, Cards, Tabs, Tables, Modals, Wizards

Page Structure

mermaid

CopyEdit

graph LR A[Side-Bar] --- B[Main-Frame] B --> C[Page Header] C --> D[Content Area]

0 Table of Contents

Design Tokens (Color)

Typography System

Layout & Grid

Color Application Rules

Component Library

States & UX Patterns

Datavis (rounded‑bar charts)

Accessibility

Code Snippets

Implementation Checklist

1 Design Tokens

Token

HEX

Usage

clr-open-blue

#00D5DC

Primary accent, hover highlights, infographics

clr-digital-blue

#0025D1

Brand‑primary (CTAs, links, selection)

clr-deep-blue-1

#000058

Dark hover, card headers, high‑contrast chart segment

clr-deep-blue-2

#001394

Secondary accent, badges

clr-mid-blue-1

#0051D4

Secondary controls, ghost focus

clr-mid-blue-2

#007DD7

Light table row, tooltips

clr-mid-blue-3

#00A9D9

Illustration fill, secondary charts

clr-off-white

#F7F7F9

Page background, card background

clr-black

#000000

Primary text, icons

clr-white

#FFFFFF

Text on dark backgrounds, icons

Contrast Rule

Use white typography on backgrounds #000058 – #0051D4 (AAA).Use black typography on backgrounds #007DD7 – #00D5DC.

2 Typography System

Level

Marketing Font†

System Fallback

Size (Desktop)

Weight

H1

Helvetica Now

Arial

48 – 70 px (≈5× Body)

700

H2

Helvetica Now

Arial

32 px

700

H3

Helvetica Now

Arial

24 px

700

Body

Helvetica Now

Arial

16 px

400

Caption

Helvetica Now

Arial

12 – 14 px

400

†Helvetica Now only on licensed, public marketing touch‑points. Internal apps use Arial Regular/Bold exclusively.

@font-face {
  font-family:"HelveticaNow";
  src:url("/fonts/HelveticaNow-Regular.woff2") format("woff2");
  font-weight:400;
  font-display:swap;
}
body {font-family:"HelveticaNow","Arial","Helvetica",sans-serif;}

3 Layout & Grid

Shell

Sidebar: fixed 260 px (desktop) ⇒ collapses to 64 px icon‑rail (< 1024 px).

Main Frame: flex‑column, flex-1, padding 32 px 24 px 24 px.

Max‑width: 1440 px, centered.

Breakpoint

Columns

Gutter

≥1536 px (2xl)

12

32 px

≥1280 px (xl)

12

24 px

≥1024 px (lg)

12

24 px

≥768 px (md)

8

20 px

<768 px (sm)

4

16 px

Sidebar Structure (top → bottom)

Avatar 80 px Ø

Name & email (small, grey)

Primary nav links (icon + label)

Secondary links (Book a Demo, Settings, Referral)

Dashboard Skeleton (example)

graph LR
A[Sidebar] --260px--> B[Main]
B --> C[Page Header]
C --> D[Stats Cards]
D --> E[Suggestions Grid]

4 Color Application Rules

Palette Coverage

Guideline

Black & White

80 – 90 % of any screen.

Blue Tones

10 – 20 % as highlights (CTA, charts, badges).

Do NOT

combine multiple mid‑blues in one small area – pick one dominant accent.

5 Component Library

Buttons

Variant

Normal

Hover/Active

Disabled

Primary

BG #0025D1, text #FFF

BG #001394

BG #F7F7F9, text #A0A0A0

Ghost

border/text #0025D1

BG rgba(0,37,209,.08)

text/border #C0C4CC

Card

Radius 12 px

Shadow sm (0 1px 2px rgba(0,0,0,.06)) → md on hover.

Stat Card (Dark)

BG #000058, text #FFF, icon badge 20 px Ø Open‑Blue.

Multi‑Select Dropdown

Checkbox + label 14 px.

Check icon #00D5DC.

Scrollbar thumb #0051D4.

Progress Bar

--track:#E5E7EB;
--fill:#0025D1; /* width: calc(%%) */
height:4px; border-radius:4px;

Accordion / Workspace Tree

Up to 3 hierarchy levels.

Drag‑handle icon (≡) for re‑ordering.

Inline table inside each node (columns: Module, Sub‑Module, Technology, Complexity, Effort).

Modal / Wizard

Centered max-w-2xl, radius 20 px.

Step indicator bar at top (fill #0025D1).

Footer with Back (ghost) & Next (primary, disabled until valid).

6 States & UX Patterns

Pattern

Behaviour

Hover

components raise sm→md shadow or receive 5 % tint.

Keyboard Focus

outline:2px solid #00D5DC; outline-offset:2px.

Unsaved Changes

sticky banner top; optimistic UI on save.

Animations

≤ 200 ms ease-in-out; respect prefers-reduced-motion.

7 Datavis – Rounded‑Bar Charts

.bar--marketing{fill:#0025D1; rx:42%}
.bar--support  {fill:#001394; rx:42%}
.bar--perf     {fill:#000058; rx:42%}
.bar--usab     {fill:#00D5DC; rx:42%}
.text--inside{font-size:12px;fill:#FFF;font-weight:700}
.axis{stroke:#E5E7EB}

All bars share identical width; radius set via rx for pill‑shape.



8 Accessibility Checklist

Contrast: meet WCAG AA (4.5:1).

Focus management: trap inside modals, return focus on close.

Keyboard path: every interactive element reachable with Tab.

Motion: reduce for users with prefers-reduced-motion.

ARIA: proper labels for dropdowns and wizard steps.

9 Code Snippets

Tailwind Primary Button

<button class="inline-flex items-center justify-center
              px-6 h-11 rounded-full
              bg-digital-blue text-white font-bold
              shadow-sm transition
              hover:bg-deep-blue-2
              focus:outline-none focus:ring-2 focus:ring-open-blue
              disabled:bg-off-white disabled:text-gray-400">
  CTA Label
</button>

Vue / React Layout Skeleton (pseudo‑code)

<Sidebar>
  <NavLink icon="layers" label="Agents" />
  <NavLink active icon="zap" label="Pre‑Sales Agent" />
  ...
</Sidebar>
<Main>
  <Header title="Welcome, Prateek!" subtitle="132 active proposals in pipeline." />
  <StatsGrid values={[141,9,'$44,803,424',3069]} />
  <SuggestionsGrid />
</Main>

10 Implementation Checklist

Export tokens to CSS custom properties or Tailwind theme.

Global CSS reset + font‑face.

Atom components (button, input, tag) in Storybook → snapshot tests.

Molecules (card, dropdown, progress).

Organisms (wizard, workspace tree, stat grid).

Routing: /dashboard, /proposal/:id, wizard /new.

State: React‑Query for async data, Context for auth/profile.

Testing: Playwright E2E + RTL unit tests.

CI/CD: ESLint, Prettier, Husky pre‑commit; preview deployments (Vercel).

Result: With these tokens, rules and patterns you can reproduce the GetGenerative‑style interface in the Salesfive brand universe – fully responsive, accessible, and ready for production.

