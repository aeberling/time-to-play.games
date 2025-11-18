# Time to Play - Brand Style Guide

> **Tagline:** Gather Your Party—The Game Awaits

## 🎨 Design Philosophy

Time to Play embraces a whimsical, Adventure Time-inspired aesthetic that brings joy, playfulness, and excitement to tabletop gaming. Our design is bold, colorful, and unapologetically fun!

### Core Principles
- **Bold & Playful**: Big, chunky borders and rounded corners create a cartoon-like, friendly feel
- **Vibrant Colors**: Our palette is inspired by adventure and fantasy, using bright, saturated colors
- **Animated & Alive**: Subtle animations bring personality and delight to every interaction

---

## 🎨 Color Palette

### Adventure (Light Purple/Lavender)
Primary brand color for navigation, text, and backgrounds.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#faf8ff` | Lightest backgrounds |
| 100 | `#f6f1fe` | Light backgrounds |
| 200 | `#e9defc` | Subtle backgrounds |
| 300 | `#ddcbfa` | Borders, dividers |
| 400 | `#d0b8f7` | Hover states |
| 500 | `#c3a5f4` | Primary purple |
| 600 | `#ad8fea` | Active states |
| 700 | `#9779d1` | Text on light |
| 800 | `#8163b8` | Dark text |
| 900 | `#6b4d9e` | Darkest purple |

### Quest (Bright Golden Yellow)
Used for CTAs, buttons, highlights, and stars.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#fffcf0` | Lightest backgrounds |
| 100 | `#fff5d6` | Light backgrounds |
| 200 | `#ffedad` | Subtle backgrounds |
| 300 | `#ffe485` | Borders, highlights |
| 400 | `#ffdb5c` | Hover states |
| 500 | `#ffd333` | Primary yellow |
| 600 | `#ffc107` | Bright yellow |
| 700 | `#e6b01e` | Active states |
| 800 | `#d4a017` | Dark yellow |
| 900 | `#b8860b` | Darkest gold |

### Treasure (Muted Teal/Sage)
Used for mountains, nature elements, and secondary features.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#f5faf9` | Lightest backgrounds |
| 100 | `#e5f3f0` | Light backgrounds |
| 200 | `#cbe1dc` | Subtle backgrounds |
| 300 | `#b1cfc8` | Borders, dividers |
| 400 | `#97bdb4` | Hover states |
| 500 | `#7daba0` | Primary teal |
| 600 | `#6d978d` | Active states |
| 700 | `#5d837a` | Mountains, nature |
| 800 | `#4d6e67` | Dark teal |
| 900 | `#3d5a54` | Darkest teal |

### Coral (Hot Pink/Magenta)
Used for CTAs, game cards, and accent elements.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#fff0f7` | Lightest backgrounds |
| 100 | `#ffd6eb` | Light backgrounds |
| 200 | `#ffadd6` | Subtle backgrounds |
| 300 | `#ff85c2` | Borders, highlights |
| 400 | `#ff5cad` | Hover states |
| 500 | `#ff3399` | Primary pink |
| 600 | `#ff0080` | Bright pink |
| 700 | `#eb006c` | Active states |
| 800 | `#d9005d` | Dark pink |
| 900 | `#c7004e` | Darkest pink |

### Cyan (Bright Turquoise)
Used for sky gradients, backgrounds, and water elements.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#f0fcfe` | Lightest backgrounds |
| 100 | `#ccf6fb` | Light backgrounds |
| 200 | `#99eef8` | Subtle backgrounds |
| 300 | `#66e5f4` | Borders, highlights |
| 400 | `#33ddf1` | Sky gradients |
| 500 | `#00d4ed` | Primary cyan |
| 600 | `#00bfda` | Active states |
| 700 | `#00a8c0` | Buttons, links |
| 800 | `#0091a6` | Dark cyan |
| 900 | `#007a8c` | Darkest cyan |

---

## ✍️ Typography

### Font Family
- **Primary**: Figtree (sans-serif)
  - Used for all body text, buttons, and general UI elements

### Font Weights
- **font-bold** (700): Body text, descriptions
- **font-black** (900): All headings, buttons, emphasis

### Heading Hierarchy

| Element | Classes | Usage |
|---------|---------|-------|
| Hero H1 | `text-7xl font-black` | Main hero titles |
| Section H2 | `text-5xl font-black` | Section headings |
| Card H3 | `text-3xl font-black` | Card titles |
| Body Large | `text-xl font-bold` | Hero descriptions |
| Body Regular | `text-lg font-bold` | Standard text |

---

## 🔘 Button Styles

### Primary Button
```jsx
<button className="rounded-full bg-gradient-to-br from-quest-500 to-quest-600 px-12 py-4 text-xl font-black text-white shadow-lg border-8 border-white transition hover:scale-110 hover:shadow-2xl transform">
  Start Adventure!
</button>
```

### Secondary Button
```jsx
<button className="rounded-full border-8 border-adventure-700 bg-white px-12 py-4 text-xl font-black text-adventure-900 transition hover:scale-110 shadow-lg">
  Learn More
</button>
```

### CTA Button (Coral)
```jsx
<button className="rounded-full bg-gradient-to-br from-coral-500 to-coral-600 px-14 py-6 text-2xl font-black text-white shadow-2xl border-8 border-white transition hover:scale-110 hover:rotate-2 transform">
  Join the Party!
</button>
```

---

## 🎴 Card Styles

