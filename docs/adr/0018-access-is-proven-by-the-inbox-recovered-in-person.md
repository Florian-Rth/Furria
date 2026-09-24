# Access is proven by the inbox, and recovered only in person

The club app is invite-only (ADR-0005), and the goal for onboarding is the least possible work for
the people who run the club. Decided with Florian on 2026-09-25 while shaping accounts and
invitations.

## The decision

**Anyone may request their own invitation, and nobody in the club approves it.** A person types
an email address; if it is the contact email the club has on record for an eligible person, an
invitation is mailed to that address. Controlling the inbox the club itself recorded is the proof
of identity. The answer on screen is the same whether or not the address matched.

**Inviting and recovering are two different rights.** A first invitation cannot take anything
over, because there is no account yet, so it sits with whoever keeps the persons register.
**Access recovery** sets new credentials on an existing account, which makes it equal to taking
that account over — the Admin's included. It is a separate permission, together with disabling an
account and vouching for a person whose birth date is unknown.

**Recovery is handed over in person only**: a QR and a short code on a manager's screen, alive for
minutes. It is never mailed to an address a caller names, and the previous login email is told
that it happened.

**A manager's edit of contact details never touches the login email.** Otherwise the register
right would carry the takeover right through a back door: change the contact email, then reset the
password.

## Considered options

- **The board approves every self-request.** Rejected: it adds a to-do for every member at launch,
  and the board cannot judge a request any better than the inbox already does.
- **Group admins invite the people of their group.** Rejected by Florian: accounts are the club's
  business, never a group's.
- **Recovery mailed to a new address typed in by a manager.** Rejected: it is the classic
  social-engineering path ("it's Anna, here is my new address"), and recovery is rare enough that
  requiring presence costs almost nothing.

## Consequences

- The quality of the persons register's contact emails is the security of self-requests. That is
  one reason a person with an account keeps her own contact details.
- A shared family inbox is entitled for everyone it serves; the first to redeem takes the address
  as her login email, and the others choose their own.
