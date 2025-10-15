# AcademicFlow Design Guidelines

## Design Philosophy
Modern, minimal, professional workspace inspired by Notion meets Linear. Clean, distraction-free interfaces with purposeful animations and clear visual hierarchy.

## Color System

**Primary Colors:**
- Primary: #4F46E5 (Indigo 600)
- Secondary: #8B5CF6 (Purple 500)
- Success: #10B981 (Emerald 500)
- Warning: #F59E0B (Amber 500)
- Danger: #EF4444 (Red 500)
- Neutral: #6B7280 (Gray 500)

**Backgrounds:**
- Background: #F9FAFB (Gray 50)
- Card Background: #FFFFFF (White)
- Gradient Hero: Indigo to Purple gradient

## Typography

**Font Families:**
- Primary: Inter
- Code: JetBrains Mono

**Weights & Styles:**
- Headings: 600 weight
- Body text: 400 weight
- Line height: 1.5
- Font size: 16px base for inputs and body text

## Layout System

**Spacing Scale (Tailwind units):**
- Use: 4, 8, 16, 24, 32, 48, 64 pixel increments
- Base unit: 16px
- Card padding: 24px
- Consistent vertical rhythm throughout

**Border Radius:**
- Cards: 12px
- Buttons: 8px
- Inputs: 8px
- Modals: 16px

**Shadows:**
- Default: 0 1px 3px rgba(0,0,0,0.1) (subtle)
- Hover state: Enhanced shadow with slight lift

## Core Components

**Buttons:**
- Primary: Indigo background, white text, hover lift effect (2px translateY)
- Secondary: White background, indigo border, indigo text
- Sizes: sm (py-2 px-4), md (py-3 px-6), lg (py-4 px-8)
- Active state: scale(0.98)
- Transition: all 150ms ease

**Cards:**
- White background, 12px border radius
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: translateY(-2px) with increased shadow
- Padding: 24px
- Transition: all 150ms ease

**Input Fields:**
- Border: 1px solid gray-300
- Focus: Indigo-500 border with glow effect
- Border radius: 8px
- Padding: 12px 16px

**Modals:**
- Backdrop: Blur effect with dark overlay (opacity 0.5)
- Modal container: White background, centered, max-width 600px
- Border radius: 16px
- Animation: Slide-in from bottom (200ms)
- Close on backdrop click or × button

**Badges:**
- Small rounded pills with contextual colors
- Success: green-100 bg, green-700 text
- Warning: amber-100 bg, amber-700 text
- Danger: red-100 bg, red-700 text
- Neutral: gray-100 bg, gray-700 text
- Padding: 4px 12px, font size: 14px

## Page-Specific Designs

**Landing Page:**
- Clean hero with indigo-to-purple gradient background
- Headline: "Modern Academic Workspace"
- Subheadline: "Share. Cite. Verify."
- CTA buttons: Primary "Get Started", Secondary "Learn More"
- Three feature cards below hero (icons: file-text, check-circle, shield)
- Footer with links

**Dashboards (Student & Faculty):**
- Top navigation: Logo, Search bar, Profile dropdown
- Welcome section with greeting and emoji
- 2x2 Quick Action Grid with icon cards
- Recent activity/notes section
- Floating "+" button (bottom right) for quick actions

**Editor Pages:**
- Minimal header: Back button, inline-editable title, Share button, More menu (⋮)
- Full-width distraction-free editor area
- Floating toolbar on text selection (Bold, Italic, Link, Code, Upload, AI, Cite)
- Collapsible right sidebar for citations and files
- Bottom status bar: "Auto-saved X min ago ✓"

**Faculty Tools:**
- Large textarea (600px height) for content input
- Drag-and-drop file upload areas
- Results sections with color-coded cards and status badges
- Analysis details in expandable sections
- Export/Download report buttons

## Animations & Interactions

**Page Transitions:**
- Fade in on load (300ms)
- Smooth route transitions using Framer Motion

**Micro-interactions:**
- Button hover: Lift 2px, increase shadow
- Button active: Scale down to 0.98
- Card hover: Lift with enhanced shadow
- All transitions: 150ms ease-in-out

**Modal Animations:**
- Slide-in from bottom (200ms)
- Backdrop blur fade-in

## Images

**Landing Page Hero:**
- Large background gradient (indigo to purple) - no photo needed
- Feature cards use lucide icons (file-text, check-circle, shield)

**Dashboard Cards:**
- Use emoji icons (📝, ✏️, 💻, 🔍, 🤖, ✓, 📊, 📤) for quick visual identification
- No background images needed - clean minimal cards with icons

This design system prioritizes clarity, professionalism, and minimal distraction while maintaining visual interest through purposeful color use, smooth animations, and clean typography.