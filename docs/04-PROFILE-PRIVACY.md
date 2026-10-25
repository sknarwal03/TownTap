# 04 — Profile Privacy Specification

This consolidated document preserves the relevant content of the former files listed below. "Imported from" headings identify their original source; where an old section conflicts with a later approved decision, the approved decision record and overview govern.

---

## Historical source: `profile-privacy-spec.md`

# TownTap Profile Privacy Specification

Status: proposed field-level behavior for review. This document separates approved policy, recommendations, and unresolved decisions; it does not prescribe a backend schema.

## Approved rules

- New profiles default to **Private**; public exposure requires affirmative owner action (UX-03).
- Profile modes are **Public**, **Unlisted**, and **Private** (PDR-02).
- Public profiles may be eligible for discovery subject to field-level sharing (PDR-02).
- Unlisted profiles are excluded from public search and directory browsing. A valid link permits only the information allowed for that link (PDR-03).
- Private profiles are unavailable through public search, browsing, and public links; authenticated owners retain access.
- Individual visibility controls are required for each sensitive profile field (REL-04).
- Owner-approved field audience choices are **Private**, **Link-only**, and **Public**; sensitive fields default to **Private**. The full field-by-field matrix and mode/field transition effects remain open.
- Unlisted links persist until the owner revokes or regenerates them; old links immediately cease authorizing access (UX-04, REL-05).
- Signup is allowed regardless of geography. Business discovery prioritizes Gohana/Sonipat, but is not geographically exclusive (UX-08, REL-07).

## Proposed field-level visibility matrix

The PRD lists person/professional fields in section 5.1 and business fields in section 5.4. “Permitted” means the field may be included in the audience-specific response, not merely visually hidden. All defaults below are **proposals**, not approved decisions.

| PRD field | Applies to | Public | Unlisted link | Private | Proposed default / open question |
|---|---|---|---|---|---|
| Display name | Person, professional, business name | Only if permitted by owner | Only if permitted by owner | Owner only | Keep profile Private until affirmative publication; decide if public name is mandatory. |
| Photo / logo | Person photo, business logo | Only if permitted | Only if permitted | Owner only | Off until opted in; decide metadata and removal behavior. |
| Headline / professional title | Person/professional | Only if permitted | Only if permitted | Owner only | Individual control proposed; sensitivity classification open. |
| Category / category IDs | Professional/business | Only if permitted; directory eligibility may require public category | Only if permitted; never indexed from Unlisted | Owner only | Resolve required-public category rules. |
| City / city ID | Person/business locality | Only if permitted | Only if permitted | Owner only | Off proposed; define city granularity and normalization. |
| Phone | Person/business contact | Only if permitted; show Call only when permitted | Only if permitted | Owner only | Off proposed; phone verification must not reveal the number. |
| WhatsApp | Person/business contact method | Only if permitted; show action only when permitted | Only if permitted | Owner only | Off proposed; determine whether visibility is independent from phone. |
| Email | Person/business contact | Only if permitted | Only if permitted | Owner only | Off proposed; decide whether any masking/action presentation is needed. |
| Website | Person/business link | Only if permitted | Only if permitted | Owner only | Off proposed; safe URL rules and validation are open. |
| Social links | Person/business links | Each permitted link only | Each permitted link only | Owner only | Per-link controls proposed; supported destinations open. |
| Short bio / description | Person/professional/business | Only if permitted | Only if permitted | Owner only | Off proposed; moderation and length rules open. |
| Address | Business; optionally profile | Only if permitted; city permission does not imply exact address | Only if permitted | Owner only | Off proposed; exact address is high sensitivity. Decide if city-only is a separate field. |
| Map link / map pin / coordinates | Business location | Only if permitted; independently controlled | Only if permitted | Owner only | Off proposed; determine whether links reveal precise coordinates/address. |
| Service list / offerings | Professional/business | Only if permitted | Only if permitted | Owner only | Off proposed; directory may need an approved public subset. |
| Service area | Business | Only if permitted, using an approved representation | Only if permitted | Owner only | Off proposed; do not infer a radius or boundary. |
| Working hours | Business | Only if permitted | Only if permitted | Owner only | Off proposed; timezone, holidays, closures need rules. |
| Verification status / badge | Business | Only if approved review state and wording permit | Same permitted presentation | Owner may view own status | Optional badge; OTP alone never qualifies. Criteria and display states unresolved. |
| Profile/listing mode | System state | Public projection only when eligible | Not a discovery result | Owner sees own setting | Do not reveal internal moderation data without policy. |
| Owner UID, private notes/tags, saved-at/source, verification evidence | System/private | Never | Never | Saver sees own notes; owner/reviewer access only as authorized | PRD requires saver-private notes/tags; evidence access requires privileged policy. |

