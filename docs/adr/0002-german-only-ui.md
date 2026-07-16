# German-only UI, no i18n framework

All visible UI text is German, written directly in the components; code identifiers, routes and
IDs stay English. We deliberately ship no i18n framework, no `/$lang/` route prefix, and no
locale files: the audience is a village Karnevalsverein whose members and guests are
German-speaking, and the dependency + indirection cost of i18n infrastructure buys nothing.
Should a second language ever become real, every string must be extracted retroactively — we
accept that cost as very unlikely to materialise.
