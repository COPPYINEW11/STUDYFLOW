---
name: FCAID StudyFlow
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#454652'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#757684'
  outline-variant: '#c5c5d4'
  surface-tint: '#4355b9'
  primary: '#24389c'
  on-primary: '#ffffff'
  primary-container: '#3f51b5'
  on-primary-container: '#cacfff'
  inverse-primary: '#bac3ff'
  secondary: '#006b5c'
  on-secondary: '#ffffff'
  secondary-container: '#68fadd'
  on-secondary-container: '#007261'
  tertiary: '#643900'
  on-tertiary: '#ffffff'
  tertiary-container: '#854d00'
  on-tertiary-container: '#ffc893'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee0ff'
  primary-fixed-dim: '#bac3ff'
  on-primary-fixed: '#00105c'
  on-primary-fixed-variant: '#293ca0'
  secondary-fixed: '#68fadd'
  secondary-fixed-dim: '#44ddc1'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005145'
  tertiary-fixed: '#ffdcbe'
  tertiary-fixed-dim: '#ffb870'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 16px
  stack-gap: 12px
  inline-gap: 8px
  section-padding: 24px
  grid-columns: '4'
---

## Brand & Style
The brand personality is **Professional, Focused, and Smart**, designed to transform the chaotic energy of studying into a structured, rhythmic flow. The design system adopts a **Modern Corporate** style with **Glassmorphic accents**, prioritizing data density without sacrificing clarity. 

The aesthetic is built on high-utility layouts that feel dependable and intelligent. We use subtle background blurs and vibrant glow effects specifically for AI-driven features to distinguish "static" data from "dynamic" AI insights. The emotional response should be one of calm productivity and "cognitive ease"—where the user feels the interface is working as hard as they are.

## Colors
The palette is engineered for cognitive focus and clear status communication.

- **Primary (Deep Indigo):** Used for the core structural elements, active states in navigation, and primary "deep work" actions.
- **Secondary (Soft Mint):** Reserved for positive reinforcement, completion states, and progress bars. It signifies "growth" and "success."
- **Accent (Vibrant Orange):** High-visibility color used exclusively for temporal urgency—timers, upcoming deadlines, and critical warnings.
- **Neutral (Deep Charcoal):** Provides the foundation for typography and dark-mode surfaces.
- **Semantic Tints:** Use a 5% opacity version of the Primary Indigo for card backgrounds to separate "Study Areas" from the main background.

## Typography
The system uses **Inter** for all primary communication to ensure maximum legibility for Korean and Latin characters. A secondary monospaced font, **JetBrains Mono**, is introduced for time-stamps, duration labels, and statistical data to provide a "technical/precise" feel.

- **Hierarchy:** Use `display-lg` for daily goal percentages and `headline-md` for subject titles.
- **Korean Optimization:** Set `word-break: keep-all` for Korean text to prevent awkward line breaks in study notes.
- **Data Display:** All timer displays and countdowns should use `label-md` or `label-sm` to emphasize the systematic nature of the study flow.

## Layout & Spacing
This design system utilizes a **Mobile-First Fluid Grid** with a tight spacing rhythm (4px base unit) to maximize information density for complex timetables.

- **Margins:** A standard 16px lateral margin ensures content doesn't feel cramped while maximizing horizontal real estate.
- **Density:** Use 12px gaps between task cards to allow for a "glanceable" list view.
- **Safe Areas:** Ensure the bottom 80px are reserved for the 5-icon Tab Bar and the floating AI action button.
- **Reflow:** On larger mobile screens (e.g., Foldables), the 4-column grid expands, but task cards maintain a maximum width of 400px to ensure line-length readability.

## Elevation & Depth
Depth is used to distinguish between "Plan" and "Action."

- **Level 0 (Background):** Solid `#FFFFFF` or `#121212`.
- **Level 1 (Cards):** Low-contrast outlines (1px solid, 10% Indigo) with no shadow. Used for secondary tasks or inactive schedule blocks.
- **Level 2 (Active Tasks):** Soft ambient shadows (Y: 4, Blur: 12, Opacity: 0.08) with a 2% Primary tint. This highlights the current focus.
- **Level 3 (AI Components/Modals):** Glassmorphic surfaces with a 16px backdrop blur and a 0.5px white border.
- **AI FAB Glow:** The Floating Action Button uses a 20px spread radial gradient glow (`#3F51B5` at 30% opacity) to signify its "always-on" intelligence.

## Shapes
The shape language is consistently **Rounded**, striking a balance between professional rigor and modern approachability.

- **Default (0.5rem):** Standard for task cards, input fields, and checkboxes.
- **Large (1rem):** Used for persistent bottom sheets and main dashboard containers.
- **Full (Pill):** Used for the AI FAB, chips (tags), and progress bar caps.
- **Charts:** Line graphs should use a 2px stroke width with smoothed Bezier curves rather than sharp angles to reinforce the "Flow" concept.

## Components

### Buttons & Inputs
- **Primary Button:** Deep Indigo background, white text, 8px corner radius. Heavyweight typography.
- **AI FAB:** Circular button with the Primary-to-Secondary gradient. Apply a persistent "pulse" animation to the outer glow.
- **Input Fields:** Bottom-aligned labels with a focus state that changes the border color to Primary Indigo.

### Navigation
- **Bottom Tab Bar:** 5-icon layout. Active state uses the Primary color with a subtle dot indicator below the icon. Inactive states are mid-gray.

### Cards & Progress
- **Subject Cards:** Use a vertical color-strip on the left edge (keyed to the subject color) to allow for quick scanning of the timetable.
- **Progress Chips:** Small, pill-shaped indicators in Soft Mint for "Done" or "On Track."

### Data Visualization
- **Line Charts:** Use a semi-transparent area fill below the line using the Secondary (Mint) color to represent "Study Volume."
- **Timeline Tasks:** A vertical line connector between cards creates a sense of chronological flow. Current time is indicated by a horizontal Vibrant Orange line.