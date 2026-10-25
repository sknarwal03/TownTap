# 05 — Authentication UX Specification

This consolidated document preserves the relevant content of the former files listed below. "Imported from" headings identify their original source; where an old section conflicts with a later approved decision, the approved decision record and overview govern.

---

## Historical source: `authentication-ux-spec.md`

# TownTap Authentication UX Specification

Status: proposed flows and security requirements. No numeric thresholds, recovery proof, or authentication vendor are approved here.

## Approved decisions

- Mobile OTP is used for signup, login, and phone verification (UX-05).
- Verified recovery, rate limits, and abuse prevention are required (REL-06); throttling/recovery controls must be defined before implementation (UX-05).
- Signup is allowed regardless of geography (UX-08).
- OTP proves phone control, not business legitimacy or badge eligibility (PDR-06, UX-06).
- New profiles remain Private until affirmative owner action (UX-03); completing OTP does not publish a profile or reveal a contact field.
- Hindi and English UI support, device-language initial selection, manual switching, and persisted preference are approved (UX-07).

## Proposed flows

### Signup

1. User selects Sign in/Sign up from PRD screen **Welcome**.
2. Collect only account information approved for signup; the PRD does not define the complete account form.
3. Explain the phone verification purpose, collect a mobile number, and request OTP.
4. Enter/verify code; offer resend and number correction subject to approved abuse policy.
5. On confirmed success, create/continue the authenticated session and show phone verification separately from profile mode and business badge status.
6. Continue to the card creation path. A new profile remains Private.

### Login

1. User enters the approved account identifier. OTP is approved, but whether phone is the sole identifier is unresolved.
2. Request and verify OTP with the same accessible state handling as signup.
3. Restore authenticated access and return to the requested screen when safe; destination/return-path rules need approval.
4. If the user cannot access the number, offer the verified recovery path, not an unverified bypass.

### Phone verification for an existing account

1. Authenticated user selects phone verification in the approved account/card context.
2. Confirm the target number and purpose; do not imply that phone verification verifies a business.
3. Request and verify OTP. Show status privately in account context.
4. Whether verified phone is required before a phone field can be published remains unresolved. Verification must never automatically switch visibility on.

### Account recovery

Proposed flow: start recovery from login; use non-enumerating copy; verify identity using an owner-approved process; protect support from disclosing data to an unverified requester; restore access only after proof succeeds; communicate next steps through an available verified channel where policy permits. Proof method, alternate channels, review/hold steps, support operations, and appeals are not approved and must be decided before implementation.

## OTP states and suggested UX

| State | Proposed UX behavior |
|---|---|
| Number entry | Explain purpose, format, and accessible label. Country selection/default is open. |
| Sending | Indicate progress and prevent duplicate submissions while pending. |
| Code entry | State code format/length once approved; support safe paste/autofill where available. |
| Invalid or expired code | Explain correction/resend path without revealing account existence. |
| Resend unavailable | Explain that another request cannot yet be made if policy supports a visible wait; do not invent duration. |
| Delivery failure | Offer retry or approved recovery/support path; avoid uncontrolled repeated sends. |
| Too many attempts | Generic protection message and safe next step; limits and lock duration need security review. |
| Existing number/account lookup | Avoid account enumeration; number reuse/account linking policy is open. |
| Network/offline | Explain retry; never show success without server-confirmed verification. |
| Recovery pending/failed | Give safe next steps without revealing account data; support/appeal process must be defined. |
| Verified | Confirm control of phone only; keep profile visibility and business badge visually distinct. |

## Security requirements and recommendations

**Approved requirements:** rate limits, abuse prevention, verified recovery, and separation of OTP from business verification.

**Recommendations for security review, not approved implementation choices:**

- Limit sends, code attempts, and recovery attempts by suitable combinations of account, phone, network, and abuse signals.
- Use short-lived, single-use challenges bound to the intended action and number; invalidate on success, expiry, replacement, or number change.
- Verify OTP and update verified status through a trusted server-side authority; do not trust client state.
- Do not log OTP values; restrict access to phone numbers and verification records.
- Use non-enumerating responses for login, resend, and recovery where possible.
- Monitor abuse patterns and provide an accountable incident/support path without retaining unnecessary data.
- Make protective controls accessible to legitimate users facing carrier delays or shared-device conditions.

No code length, validity period, resend cooldown, attempt count, lockout period, risk score, provider, fallback channel, or recovery evidence is approved. Select these after threat review and owner approval; do not encode arbitrary values in prototype copy.

## Localization and accessibility

Use device language on initial selection, permit a manual Hindi/English switch, and persist preference. Localize authentication instructions, errors, privacy notice, recovery guidance, accessible names, and support instructions. Exact device-language fallback, missing-string fallback, translation ownership, number formatting, and mixed-language content behavior remain open. Do not automatically translate user-entered names or business content without a separate decision.

## Open questions

- Is phone the account identifier, a verified attribute, or both? How can a user change a number safely?
- At what signup step is OTP required? Can guest access to eligible Public/Unlisted profiles occur before sign-in as the PRD indicates?
- Is phone verification required before showing a phone field or creating a business listing?
- What recovery evidence, alternate channels, human support, audit, and appeal process are acceptable?
- What thresholds, expiry, retry/resend schedule, lockout, and abuse controls will security review approve?
- How are recycled, shared, business, or family numbers handled?
- What happens to sessions after number change, recovery, suspected compromise, or account closure?
- What notice, retention, and deletion rules apply to OTP provider data and verification records?



