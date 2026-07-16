# Nielsen's 10 Usability Heuristics

Use these as a checklist for heuristic reviews. For each one, ask: "Does this design respect this principle? If not, what's the user impact?"

## 1. Visibility of system status
The system should always keep users informed about what's going on, through appropriate feedback within reasonable time.

**Common violations:** Silent saves with no confirmation. Long loads with no progress indicator. Form submission with no success state. A button that's been clicked but gives no acknowledgment.

**Fix patterns:** Loading skeletons (not spinners for known content shapes), optimistic UI, toast/snackbar confirmation for completed actions, progress bars for anything > 1s, status chips for entity state.

## 2. Match between system and the real world
Speak the user's language, not the developer's. Use words, phrases, and concepts familiar to the user.

**Common violations:** "Entity not found" instead of "We couldn't find that customer." Database column names leaking into UI. Jargon from the org that the user doesn't share.

**Fix patterns:** Write microcopy like you're talking to one specific user. Read it out loud. If it sounds like a system log, rewrite it.

## 3. User control and freedom
Users often perform actions by mistake. Provide clearly marked emergency exits.

**Common violations:** No "undo" after destructive actions. Modals you can't escape with Esc. Multi-step flows with no "back" button. "Are you sure?" dialogs as the only safety net.

**Fix patterns:** Undo over confirm where possible (Gmail-style snackbar with Undo). Esc closes modals. Backbutton-aware routing in SPAs. Confirmation dialogs only for truly destructive, non-reversible actions.

## 4. Consistency and standards
Users shouldn't have to wonder whether different words, situations, or actions mean the same thing. Follow platform conventions.

**Common violations:** Three different button styles for the same action across screens. iOS "Cancel" on the left in one place, on the right in another. Reinventing common patterns when the user already knows the standard one.

**Fix patterns:** Lock down a design system with rules, not just components. If you're using Material, follow Material's conventions for button placement (primary on the right in Western LTR contexts is the M3 default for dialogs).

## 5. Error prevention
Even better than good error messages is a careful design that prevents a problem from occurring in the first place.

**Common violations:** Letting users submit a form and *then* telling them the date is invalid. A "Delete" button right next to "Save" with no visual differentiation. Allowing typos in critical fields with no inline validation.

**Fix patterns:** Inline validation as the user types (but don't yell at them while they're still typing the field). Constrained inputs (date pickers, not free text dates). Visual separation between safe and destructive actions. Defaults that match the most common case.

## 6. Recognition rather than recall
Minimize the user's memory load by making elements, actions, and options visible.

**Common violations:** Asking the user to remember a code from a previous step. CLI-style interfaces where the user must remember commands. Settings buried 4 menus deep with no breadcrumbs.

**Fix patterns:** Show, don't make them remember. Autocomplete, recently-used lists, breadcrumbs, persistent context (showing what they're editing in the header).

## 7. Flexibility and efficiency of use
Accelerators — unseen by the novice user — may often speed up the interaction for the expert user.

**Common violations:** No keyboard shortcuts in apps used daily. Power users forced through the same wizard as first-timers. No bulk actions in tables.

**Fix patterns:** Keyboard shortcuts (with a `?` overlay to discover them). Saved views, filters, and templates. Bulk select with multi-action toolbar. Command palette (⌘K) for power users.

## 8. Aesthetic and minimalist design
Interfaces should not contain information which is irrelevant or rarely needed. Every extra unit of information competes with the relevant units.

**Common violations:** Dashboards that show 40 metrics when 5 would do. Forms with every possible field, all required. Marketing copy in the middle of a workflow.

**Fix patterns:** Progressive disclosure — show what's needed now, reveal more on demand. "Advanced" sections collapsed by default. One primary action per screen.

## 9. Help users recognize, diagnose, and recover from errors
Error messages should be in plain language, precisely indicate the problem, and constructively suggest a solution.

**Common violations:** "Error 500." "Invalid input." Red asterisks with no explanation. Generic "Something went wrong" with no path forward.

**Fix patterns:** Three things in every error: what happened (in human terms), why it happened (if useful), what to do next. "We couldn't save your changes because your session expired. Sign in again to continue." with a "Sign in" button right there.

## 10. Help and documentation
Even better if the system can be used without documentation, but it may be necessary to provide help.

**Common violations:** A "Help" link that goes to a PDF. Documentation that lives somewhere the user can't find. Contextual help that opens a 50-page wiki page.

**Fix patterns:** In-context help (tooltips on `?` icons, inline examples for form fields). Empty states that teach. Searchable, task-oriented docs (not feature-oriented).

## How to use these in a review

When reviewing an interface, don't just list which heuristics it violates — that's a textbook exercise. Instead:

1. Identify the user's job to be done on this screen.
2. Walk through the flow as that user.
3. Note where you stumble, and *why* — usually one or two heuristics will explain it.
4. Recommend a specific fix that names the pattern.
