---
name: material-vms-design-system
description: Design system guidelines, Google Material Design 3 (Material You) tokens, component patterns, Tailwind CSS rules, and accessibility standards for building modern web applications like the Automated Visitor Record Management System.
---

# SKILL.MD: Google Material Design 3 & Modern UI/UX Engineering Skill

This skill document (`SKILL.md`) provides strict visual guidelines, design tokens, component specifications, typography scales, accessibility rules, and layout practices based on **Google Material Design 3 (Material You)** and modern web UI aesthetics. It is tailored for AI coding agents (e.g., bolt.new, Cursor, v0) building web applications such as the **Automated Visitor Record Management System (VMS)**.

---

## 1. Core Design Philosophy & Google Design Principles

### 1.1 Fundamental Principles
1. **Focus on the User & Clarity**: Eliminate clutter. Every visual element must serve a functional purpose—guiding visitor check-ins, security approvals, host alert monitoring, or administrative auditing.
2. **Material You (Dynamic & Adaptive Surfaces)**: Use tonal surface elevation instead of harsh drop shadows. Color roles define visual hierarchy (Primary for key actions, Secondary for supporting elements, Surface Containers for grouping).
3. **Motion with Intent**: Micro-interactions must provide instant feedback (e.g., webcam activation indicators, badge print status confirmation, host alert toasts).
4. **Accessible to Everyone**: Ensure minimum touch targets ($48 \times 48\text{px}$), high-contrast text, clear visual focus rings, and screen-reader accessible forms.

---

## 2. Color System & Semantic Tokenization (Tailwind CSS)

Material Design 3 uses color roles derived from a primary key color. Implement these semantic color tokens using Tailwind CSS utility classes and CSS variables:

### 2.1 Color Palette & Roles

| Role | Semantic Purpose | Tailwind Class (Light) | Tailwind Class (Dark) |
| :--- | :--- | :--- | :--- |
| **Primary** | Key actions, active states, main brand emphasis | `bg-blue-600 text-white` | `bg-blue-400 text-slate-950` |
| **On Primary** | Text/icons on primary containers | `text-white` | `text-slate-950` |
| **Primary Container** | Highlighted cards, active tabs, selected states | `bg-blue-50 text-blue-900` | `bg-blue-950/60 text-blue-200` |
| **Secondary** | Less prominent actions, chips, secondary buttons | `bg-indigo-600 text-white` | `bg-indigo-400 text-slate-950` |
| **Secondary Container** | Badges, status tags, subtle indicators | `bg-indigo-50 text-indigo-900` | `bg-indigo-950/60 text-indigo-200` |
| **Surface** | Page background | `bg-slate-50 text-slate-900` | `bg-slate-950 text-slate-100` |
| **Surface Container** | Standard card containers, table panels | `bg-white border-slate-200/80` | `bg-slate-900 border-slate-800` |
| **Surface Container High**| Modal dialogs, elevated drawers, dropdowns | `bg-slate-100 shadow-md` | `bg-slate-850 shadow-xl` |
| **Error** | Destructive actions, rejected visits, invalid NIN | `bg-red-600 text-white` | `bg-red-500 text-white` |
| **Error Container** | Rejection alert banners, error message boxes | `bg-red-50 text-red-800` | `bg-red-950/60 text-red-200` |
| **Success Container** | Approved check-in status, verified identity | `bg-emerald-50 text-emerald-800` | `bg-emerald-950/60 text-emerald-200` |

---

## 3. Typography Scale & Spatial Layout System

### 3.1 Font Family
- **Primary Typeface**: `Plus Jakarta Sans`, `Inter`, or `Roboto` (sans-serif).
- **Monospace Typeface** (for IDs, Barcodes, Pass Numbers): `JetBrains Mono` or `Fira Code`.

### 3.2 Material Typography Scale

```css
/* Typography Scale Mapping */
.display-large { font-size: 3.5rem; line-height: 4rem; font-weight: 700; tracking: -0.02em; }
.headline-medium { font-size: 1.75rem; line-height: 2.25rem; font-weight: 600; }
.title-large { font-size: 1.375rem; line-height: 1.75rem; font-weight: 600; }
.title-medium { font-size: 1rem; line-height: 1.5rem; font-weight: 500; }
.body-large { font-size: 1rem; line-height: 1.5rem; font-weight: 400; }
.body-medium { font-size: 0.875rem; line-height: 1.25rem; font-weight: 400; }
.label-large { font-size: 0.875rem; line-height: 1.25rem; font-weight: 600; letter-spacing: 0.01em; }
```