The individual-control requirement and audience vocabulary are approved; the field interpretation and which fields may be offered to which audiences still require owner approval. Business directory eligibility may require a public business name, category, or locality, but no required-public field set has been approved.

## Audience behavior

| Mode | Discovery | Valid profile link | Owner access |
|---|---|---|---|
| Public | Eligible only if otherwise eligible and permitted fields are set | Opens permitted public projection | Authenticated owner can view/edit own profile |
| Unlisted | Excluded from search and directory browsing | Opens only fields permitted for link while link is valid | Owner can view/edit and manage link |
| Private | Excluded from search and directory browsing | Denied | Authenticated owner retains access |

A field permission does not override a Private profile mode. A disallowed field must not be returned to the visitor. Saved Contacts remain a separate user-private reference: notes/tags belong only to the saver; permitted live fields can refresh under the PRD lifecycle rules.

## Link lifecycle and access changes

**Approved:** Unlisted links are persistent; the owner can revoke or regenerate at any time. The old link immediately stops granting access. Previously copied information cannot be recalled.

**Proposed UX:** Explain that link possession grants access to permitted fields and the profile is not discoverable; confirm before revoke/regenerate; identify which current link remains valid; show a neutral unavailable state for revoked/invalid links without exposing private profile data.

| Event | Required result | Still unresolved |
|---|---|---|
| Private → Public or Unlisted | Requires affirmative owner action | Confirmation copy; whether business listing publication is a separate action |
| Public → Unlisted | Remove from discovery; a valid link grants permitted fields | Whether existing links remain valid or must be regenerated |
| Public/Unlisted → Private | No public-link or discovery access under Private rules | Whether all tokens are automatically invalidated; saved-reference display |
| Unlisted link revoked/regenerated | Old link immediately denies new access | Behavior of already-open pages, browser/CDN/search caches |
| Non-owner attempts edit/mode change | Must not be authorized to change owner data | Error wording and report/support route |
| Guest opens Private/revoked link | No protected fields or notes disclosed | Neutral not-found/unavailable treatment; anti-enumeration copy |
| Admin/moderator access | PRD allows controlled privileged process | Roles, purpose, audit, emergency access and user notice |

## Cache implications

**Approved:** REL-05 requires immediate denial of new access through an old link after revoke/regenerate. This cannot recall screenshots, downloads, forwarded copies, or information already retained by a viewer.

**Recommendations, not approved architecture:** Check link validity on each new read; use response caching that supports prompt permission changes; invalidate service/CDN caches on mode, field, link, or listing changes; avoid exposing link tokens in logs/referrers; consider excluding Unlisted links from search indexing (the older UX handoff recommends noindex, but this is not an approved decision). Exact headers and architecture remain open.

## Unresolved decisions

1. Full sensitive-field list, audience permissions, and which fields are mandatory for a public listing.
2. Differences across personal, professional, and business records; profile vs listing controls.
3. Per-field defaults and whether a choice carries to another card.
4. Mode transitions, field changes, and effects on existing links.
5. Link format, multiple-link support, expiry (if any), rotation semantics, forwarding, and cache requirements.
6. Saved reference behavior after visibility change, suspension, or deletion; note retention.
7. Admin access and audit policy for reports and verification evidence.
8. Consent text, retention, export/deletion timing, and legal/privacy review.



