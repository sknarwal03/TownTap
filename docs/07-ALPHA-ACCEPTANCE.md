# 07 — Alpha Acceptance Criteria

This consolidated document preserves the relevant content of the former files listed below. "Imported from" headings identify their original source; where an old section conflicts with a later approved decision, the approved decision record and overview govern.

---

## Historical source: `alpha-acceptance-criteria.md`

# TownTap Alpha Acceptance Criteria

Status: testable acceptance proposal for the approved first working release, Digital Card + Smart Phonebook Alpha (REL-01). Step 7 approves Phases 1–2 as the Alpha functional scope. Detailed criteria here are proposed test formulations; any proposed item is labeled. PRD P0 requirements and approved security/operational gates cannot be silently deferred.

## Phase 1 — Entry, identity, digital cards, privacy

### Authentication and entry

- **P1-01 — Approved scope, test details proposed:** User can sign up and log in using mobile OTP; phone-verification status is separate from profile visibility and business badge status.
- **P1-02 — Approved security requirement:** Recovery is verified and protected by rate limits and abuse prevention. Set concrete thresholds only after security review and approval.
- **P1-03 — Approved:** Signup is available irrespective of Gohana/Sonipat geography.
- **P1-04 — Approved:** Initial language uses device-language behavior; user can switch Hindi/English and preference persists. Missing-string and unsupported-device fallback need approval before final expected values are fixed.

### Cards and privacy

- **P1-05 — Approved:** A new profile is Private; it is not publicly exposed until the owner takes affirmative action.
- **P1-06 — Proposed test prerequisite:** Freeze the Alpha field schema from the PRD before testing; do not infer required fields or validation from prototype sample content.
- **P1-07 — Approved:** Each sensitive field has an individual visibility control. Fields not allowed for the requesting audience are absent from the returned projection, not merely hidden by the UI.
- **P1-08 — Approved:** Public is eligible for discovery subject to field rules; Unlisted is excluded from discovery but valid-link accessible; Private is inaccessible through public links/discovery.
- **P1-09 — Approved security requirement:** A non-owner cannot read private owner data or change another user's profile/visibility.
- **P1-10 — Proposed:** Invalid input identifies the field and does not appear saved; failed writes do not produce a success state. Exact validators and copy require approval.

### Sharing and revocation

- **P1-11 — Approved:** Public Card exposes only permitted fields; Private profile does not resolve through public URL.
- **P1-12 — Approved:** Valid Unlisted link returns only permitted information and never makes the profile discoverable.
- **P1-13 — Approved:** Owner can revoke/regenerate persistent Unlisted link; immediately after either action, a new request through the old link is denied and returns no protected profile data.
- **P1-14 — Approved limitation:** Revocation does not claim to recall screenshots, copies, or data already retained by a viewer.
- **P1-15 — Proposed pending transition approval:** Test mode and field changes against existing links and discovery. Owner must approve the transition table before this becomes a release gate.
- **P1-16 — Approved PRD requirement; Alpha execution needs confirmation:** PRD CARD-02 requires link and QR to open the same public card. If QR is included in Alpha, scanning it must resolve to the same permission-checked route as the link. Deferring functional QR would require explicit scope/P0 change.

## Phase 2 — Saved cards and Smart Phonebook

- **P2-01 — Approved PRD scope:** Signed-in user can save an eligible live profile reference and later open it in Saved Detail.
- **P2-02 — Approved:** Only the saving user can read that user's saved notes/tags; profile owner, other users, and guests cannot access them.
- **P2-03 — Approved PRD scope:** User can edit private notes/tags and search Saved Contacts by name, profession/category, city, own notes, and own tags.
- **P2-04 — Proposed:** Repeated save of the same target by the same user produces one consistent saved record. Exact duplicate/update behavior needs approval.
- **P2-05 — Approved PRD lifecycle intent:** Current permitted profile fields refresh on the saved reference without overwriting the saver’s private context.
- **P2-06 — Proposed pending lifecycle decision:** Hidden, Private, suspended, or deleted target shows an approved unavailable/restricted state. Note retention follows a separately approved data policy.
- **P2-07 — Approved PRD scope:** User can unsave; successful unsave removes the reference from that user's list/search. Undo/confirmation behavior is open.
- **P2-08 — Proposed:** Guest save leads to authentication then safely returns to the intended card; return-path behavior requires approval.
- **P2-09 — Proposed security check:** Notes/tags never enter public card, directory, owner view, or another user's data response.

## Essential Alpha security and operational release gates

These gates are required because Step 7 states Alpha security/operations cannot be deferred merely because Phase 4 follows. Evidence method is proposed and should follow approved architecture.

1. Test Public, Unlisted, Private, guest, owner, other-user, and unauthorized access. Verify hidden fields are absent from protected responses.
2. Test cross-user denial for Saved Contacts and notes/tags; target owner cannot inspect the saver’s private context.
3. Test old Unlisted link denial immediately after revoke/regenerate, including service/CDN cache behavior; confirm already copied data limitation is not misrepresented.
4. Test OTP success, invalid/expired code, resend, recovery, abuse/rate controls, non-enumerating behavior, and delivery/network failures. Thresholds must be approved before implementation.
5. Test malformed profile data, unsafe external URLs, and script injection per PRD T08; unauthorized writes are denied.
6. Identify responsible recovery/support and privacy/security incident owners; document escalation and rollback appropriate to the approved architecture.
7. Approve data export/deletion/retention and consent behavior before production data; test public projection and saved-reference lifecycle against it.
8. Review keyboard/focus, screen-reader labels, touch targets, contrast, scaling, Hindi/English strings, and persisted language choice. Conformance target/audit method remain open.
9. Trace each Alpha P0 requirement/scenario to evidence or an explicitly approved exception. Screen placement in a later phase does not waive a P0 requirement.
10. Confirm OTP does not issue or imply a business badge; badge display/action requires separately approved evidence/review policy.

## Explicit assumptions and approvals still needed

- Functional Alpha phase scope is approved by Step 7; architecture/provider, exact schema, numeric OTP thresholds, UI copy, and detailed state behavior are not thereby approved.
- PRD CARD-02 is P0 for working link + QR. If production QR is deferred, obtain explicit decision to revise scope/acceptance.
- PRD calls report/moderation and security controls P0; Admin screen is Phase 4. Define the minimum accountable and auditable Alpha operation or explicitly revise the P0/release decision.
- Badge availability in Alpha is not approved; OTP alone never verifies a business.
- Immediate link revocation means new reads are denied; copied information cannot be recalled.
- Prototype tab-local behavior and Step 2 QA results do not constitute production security or end-to-end evidence.

Before using these criteria as a release gate, approve field schema/defaults, mode transitions, link/cache behavior, QR delivery, duplicate saves, unavailable-reference retention, OTP thresholds/recovery evidence, minimum Alpha moderation operations, and privacy/accessibility review criteria.



