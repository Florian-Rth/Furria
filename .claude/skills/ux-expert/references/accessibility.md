# Accessibility — WCAG 2.2 AA in Practice

Accessibility is not a checklist at the end. It's a property of the design from the start. WCAG 2.2 AA is the floor for any product that serves the public, employees, or anyone who isn't you.

The senior move: don't recite WCAG. Find the issue, name it concretely, cite the criterion when useful, recommend a specific fix.

## The issues that come up most

### 1. Color contrast (1.4.3 AA, 1.4.11 AA)

- Text against background: **4.5:1** for normal text, **3:1** for large text (≥18pt or ≥14pt bold).
- UI components and graphical objects (icons, focus rings, form borders): **3:1** against adjacent colors.
- Disabled state is *exempt* from contrast requirements — but if you're using "disabled-looking" gray for active text, you've failed.

**Common failures:** Light gray placeholder text. White text on yellow buttons. Brand-colored secondary text (looks designy, fails contrast).

**Fix:** Test with a contrast checker (Stark, axe, browser devtools). For Material themes, this means picking primary/secondary colors that pass against `onPrimary`/`onSecondary`.

### 2. Target size (2.5.8 AA, new in 2.2)

- Touch and click targets must be at least **24×24 CSS pixels** (with limited exceptions: inline targets, exactly-sized native controls, essential targets).
- The recommended size for comfortable touch is **44×44** (the iOS HIG minimum) or **48×48** (Material).

**Common failures:** Icon buttons sized at 20×20. Close buttons that are just an `×` glyph. Tightly packed action rows.

**Fix:** MUI `IconButton` defaults to 40×40 (medium) or 48×48 (large) — keep it. Add padding around clickable text links.

### 3. Keyboard accessibility (2.1.1 A, 2.4.7 AA)

Every interactive element must be reachable and operable by keyboard alone, and the current focus must be visible.

**Common failures:**
- `<div onClick={...}>` instead of a button — not focusable.
- Custom dropdowns that don't open on Enter/Space.
- Modals that don't trap focus, or don't return focus to the trigger on close.
- Focus rings styled away with `outline: none` and never replaced.

**Fix:** Use semantic elements (`<button>`, `<a>`). Use MUI components — they handle this. If you must build custom, follow ARIA Authoring Practices for the pattern. Never remove focus indicators without replacing them with something visible.

### 4. Labels and names (1.3.1 A, 4.1.2 A)

Every form control needs an accessible name. Every icon-only button needs an accessible name. Every image needs alt text (or `alt=""` if decorative).

**Common failures:**
- `<TextField placeholder="Email">` with no `label`. Placeholder is not a label.
- `<IconButton><DeleteIcon /></IconButton>` with no `aria-label`.
- Icon buttons in tables (delete, edit) with no labels — unusable for screen readers.
- Decorative images without `alt=""`, so they get announced as "image."

**Fix:** Always pass `label` to TextField. Always pass `aria-label` (or `aria-labelledby`) to icon-only IconButton. Mark decorative imagery `alt=""`.

### 5. Error identification and suggestion (3.3.1 A, 3.3.3 AA)

Errors must be identified in text (not just color), and suggestions must be provided when known.

**Common failures:**
- Red border on a field with no message.
- "Invalid input" with no indication of what's invalid.
- Color-only error indication (red border, but no text).

**Fix:** Always pair color with a text message. The message should describe the problem and the fix: "Email must include an @ symbol."

### 6. Reduced motion (2.3.3 AAA, but treat as table stakes)

Honor `prefers-reduced-motion: reduce`. Some users get nausea or vestibular symptoms from animation.

**Fix:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Or in JS, check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip large transitions.

### 7. Heading hierarchy (1.3.1 A, 2.4.6 AA)

One `<h1>` per page. Don't skip levels. Don't use heading tags for visual styling.

**Common failures:** Pages with no `<h1>`. Three `<h2>`s under different parents. Text styled to look like a heading but using a `<div>`.

**Fix:** In MUI, use `Typography` with `component="h1"` (or h2, etc.) when you need a specific tag, regardless of variant. `<Typography variant="h4" component="h1">` is fine — visual h4, semantic h1.

### 8. Focus management in dynamic UIs (2.4.3 A)

When a modal opens, focus moves into it. When it closes, focus returns to the trigger. When a route changes in an SPA, focus moves to the new content's heading. When new content appears (like async-loaded results), it's announced.

**Common failures:** Closing a modal sends focus to the top of the page. Route changes leave focus on whatever was clicked, screen readers stay quiet. Async results appear with no announcement.

**Fix:** MUI `Dialog` handles focus trap and return. For SPAs, manage focus on route change (move it to the page's `<h1>` or main landmark). Use `aria-live` regions for async updates.

## Quick testing recipe

1. **Tab through the page.** Can you reach everything? Is the focus visible? Does the order make sense?
2. **Use VoiceOver / NVDA on the page.** Does it announce form fields with their labels? Are buttons identified by their action? Are icon-only buttons named?
3. **Zoom to 200%.** Does anything break or get cut off? (1.4.10 AA — content reflow.)
4. **Run axe DevTools.** It catches the mechanical issues fast — won't catch every cognitive issue, but it's a great first pass.
5. **Try `prefers-reduced-motion: reduce` in browser devtools.** Does the UI still work?
6. **Tab through with a screen reader running.** Many issues only surface when both modes are combined.

## Things people get wrong about accessibility

- **"We'll do accessibility in a later phase."** No, you'll do an accessibility *audit* in a later phase, and it'll be 5x more expensive than building it right.
- **"Our users don't have disabilities."** ~15% of the global population has some disability, plus situational disabilities (broken arm, bright sunlight, holding a baby) hit everyone.
- **"Accessibility makes design boring."** No, *bad* accessibility makes design boring. Good accessible design is just good design. Apple's products pass WCAG and look great.
- **"Just add ARIA."** ARIA is a last resort. Native semantic HTML beats ARIA almost every time. Rule of ARIA #1: don't use ARIA if you can use HTML.

## When you spot an accessibility issue

Be specific. Don't say "improve accessibility." Say:

> The "Delete" icon button in row 3 has no accessible name. Screen reader users will hear "button" with no context. Fix: add `aria-label="Delete invoice {invoice.id}"` to the IconButton, including the row context so it's distinguishable from the others.

That's the level of specificity a senior expert delivers.