### Feature Card
```jsx
<div className="rounded-3xl bg-gradient-to-br from-treasure-400 to-treasure-500 p-8 border-8 border-white shadow-2xl transition hover:scale-105 hover:rotate-2 transform">
  {/* Icon */}
  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-treasure-700 shadow-lg mb-6 text-4xl font-black border-4 border-treasure-700">
    🎲
  </div>
  {/* Content */}
  <h3 className="text-3xl font-black text-white mb-3 drop-shadow-md">Feature Title</h3>
  <p className="text-xl text-white font-bold leading-relaxed">Description text here.</p>
</div>
```

### Game Card
```jsx
<div className="overflow-hidden rounded-3xl bg-white border-8 border-adventure-700 shadow-2xl transition hover:scale-105 hover:-rotate-1 transform">
  {/* Header Image */}
  <div className="h-56 bg-gradient-to-br from-coral-400 via-coral-500 to-coral-600 relative overflow-hidden flex items-center justify-center">
    <div className="text-9xl animate-wiggle-slow">⚔️</div>
  </div>
  {/* Content */}
  <div className="p-8 bg-gradient-to-br from-coral-50 to-white">
    <h3 className="text-4xl font-black text-adventure-900 mb-3">War</h3>
    <p className="text-xl text-adventure-800 font-bold mb-6 leading-relaxed">Description</p>
  </div>
</div>
```

### Placeholder Card
```jsx
<div className="rounded-3xl border-8 border-dashed border-adventure-700 bg-white/60 backdrop-blur-sm transition hover:scale-105 hover:rotate-1 transform hover:border-solid hover:bg-white/80">
  <div className="flex h-full flex-col items-center justify-center p-10 text-center min-h-[400px]">
    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-quest-400 to-quest-600 text-white text-6xl mb-6 border-8 border-white shadow-xl">
      ✨
    </div>
    <h3 className="text-3xl font-black text-adventure-900 mb-3">Coming Soon!</h3>
    <p className="text-xl text-adventure-700 font-bold leading-relaxed">Description</p>
  </div>
</div>
```

---

## ✨ Animations

### Available Animations
- `animate-wiggle-slow`: Gentle rotation wiggle (3s)
- `animate-float`: Vertical floating motion (3s)
- `animate-float-slow`: Slower vertical floating (6s)
- `animate-bounce-slow`: Gentle bounce effect (3s)
- `animate-pulse`: Opacity pulse effect
- `animate-sway`: Horizontal swaying motion (4s)

### Hover Effects
- `hover:scale-110`: Slight scale up on hover
- `hover:rotate-2`: Gentle rotation on hover
- `hover:-rotate-2`: Gentle rotation (opposite direction) on hover
- `hover:shadow-2xl`: Large shadow on hover

---

## 📐 Spacing & Layout

### Container
```jsx
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Section Spacing
```jsx
<section className="py-16 md:py-20">
  {/* Section content */}
</section>
```

### Card Padding
- Interior: `p-8`
- Compact: `p-6`
- Large: `p-10`

---

## 🎯 Design Guidelines

### ✅ Do This
- Use `rounded-3xl` for major containers
- Apply `border-8` for prominent borders
- Use `font-black` for headings
- Add `drop-shadow-lg` for depth
- Include hover states with `scale`/`rotate`
- Use emojis for visual interest
- Keep copy fun and energetic

### ❌ Avoid This
- Sharp corners (use rounded)
- Thin borders (go chunky!)
- Light font weights (use bold/black)
- Flat, lifeless designs
- Static elements (add animation!)
- Corporate, serious language
- Muted, dull colors

---

## 🎪 Common Patterns

### Background Gradients
```jsx
// Sky gradient
bg-gradient-to-b from-cyan-400 via-adventure-400 to-adventure-200

// Feature section
bg-gradient-to-r from-quest-500 via-quest-600 to-coral-500

// Card background
bg-gradient-to-br from-coral-50 to-white
```

### Border Patterns
```jsx
// Thick white border
border-8 border-white

// Thick colored border
border-8 border-adventure-700

// Dashed placeholder
border-8 border-dashed border-adventure-700
```

### Text Effects
```jsx
// Drop shadow
drop-shadow-lg

// Text stroke (custom CSS class)
text-stroke-adventure  // Purple outline
text-stroke-white      // White outline
```

---

## 🎮 Voice & Tone

### Language Style
- **Energetic & Fun**: "Rally your crew!", "Let's Do This!", "Epic Adventures!"
- **Inclusive & Friendly**: "Join the party!", "Gather your crew"
- **Gaming References**: RPG and D&D inspired ("Gather Your Party", "Roll the dice")
- **Playful Humor**: Light, whimsical, never corporate

### Example Phrases
- ✅ "Rally your crew and dive into epic tabletop adventures!"
- ✅ "Whether you're slaying dragons or just stealing sheep, glory awaits!"
- ✅ "No waiting, no downloading, no boring setup!"
- ❌ "Our platform provides comprehensive gaming solutions"
- ❌ "Optimize your gameplay experience"

---

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Considerations
- Touch-friendly button sizes (min 44px)
- Readable font sizes (min 16px for body)
- Adequate spacing for fat fingers
- Simplified layouts on small screens

---

## 🔗 Quick Links

- **Style Guide Page**: `/style-guide` (Live visual reference)
- **Color Palette**: See this document or `/style-guide`
- **Component Examples**: See `/style-guide` for live examples

---

## 📝 Notes

- Always test hover states and animations
- Ensure sufficient color contrast for accessibility
- Use semantic HTML for better SEO
- Keep animations smooth and performant
- Emoji usage is encouraged for visual interest!

---

**Last Updated**: 2025-01-17
**Version**: 1.0.0

🎲 Keep it bold, keep it playful, keep it fun!
