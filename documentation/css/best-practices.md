# CSS Best Practices and Guidelines

**📍 Navigation:** [CSS Documentation](README.md) > Best Practices

## Introduction

This document provides comprehensive guidelines for working with the CSS architecture of the web application. These practices ensure consistency, maintainability, and optimal performance while preserving the established glassmorphic design language and responsive behavior.

## 📋 Table of Contents
- [Naming Conventions and Class Structure Patterns](#naming-conventions-and-class-structure-patterns)
- [Responsive Design and Performance Guidelines](#responsive-design-and-performance-guidelines)
- [Browser Compatibility Considerations](#browser-compatibility-considerations)
- [Troubleshooting Guides](#troubleshooting-guides)
- [Accessibility Best Practices](#accessibility-best-practices)
- [Code Organization Principles](#code-organization-principles)
- [Maintenance Workflow](#maintenance-workflow)

## 🔗 Related Documentation
- **[CSS Architecture](css-architecture.md)** - Architectural patterns and design system
- **[File Inventory](file-inventory.md)** - Understanding file structure and responsibilities
- **[Dependency Map](dependency-map.md)** - Safe modification practices
- **[Cleanup Guide](clean.md)** - Maintenance and optimization strategies

## Naming Conventions and Class Structure Patterns

### BEM-Inspired Methodology

The codebase follows a BEM-inspired naming convention with semantic class names that describe function rather than appearance:

#### Component Naming Pattern
```css
/* Block - Component */
.workspace-card { }

/* Element - Child component */
.workspace-card .card-header { }
.workspace-card .card-content { }

/* Modifier - Variant or state */
.workspace-card.document-mode { }
.workspace-card.dragging { }
.workspace-card.pinned { }
```

#### Established Naming Conventions

**Component Prefixes:**
- `workspace-` - Workspace-specific components
- `card-` - Card-related elements
- `agent-` - Onboarding and agent selection
- `menu-` - Menu and navigation elements
- `modal-` - Modal and overlay components

**State Modifiers:**
- `.active` - Active/selected state
- `.visible` - Visibility state
- `.dragging` - Interaction state
- `.loading` - Loading state
- `.error` - Error state

**Size Modifiers:**
- `-sm`, `-md`, `-lg` - Size variants
- `-mobile`, `-desktop` - Responsive variants

#### Semantic Class Examples
```css
/* ✅ Good - Describes function */
.chat-card-indicator { }
.floating-card-menu { }
.sync-status { }
.collaboration-indicator { }

/* ❌ Avoid - Describes appearance */
.blue-button { }
.big-text { }
.rounded-box { }
```

### CSS Custom Properties Naming

Follow the established variable naming pattern:

```css
:root {
  /* Color System */
  --colour-1: #ffffff;        /* Primary background */
  --colour-2: #f3f4e5;        /* Secondary background */
  --colour-3: #2f2f2e;        /* Primary text */
  --colour-4: #f9e479;        /* Accent color */
  
  /* Semantic Colors */
  --light-gray: #f7f7f7;
  --yellow: #F9E479;
  
  /* Layout Variables */
  --section-gap: 25px;
  --border-radius-1: 8px;
  --font-1: "Inter";
  
  /* Animation Variables */
  --anim--hover-time: 400ms;
  --anim--hover-ease: cubic-bezier(0.25, 1, 0.5, 1);
  --anim--apple-ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

> 📖 **Complete Variable System:** See [CSS Architecture - CSS Custom Properties](css-architecture.md#css-custom-properties-system) for full documentation

**Variable Naming Rules:**
- Use semantic names over descriptive names
- Group related variables with consistent prefixes
- Use double hyphens for animation variables (`--anim--`)
- Maintain backwards compatibility when updating variables

## Responsive Design and Performance Guidelines

### Mobile-First Approach

Always start with mobile styles and progressively enhance for larger screens:

```css
/* ✅ Mobile-first approach */
.workspace-card {
  width: calc(100vw - 40px);
  max-width: 300px;
  padding: 16px;
}

@media (min-width: 768px) {
  .workspace-card {
    width: 280px;
    padding: 24px;
  }
}

@media (min-width: 1200px) {
  .workspace-card {
    width: 320px;
  }
}
```

### Established Breakpoints

Use the consistent breakpoint system:

```css
/* Mobile */
@media (max-width: 480px) { }

/* Tablet */
@media (max-width: 990px) { }

/* Desktop */
@media (min-width: 991px) { }

/* Large Desktop */
@media (min-width: 1200px) { }
```

> 📖 **Responsive Strategy:** See [CSS Architecture - Responsive Design](css-architecture.md#responsive-design-strategy) for detailed implementation

### Performance Optimization Guidelines

#### GPU Acceleration
Use GPU acceleration for animations and transforms:

```css
/* ✅ Optimized for performance */
.workspace-card {
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.workspace-card.dragging {
  will-change: transform, left, top;
}

/* Remove will-change after animations */
.workspace-card:not(.dragging) {
  will-change: auto;
}
```

#### Efficient Selectors
- Avoid deep nesting (max 3 levels)
- Use specific class selectors over complex combinators
- Prefer classes over element selectors for styling

```css
/* ✅ Efficient selectors */
.card-header { }
.card-title { }
.card-actions { }

/* ❌ Avoid deep nesting */
.workspace .container .card .header .title { }
```

#### Animation Performance
Prefer `transform` and `opacity` for animations:

```css
/* ✅ Performant animations */
.workspace-card:hover {
  transform: translateY(-2px);
  opacity: 0.95;
}

/* ❌ Avoid layout-triggering properties */
.workspace-card:hover {
  top: -2px;
  width: 300px;
}
```

### Glassmorphic Design System

#### Core Glassmorphic Pattern
Use the established glassmorphic pattern for consistency:

```css
/* ✅ Standard Glassmorphic Component */
.glassmorphic-component {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
```

> 📖 **Implementation Details:** See [CSS Architecture - Glassmorphic Effects](css-architecture.md#glassmorphic-effects) for complete system documentation

#### Glassmorphic Variations
```css
/* ✅ Subtle glassmorphic effect - for background elements */
.glassmorphic-subtle {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

/* ✅ Strong glassmorphic effect - for primary UI elements */
.glassmorphic-strong {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(30px);
}
```

#### Fallbacks for Older Browsers
Always provide fallbacks for `backdrop-filter`:

```css
/* ✅ Progressive enhancement with fallbacks */
.glassmorphic-component {
  /* Fallback background for older browsers */
  background: rgba(255, 255, 255, 0.95);
  /* Modern backdrop filter */
  backdrop-filter: blur(25px);
}

/* ❌ Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(25px)) {
  .glassmorphic-component {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(0, 0, 0, 0.15);
  }
}
```

> 🔧 **Browser Support:** See [CSS Architecture - Browser Compatibility](css-architecture.md#browser-compatibility) for complete compatibility information

## Browser Compatibility Considerations

### Modern CSS Features Support

#### CSS Grid and Flexbox
- **CSS Grid**: Primary layout system (IE 11+ with `-ms-` prefixes)
- **Flexbox**: Secondary layout system (IE 10+)
- **Fallbacks**: Provide float-based fallbacks for critical layouts

```css
/* CSS Grid with fallback */
.layout-container {
  display: flex; /* Fallback */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

#### CSS Custom Properties
- **Support**: IE 11+ (limited support)
- **Fallbacks**: Provide static values for critical properties

```css
.component {
  color: #2f2f2e; /* Fallback */
  color: var(--colour-3);
}
```

#### Backdrop Filter
- **Support**: Modern browsers (Chrome 76+, Firefox 103+, Safari 9+)
- **Fallbacks**: Required for glassmorphic effects

```css
/* Always provide backdrop-filter fallbacks */
.modal-overlay {
  background: rgba(0, 0, 0, 0.5); /* Fallback */
  backdrop-filter: blur(4px);
}

@supports not (backdrop-filter: blur(4px)) {
  .modal-overlay {
    background: rgba(0, 0, 0, 0.7);
  }
}
```

### Vendor Prefixes

#### Required Prefixes
```css
/* Backdrop filter - Safari support */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);

/* Transform - older browsers */
transform: translateY(-2px);
-webkit-transform: translateY(-2px);

/* User select - cross-browser */
user-select: none;
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
```

#### Autoprefixer Configuration
The project should use Autoprefixer with these settings:
```json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not ie <= 10"
  ]
}
```

## Troubleshooting Guides

### Common Issues and Solutions

#### 1. Glassmorphic Effects Not Working

**Problem**: Backdrop blur not appearing
**Causes**:
- Browser doesn't support `backdrop-filter`
- Element doesn't have proper background
- Z-index issues

**Solutions**:
```css
/* Check browser support */
@supports (backdrop-filter: blur(10px)) {
  .glassmorphic {
    backdrop-filter: blur(10px);
  }
}

/* Ensure proper background */
.glassmorphic {
  background: rgba(255, 255, 255, 0.8); /* Required */
  backdrop-filter: blur(10px);
}

/* Fix z-index stacking */
.glassmorphic {
  position: relative;
  z-index: 1;
}
```

#### 2. Animation Performance Issues

**Problem**: Janky animations or poor performance
**Causes**:
- Animating layout properties
- Missing GPU acceleration
- Too many simultaneous animations

**Solutions**:
```css
/* Use transform instead of layout properties */
/* ❌ Causes layout thrashing */
.element {
  transition: width 0.3s, height 0.3s, top 0.3s;
}

/* ✅ GPU accelerated */
.element {
  transition: transform 0.3s, opacity 0.3s;
  will-change: transform;
}

/* Remove will-change after animation */
.element:not(.animating) {
  will-change: auto;
}
```

#### 3. Responsive Layout Issues

**Problem**: Layout breaks on certain screen sizes
**Causes**:
- Fixed widths instead of flexible units
- Missing responsive breakpoints
- Incorrect viewport units

**Solutions**:
```css
/* Use flexible units */
.container {
  width: calc(100vw - 40px); /* Flexible */
  max-width: 1200px; /* Constraint */
  padding: clamp(16px, 4vw, 32px); /* Scalable */
}

/* Test all breakpoints */
@media (max-width: 480px) { /* Mobile */ }
@media (max-width: 990px) { /* Tablet */ }
@media (min-width: 991px) { /* Desktop */ }
```

#### 4. Z-Index Conflicts

**Problem**: Elements appearing behind others unexpectedly
**Causes**:
- Inconsistent z-index values
- Stacking context issues
- Missing position property

**Solutions**:
```css
/* Establish z-index hierarchy */
:root {
  --z-sidebar: 999;
  --z-modal: 9999;
  --z-tooltip: 10000;
  --z-floating-menu: 1001;
}

/* Create stacking context */
.positioned-element {
  position: relative; /* Required for z-index */
  z-index: var(--z-floating-menu);
}
```

### Debugging Techniques

#### 1. CSS Debugging
```css
/* Temporary debugging borders */
* {
  outline: 1px solid red !important;
}

/* Debug specific components */
.workspace-card {
  background: rgba(255, 0, 0, 0.1) !important;
}
```

#### 2. Performance Debugging
```css
/* Highlight expensive repaints */
* {
  background: rgba(255, 0, 0, 0.2) !important;
}

/* Check for layout thrashing */
.debug-layout {
  outline: 2px solid blue;
}
```

### Browser-Specific Issues

#### Safari-Specific
```css
/* Fix Safari backdrop-filter bugs */
.safari-fix {
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  transform: translateZ(0); /* Force GPU layer */
}
```

#### Firefox-Specific
```css
/* Firefox scrollbar styling */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(47, 47, 46, 0.3) transparent;
}
```

#### Chrome-Specific
```css
/* Chrome scrollbar styling */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(47, 47, 46, 0.3);
  border-radius: 4px;
}
```

## Accessibility Best Practices

### Focus Management
```css
/* Visible focus indicators */
.interactive-element:focus-visible {
  outline: 2px solid var(--yellow);
  outline-offset: 2px;
}

/* Remove default outline when using custom focus */
.interactive-element:focus {
  outline: none;
}
```

### Reduced Motion Support
```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast
Ensure all color combinations meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  .text-element {
    color: #000000;
    background: #ffffff;
  }
}
```

## Code Organization Principles

### File Structure Guidelines
```css
/* File organization pattern */
/* ========== SECTION HEADER ========== */

/* Component styles */
.component-name { }

/* Component variants */
.component-name.variant { }

/* Component states */
.component-name:hover { }
.component-name.active { }

/* Responsive styles */
@media (max-width: 990px) {
  .component-name { }
}

/* ========== END SECTION ========== */
```

### Comment Standards
```css
/* ========== MAJOR SECTION ========== */

/* Subsection description */
.component {
  /* Property explanation when needed */
  backdrop-filter: blur(25px); /* Glassmorphic effect */
}

/* TODO: Future enhancement */
/* FIXME: Known issue to address */
/* NOTE: Important implementation detail */
```

### Import Organization
```css
/* External imports first */
@import url("https://fonts.googleapis.com/css2?family=Inter...");

/* CSS custom properties */
:root { }

/* Base styles */
* { }
html, body { }

/* Components (alphabetical order) */
.card-components { }
.modal-components { }
.workspace-components { }

/* Responsive styles */
@media queries...
```

## Maintenance Workflow

### Regular Maintenance Tasks

#### Monthly Reviews
- [ ] Check for unused CSS rules
- [ ] Validate color contrast ratios
- [ ] Test responsive behavior
- [ ] Update browser compatibility

#### Quarterly Audits
- [ ] Performance analysis
- [ ] File size optimization
- [ ] Dependency updates
- [ ] Documentation updates

### Code Review Checklist

#### New CSS Additions
- [ ] Follows naming conventions
- [ ] Uses existing CSS variables
- [ ] Includes responsive styles
- [ ] Has browser fallbacks
- [ ] Includes focus states
- [ ] Supports reduced motion

#### Performance Checklist
- [ ] Uses efficient selectors
- [ ] Avoids layout-triggering animations
- [ ] Includes GPU acceleration hints
- [ ] Minimizes repaints and reflows

### Version Control Best Practices

#### Commit Messages
```
feat(css): add glassmorphic modal component
fix(css): resolve Safari backdrop-filter issue
refactor(css): consolidate color variables
perf(css): optimize animation performance
```

#### Branch Naming
```
feature/glassmorphic-tables
bugfix/safari-backdrop-filter
refactor/css-variables-consolidation
performance/animation-optimization
```

## Conclusion

These guidelines ensure consistent, maintainable, and performant CSS code that aligns with the established glassmorphic design system. Regular adherence to these practices will maintain code quality and facilitate future development while preserving the application's visual identity and user experience.

Remember to always test changes across different browsers and devices, and prioritize accessibility and performance in all implementations.

---

## 🔗 Related Documentation

- **[CSS Architecture](css-architecture.md)** - Architectural patterns and design system overview
- **[File Inventory](file-inventory.md)** - Understanding file structure and responsibilities  
- **[Dependency Map](dependency-map.md)** - Safe modification practices and dependency relationships
- **[Cleanup Guide](clean.md)** - Maintenance strategies and optimization recommendations

**📍 Navigation:** [CSS Documentation](README.md) > Best Practices
