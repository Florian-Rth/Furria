# The beer list is a private pot outside the club's books

Florian, 2026-11-04: the beer in the clubroom is bought by the drinks warden out of her own pocket
at the supermarket; members pay her for the crates they take, and that money pays her back and
buys the next crates. The club never owns the beer and never sees the money. The design handoff
and the first **ledger** definition put a "drinks till" into the club's books — that is wrong for
this club, and a later reader will expect it there.

## The decision

**The beer list is its own small pot with exactly one owner person, kept entirely outside the
ledger and the club's cash report. It knows crates and what members owe for them — never what the
beer cost the owner, and never any debt between two private people.**

- **Owner, not role:** the pot names its owner as a fact of its own. A permission (`beer_list.manage`,
  granted through a role) only decides who may operate it; several people may, only the owner is
  owed money, and only a holder of that permission can be the owner. Nobody else's purchases are
  tracked — whoever helps out settles with the owner privately.
- **Lifetime:** a pot lives as long as its owner holds it, across sessions. A handover closes it
  (open crates stay owed to the old owner) and opens the successor's pot with the remaining crates
  as a count only — no euro amount, because the app does not know what the crates are worth to the
  two of them.
  The successor must be someone else who may operate the pot; she sets her own price and payment
  details. The old pot stays readable and its open crates stay payable to the old owner, but it is
  locked for everything else. The carried crates show in both pots' stock history (handed over out
  of the old one, carried into the new one), so the old pot ends at zero (built 2026-11-04).
- **One item:** whole crates of beer at one price; a crate keeps the price it was taken at.
- **Tabs belong to persons:** never to a group or the club — that would pull club money back in.
  A payment settles whole crates; no partial payments, no credit.
- **Money moves outside the app:** members pay the owner however they like (her payment details
  are shown); only operators book a payment. There is no payment provider — Stripe and the
  ledger's providers are the club's, not the owner's.
- **Access is an enrollment:** any affiliated person may enroll herself (confirming a
  declaration) and end it again; an operator may end it for her. The enrollment is a running
  relationship and implies the beer-list keys ([ADR-0011](0011-permissions-come-from-roles-and-running-relationships.md)).
  Ending it stops new crates and never touches the debt.
- **Members see only whether a crate is left:** the pot read tells everyone on the list whether
  the stock is above zero, so an empty pallet shows before anyone confirms a crate; the count
  itself stays an operator figure (built 2026-11-04).

## Considered options

- **Drinks till inside the ledger** (the handoff) — rejected: the club does not own the beer.
- **Several people front purchases, the pot owes each of them** — rejected: it turns the app into
  a debt ledger between members.
- **Purchase prices on deliveries, so the pot has a real balance** — rejected: whether the owner is
  paid back is her own reckoning, and the extra field would be the only thing nobody keeps up.

## Consequences

- The treasurer's cash report and the ledger never see beer money; a future "drinks" category in
  finance must not be wired to this pot.
- If the club ever takes over the beer, that is a new decision superseding this one, not a toggle.
