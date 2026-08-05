# The public website submits the Beitrittsantrag to our own API

The **Beitrittsantrag** on `/join` is posted to **our own .NET API**
(`POST /api/membership-applications`), which persists it and notifies the club. We deliberately do
**not** use a third-party form service (Formspree, Web3Forms, Netlify Forms), a prefilled
`mailto:`, or a client-generated PDF.

This is the first time the public website **writes** anything, and it is worth recording because
the website master plan carries a prominent scope banner — *"Website v1 ships fully static; no
backend integration"*. That banner is about the **Club-App's** data (events, tickets, members,
news), which genuinely does not exist yet. It was never about our own infrastructure: the website
has called `POST /api/preview/unlock` since P0, and `docker-compose.example.yml` deploys
PostgreSQL, the API and the website **together**, with EF Core migrations applied on API startup.
The banner is amended accordingly rather than broken.

Why not the cheaper options:

- **A third-party form service** would put a processor — usually US-based — in the path of
  applicants' names, birth dates, postal addresses, phone numbers and, for under-18s, a
  guardian's contact details. That means an AV-Vertrag, an entry in the Datenschutzerklärung and a
  vendor dependency on the club's single most important conversion. We would be exporting the most
  sensitive data the site touches to save an endpoint we are already positioned to write.
- **`mailto:` or a printable PDF** shifts the last step to the applicant. It fails silently on
  webmail-only phones — which is most of the audience — and produces unstructured, unvalidated
  input that someone has to retype.
- **Persisting without notifying** would be a black hole: there is no Club-App and no admin UI, so
  applications would rot unseen. Persisting **and** mailing means a bounced notification is not a
  lost applicant, and the Club-App later grows its review UI on a table that already has history.

## Consequences

- We become the **controller of applicant personal data at rest**. That requires a retention and
  deletion rule in the Datenschutzerklärung, and it must cover the data of minors and their
  guardians. This is a launch obligation, not a nice-to-have.
- The API gains an **outbound mail dependency** (SMTP credentials, a real sender domain with
  SPF/DKIM, a real recipient address). `CLUB_CONTACT_EMAIL` is still a placeholder.
- A **public, unauthenticated POST** needs abuse protection: a honeypot field on the form plus
  per-IP rate limiting in the API. A privacy-preserving challenge (self-hosted Altcha, or
  Friendly Captcha) stays an open option — never a third-party captcha that loads on the page
  where a child's data is entered.
- **Sequencing:** the frontend ships first (P6) against this contract with the endpoint absent, so
  a submission fails honestly into the form's error state, which always offers the human fallback.
  **P6 is frontend-only and the endpoint is deferred, not scheduled** — the frontend needs no change
  when it eventually lands. The caveat is that `/join` is only half-useful until then, so the
  endpoint should not trail P7's public launch.
- The **read** side of the same phase (`GET /api/groups`, `GET /api/group-matcher`) is *not*
  covered by this ADR's reasoning — those are ordinary public read endpoints of the kind
  [ADR-0003](0003-website-rendering-strategy.md) already anticipates. Note its consequence though:
  content that becomes backend-driven stops being prerenderable, which is why `/club` keeps
  reading Gruppen synchronously while `/join`'s interactive matcher fetches.