### 3.3 Border Radius (Material Shapes)
- **Extra Large (`rounded-3xl`)**: $24\text{px}$ — Modals, major hero containers, Floating Action Buttons (FAB).
- **Large (`rounded-2xl`)**: $16\text{px}$ — Dashboard cards, webcam preview containers, visitor badge cards.
- **Medium (`rounded-xl`)**: $12\text{px}$ — Buttons, text inputs, dropdown menus, alert toasts.
- **Full (`rounded-full`)**: $9999\text{px}$ — Status chips, user avatar frames, icon badges.

---

## 4. Visitor Management System Component Design Specifications

### 4.1 Security Gatekeeper Panel (Webcam & Fast Enrolment)
- **Camera Viewfinder**:
  - Container: `rounded-2xl border-2 border-blue-500/30 overflow-hidden relative shadow-lg bg-slate-900`.
  - Overlay Controls: Floating control bar at bottom (`bg-slate-900/80 backdrop-blur-md rounded-full px-4 py-2`).
  - Capture Button: Outer ring `border-2 border-white p-1 rounded-full`, inner circle `bg-blue-600 hover:bg-blue-500 transition-transform active:scale-95`.
- **NIN & Identity Input Field**:
  - Material Filled Input / Outlined Input with floating label effect.
  - Border: `border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 rounded-xl px-4 py-3`.
  - Verification Badge: Inline green check icon chip (`bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold`).

### 4.2 Real-Time Host Alert Notification Toast (Snackbar)
- Container: `fixed bottom-6 right-6 max-w-md w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-start gap-4 animate-slide-up`.
- Header: Host icon, visitor name in bold (`title-medium`), purpose chip (`bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full`).
- Actions: Instant "Acknowledge" button (`bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-1.5 text-xs font-semibold text-white transition-colors`).

### 4.3 Printable Visitor Pass / Badge Card
- Dimensions: Credit card aspect ratio ($85.6\text{mm} \times 53.9\text{mm}$) or vertical ID badge format ($3.375\text{in} \times 2.125\text{in}$).
- Styling: Crisp white background (`bg-white text-slate-950 border border-slate-300 shadow-md p-5 rounded-2xl`).
- Header Bar: Institution logo, "OFFICIAL VISITOR PASS" (`text-xs font-bold tracking-wider text-blue-700 uppercase`).
- Main Section: Visitor Photo ($120 \times 120\text{px}$ aspect ratio, `rounded-xl object-cover border`), visitor full name (`title-large font-bold`), purpose of visit, host staff name, and expiry timestamp.
- Footer: Generated QR Code / Barcode image, Serial Pass Number (`font-mono text-sm`).

### 4.4 Dashboard Tables & Visitor Request Cards
- Card Layout: Surface container card with soft border (`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:shadow-md`).
- Status Chips:
  - **Approved**: `bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5`.
  - **Pending**: `bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5`.
  - **Rejected**: `bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5`.

---

## 5. UI Micro-Interactions & Animation Guidelines

1. **Button Active States**: `active:scale-[0.98] transition-transform duration-150 ease-out`.
2. **Page & Card Transitions**: Smooth fade and subtle vertical translate (`opacity-0 translate-y-2` to `opacity-100 translate-y-0` with `duration-200 ease-out`).
3. **Focus Visuals**: Always supply accessible focus outlines: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950`.
4. **Loading States**: Use Material skeleton loaders (`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl`) for data fetching instead of plain text "Loading...".

---

## 6. Execution Rules for AI Coding Agents (bolt.new / React / Tailwind)

1. **Use Lucide Icons**: Import icons from `lucide-react` (e.g., `Camera`, `ShieldCheck`, `UserCheck`, `BellRing`, `QrCode`, `Printer`, `AlertCircle`, `CheckCircle2`).
2. **Strict Accessibility**: Ensure all icon-only buttons have `aria-label` attributes and all inputs have corresponding `<label>` elements.
3. **Responsive Grid**: Layouts must automatically adjust from single-column mobile view (`grid-cols-1`) to multi-column desktop workstation view (`lg:grid-cols-12`).
4. **No Raw Unstyled Forms**: Never output standard browser-default inputs, select boxes, or buttons. Wrap all form elements in styled Material-inspired components.
