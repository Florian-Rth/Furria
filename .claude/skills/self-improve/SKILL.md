---
name: self-improve
description: Captures new coding rules from user corrections and proposes additions to backend-work or frontend-work skills. Invoke when the user corrects your approach, teaches a new pattern, or at the end of a coding session. Stay silent and continue working if nothing to improve.
---

## When invoked

1. Review the current conversation for user corrections, new patterns, or coding preferences not yet captured in the backend-work or frontend-work skills, or in CLAUDE.md
2. If nothing new is found, continue working silently — never message the user about having nothing to improve
3. If a new rule is found, propose it in this exact format:

**New rule for `<skill-name>` → `<section>`:**
`- <the rule in imperative form>`

Add this?

4. Write the rule only after the user approves
5. If the rule does not fit backend-work or frontend-work, propose it for CLAUDE.md instead

## Rule writing standards

- Every rule uses imperative language: "Always...", "Never...", "Use...", "Mark..."
- Never use soft language: "Try to...", "You should...", "Consider...", "It's recommended..."
- One rule per line, as a markdown list item
- No code examples — describe the pattern precisely enough to follow without ambiguity
- Keep rules generic when possible — project-specific rules go under "Project Patterns"
- Deduplicate — if an existing rule covers the same ground, update it instead of adding a new one
