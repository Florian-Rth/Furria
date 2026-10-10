# A news post's text is a strict Markdown subset, its mentions a table

A **news post** carries a small fixed set of text features — paragraphs, one level of subheading,
flat bullet lists, bold, external links — plus **mentions** of public groups and public board
members. Decided with Florian on 2026-10-09 while shaping L7b.

## The decision

**The text is stored as a Markdown string in a `text` column, written in a strict subset; every
mention is also a row in a relational table.**

- **The subset:** paragraphs, `## Zwischenüberschrift`, `- Punkt` (flat), `**fett**`,
  `[Text](https://…)` and mentions as `@[Label](group:{id})` / `@[Label](person:{id})`.
- **A backslash escapes any ASCII punctuation** (`1\. FC`, `Preis\*`, `\[`), so text that only
  resembles markup — a sentence opening with a number, a lone asterisk — stays expressible; the
  editor writes the escapes, the parsers drop them. Added while building L7b S1 (2026-10-09).
- **One parser per side knows only these constructs.** Anything else — HTML, images, nesting,
  other heading levels — stays literal text; nothing is ever interpreted as HTML, so there is no
  sanitiser. The server refuses a text that uses a construct outside the subset, so the stored
  string is always clean.
- **Mentions live twice, on purpose:** in the string (where they sit in the sentence, with the
  label as written) and as rows of `news_post_mention` (post → group or person, foreign keys),
  rewritten on every save. "Which news posts mention her?" is a plain query; erasing a person or
  deleting a group drops the rows by cascade. A mention renders as interactive only while its row
  exists and its target is still public; otherwise its label is plain text.
- **Title, teaser and text stay plain columns**, so full-text search can run on them directly.

## Considered options

- **A JSON node tree in `jsonb`** — what rich-text editors work on natively, validated by node
  type, no parser. Rejected: content in JSON is opaque to ordinary queries and to search, and
  mentions as nested nodes are no relation. The editor converts to and from the subset instead.
- **HTML** — needs a sanitiser on every read path and invites everything the design forbids.
