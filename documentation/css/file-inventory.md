# CSS File Inventory

**📍 Navigation:** [CSS Documentation](README.md) > File Inventory

## Overview

This document provides a comprehensive inventory of all CSS files in the project, detailing their specific roles, responsibilities, and key features. Each file serves a distinct purpose in the overall styling architecture.

## 📋 Table of Contents
- [File Structure](#file-structure)
- [1. style.css](#1-stylecss-3715-lines) - Core styles and glassmorphic tables
- [2. workspace.css](#2-workspacecss-1624-lines) - Workspace functionality
- [3. card-components.css](#3-card-componentscss-1200-lines) - Modular components
- [4. onboarding.css](#4-onboardingcss-800-lines) - Onboarding flow
- [5. briefcase-icon.css](#5-briefcase-iconcss-80-lines) - Custom icons
- [File Dependencies](#file-dependencies)
- [Performance Considerations](#performance-considerations)
- [Maintenance Guidelines](#maintenance-guidelines)

## 🔗 Related Documentation
- **[CSS Architecture](css-architecture.md)** - Architectural overview and design patterns
- **[Dependency Map](dependency-map.md)** - File relationships and import hierarchy
- **[Best Practices](best-practices.md)** - Guidelines for working with these files
- **[Cleanup Guide](clean.md)** - File-specific cleanup recommendations

## File Structure

```
client/css/
├── style.css              # Core styles and glassmorphic tables
├── workspace.css          # Workspace-specific features
├── card-components.css    # Modular card components
├── onboarding.css         # Agent selection and onboarding flow
└── briefcase-icon.css     # Custom icon implementations
```

---

## 1. style.css (3,255 lines)

**Primary Purpose:** Core application styles, typography system, and glassmorphic table implementation

### Key Responsibilities

#### Typography System
- **Font Integration:** Google Fonts Inter import with comprehensive weight support (100-900)
- **Heading Hierarchy:** Structured h1-h3 styles with consistent Inter font family
- **Text Elements:** Paragraph, list, blockquote, and emphasis styling
- **Code Formatting:** Inline code and pre-formatted code blocks with syntax highlighting

#### CSS Custom Properties System
- **Color Variables:** Complete color palette with semantic naming
  - `--colour-1` through `--colour-6` for primary colors
  - `--light-gray`, `--gray`, `--yellow` for UI elements
  - `--accent`, `--blur-bg`, `--blur-border` for glassmorphic effects
- **Layout Variables:** Spacing, border radius, and responsive breakpoints
- **Animation Variables:** Timing functions and transition durations

#### Glassmorphic Table System
- **Advanced Table Styling:** Complete glassmorphic table implementation with:
  - Backdrop blur effects and transparency layers
  - Animated borders with conic gradients
  - Interactive hover states with 3D transform effects
  - Row highlighting with "pull" effect toward user
  - Responsive design with touch device optimizations

#### Layout Components
- **Sidebar Push Menu:** Fixed sidebar with smooth slide animations
- **Chat Interface:** Responsive chat container with sidebar integration
- **Navigation:** Top navigation with glassmorphic styling
- **Modal System:** Overlay and modal base styles

#### Code Syntax Highlighting
- **Highlight.js Integration:** Custom color scheme for code blocks
- **Language Support:** Comprehensive syntax coloring for multiple languages
- **Responsive Code Blocks:** Mobile-optimized code display

### Notable Features
- **Performance Optimizations:** GPU-accelerated animations and transforms
- **Accessibility:** Focus states and reduced motion support
- **Mobile Responsiveness:** Comprehensive breakpoint system
- **Browser Compatibility:** Fallbacks for older browsers

> 📖 **Architecture Details:** See [CSS Architecture - Glassmorphic System](css-architecture.md#glassmorphic-effects) for implementation details
> 
> 🔧 **Best Practices:** Review [Performance Guidelines](best-practices.md#performance-optimization-guidelines) for optimization techniques

---

## 2. workspace.css (1,365 lines)

**Primary Purpose:** Workspace-specific functionality including canvas, cards, and zoom controls

### Key Responsibilities

#### Workspace Canvas System
- **Draggable Canvas:** Infinite scrollable workspace with grab/grabbing cursors
- **Dynamic Background:** Reactive dot pattern that adjusts with zoom levels
- **Transform Management:** Smooth zoom and pan transformations with GPU optimization
- **Scroll Behavior:** Natural scrolling with custom scrollbar styling

#### Card Management System
- **Card Positioning:** Absolute positioning system for draggable cards
- **Card States:** Hover, dragging, pinned, and selected states
- **Card Types:** Support for different card types (text, file, document)
- **Z-index Management:** Layered card system with proper stacking

#### Document Collaboration Mode
- **Document View:** Full-featured document editing interface
- **Real-time Indicators:** Collaboration status and sync indicators
- **Content Editing:** Rich text editing with markdown support
- **Document Structure:** Hierarchical content organization

#### Zoom Control System
- **Fixed Controls:** Glassmorphic zoom controls with consistent styling
- **Responsive Positioning:** Adaptive positioning based on screen size
- **Animation Integration:** Smooth zoom transitions with easing functions

#### Floating Menu System
- **Card Actions Menu:** Context-sensitive floating menu for card operations
- **Glassmorphic Design:** Consistent visual language with backdrop blur
- **Action Categories:** Organized actions (primary, edit, view, state, danger)
- **Responsive Behavior:** Adaptive menu sizing and positioning

### Notable Features
- **Performance Focus:** Optimized for smooth interactions and animations
- **Touch Support:** Mobile and tablet gesture support
- **Accessibility:** Keyboard navigation and screen reader support
- **Visual Consistency:** Unified glassmorphic design language

> 🔗 **Dependencies:** This file extends patterns from [style.css](#1-stylecss-3715-lines) - see [Dependency Map](dependency-map.md#workspace-dependencies-workspacecss)
> 
> 🎨 **Design System:** Uses glassmorphic patterns detailed in [CSS Architecture](css-architecture.md#glassmorphic-effects)

---

## 3. card-components.css (975 lines)

**Primary Purpose:** Modular card components and file handling functionality

### Key Responsibilities

#### File Card System
- **File Upload:** Drag-and-drop file upload interface with visual feedback
- **File Preview:** Image and PDF preview capabilities with controls
- **File Information:** Metadata display (name, size, type, upload date)
- **File Actions:** Upload, download, and preview action buttons

#### Card Type System
- **Type Selection:** Modal interface for choosing card types
- **Card Variants:** Text cards, file cards, and specialized card types
- **Visual Differentiation:** Distinct styling for different card purposes

#### Sync Status Indicators
- **Real-time Status:** Visual indicators for sync states (synced, modified, conflict, pending)
- **Animated Feedback:** Pulse and spin animations for status changes
- **Color Coding:** Semantic color system for different states

#### Modal Components
- **Card Type Selector:** Glassmorphic modal for card type selection
- **Responsive Design:** Mobile-optimized modal layouts
- **Accessibility:** Focus management and keyboard navigation

#### PDF Handling
- **PDF Rendering:** Canvas-based PDF display with page controls
- **Navigation Controls:** Previous/next page buttons with state management
- **Responsive Viewer:** Adaptive PDF display for different screen sizes

### Notable Features
- **Modular Architecture:** Reusable component system
- **File Type Support:** Comprehensive file format handling
- **Interactive Elements:** Rich user interaction patterns
- **Error Handling:** Graceful error states and fallbacks

---

## 4. onboarding.css (592 lines)

**Primary Purpose:** Agent selection interface and onboarding flow styling

### Key Responsibilities

#### Onboarding Container System
- **Full-screen Overlay:** Complete page takeover for onboarding experience
- **Slide Animations:** Smooth entry and exit transitions
- **Background Management:** Dot pattern background with proper layering

#### Agent Selection Interface
- **Agent Grid:** Responsive grid layout for agent cards
- **Search Functionality:** Real-time search with suggestions
- **Agent Cards:** Glassmorphic cards with hover effects and interactions

#### Agent Card Components
- **Card Structure:** Header, description, and control sections
- **Status Management:** Checkbox controls for agent activation
- **Visual Hierarchy:** Clear information architecture with typography

#### Search System
- **Search Input:** Styled search field with backdrop blur
- **Suggestions:** Dropdown suggestions with hover states
- **Filter Results:** Dynamic filtering of agent cards

#### Responsive Design
- **Mobile Optimization:** Touch-friendly interface for mobile devices
- **Adaptive Layout:** Flexible grid system for different screen sizes
- **Performance:** Optimized animations and transitions

### Notable Features
- **User Experience Focus:** Intuitive agent selection workflow
- **Visual Polish:** Consistent glassmorphic design language
- **Accessibility:** Keyboard navigation and screen reader support
- **Performance:** Smooth animations with reduced motion support

---

## 5. briefcase-icon.css (56 lines)

**Primary Purpose:** Custom briefcase icon implementation throughout the application

### Key Responsibilities

#### Icon Replacement System
- **FontAwesome Override:** Replaces standard folder icons with custom briefcase icons
- **SVG Implementation:** Base64-encoded SVG for crisp icon display
- **Context Adaptation:** Different icon sizes for various UI contexts

#### Icon Contexts
- **Workspace Header:** Large briefcase icon in workspace title
- **Navigation Items:** Medium-sized icons in navigation menus
- **Dropdown Items:** Small icons in dropdown menus
- **Repertoire Items:** Micro icons in legal document categories

#### Responsive Scaling
- **Size Variants:** Multiple icon sizes (14px, 16px, 18px, 20px, 24px)
- **Mobile Optimization:** Smaller icons for mobile interfaces
- **Retina Support:** High-resolution icon rendering

### Notable Features
- **Brand Consistency:** Unified briefcase iconography across the application
- **Performance:** Lightweight SVG implementation
- **Flexibility:** Easy size and color customization
- **Compatibility:** Works across different browsers and devices

---

## File Dependencies

### Import Hierarchy
1. **style.css** - Base styles, loaded first
2. **workspace.css** - Extends base styles for workspace functionality
3. **card-components.css** - Modular components building on base and workspace styles
4. **onboarding.css** - Standalone styles for onboarding flow
5. **briefcase-icon.css** - Icon overrides, loaded last

### External Dependencies
- **Google Fonts:** Inter font family (all weights)
- **FontAwesome:** Icon font library (partially overridden)
- **Highlight.js:** Code syntax highlighting (styled in style.css)

### Cross-file Relationships
- All files share CSS custom properties defined in style.css
- Workspace and card components share glassmorphic design patterns
- Responsive breakpoints are consistent across all files
- Color schemes and animation timings are unified

---

## Performance Considerations

### Optimization Techniques
- **GPU Acceleration:** `will-change` and `transform3d` for smooth animations
- **Efficient Selectors:** Minimal nesting and specific targeting
- **Reduced Repaints:** Strategic use of `transform` over layout properties
- **Conditional Loading:** Onboarding styles only loaded when needed

### File Sizes
- **style.css:** 3,255 lines (largest file, core functionality)
- **workspace.css:** 1,365 lines (workspace-specific features)
- **card-components.css:** 975 lines (modular components)
- **onboarding.css:** 592 lines (onboarding flow)
- **briefcase-icon.css:** 56 lines (icon overrides)

### Loading Strategy
- Critical styles (style.css) loaded first
- Feature-specific styles loaded as needed
- Icon overrides applied last to ensure proper replacement

---

## Maintenance Guidelines

### Code Organization
- Each file has clear section headers with `/* ========== */` delimiters
- Related styles are grouped together logically
- Responsive styles follow desktop-first approach
- Fallbacks provided for older browsers

### Naming Conventions
- BEM-like methodology for component classes
- Semantic class names describing function, not appearance
- Consistent prefix patterns for related components
- CSS custom properties use semantic naming

### Browser Support
- Modern browsers with CSS Grid and Flexbox support
- Backdrop-filter fallbacks for older browsers
- Progressive enhancement for advanced features
- Graceful degradation for unsupported properties

---

## 🔗 Related Documentation

- **[CSS Architecture](css-architecture.md)** - Complete architectural overview and design patterns
- **[Dependency Map](dependency-map.md)** - Visual file relationships and import hierarchy
- **[Best Practices](best-practices.md)** - Guidelines for working with these files
- **[Cleanup Guide](clean.md)** - File-specific maintenance recommendations

**📍 Navigation:** [CSS Documentation](README.md) > File Inventory
