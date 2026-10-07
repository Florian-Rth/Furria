# A person is erased, never anonymised

Every chain in the registry — membership, group membership, role holding, board seat, key holding —
is "ended, never deleted", and the club never deletes an account. Erasure requests and persons
entered by mistake need a way out anyway. Decided with Florian on 2026-10-07.

## The decision

**Deleting a person erases her and every chain about her, at any time and whatever still runs.**
It is the one exception to "ended, never deleted", and a permission of its own, `persons.delete`,
apart from `persons.manage`, which only **archives** — reversibly, and only once nothing runs.

- Where she acted on someone else's record — an announcement, an admission, an invitation, a contact
  change, an archiving — the act stays and its actor becomes *gelöschte Person*.
- The one deleting proves it is her with her password or a passkey; the confirmation names
  everything still running. A holder may delete herself.
- The club keeps no trace that she was deleted. A person with an account is told at her login email.
- **The only exception is a money record the law obliges the club to keep** (§147 AO, §257 HGB;
  GDPR Art. 17(3)(b)). It stays until its retention period ends. The ledger inherits this.

## Considered options

- **Anonymise: scrub name and contact, keep the chains.** Rejected: in a club of two hundred in one
  village, "member 1987–2024, dance guard, storeroom key" names her. Pseudonymous leftovers are
  still personal data, so anonymising answers no erasure request.
- **Delete only an archived person.** Safer — nothing running vanishes, two steps by possibly two
  people. Rejected by Florian: deletion must always be possible; the consequence line carries the
  safety instead.
- **No self-deletion, to keep the club from losing its last admin.** Rejected: the bootstrap admin
  seeder recreates the configured admin whenever its email has no account, so restarting heals it.

## Consequences

- The chains' foreign keys to the person cascade; actor references set null. A new chain or actor
  reference must pick one of the two — there is no third.
- The ledger, when built, is the first table that blocks nothing and yet is not erased: its rows
  outlive the person until their retention ends.
- Erased data survives in database backups until they rotate; the privacy policy must say so.
