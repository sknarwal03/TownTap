# 09 — Documentation and Prototype Inventory

Audit date: 2026-10-24. This file replaces the earlier inventory, which described an outdated document set and contradicted later project decisions. It is a factual index, not a requirements source.

## Documentation

| File | Purpose |
|---|---|
| `00-OVERVIEW.md` | Plain-language product, phase plan, and reading guide. |
| `01-PRODUCT-REQUIREMENTS.docx` | Detailed PRD and product requirements baseline. |
| `02-APPROVED-DECISIONS.md` | Consolidated approved product and UX decision history. |
| `03-UX-AND-SCREEN-REFERENCE.md` | UX flows, screen mapping, and screen-state matrix. |
| `04-PROFILE-PRIVACY.md` | Profile visibility and field-level privacy rules. |
| `05-AUTHENTICATION-UX.md` | Proposed authentication and recovery flows. |
| `06-ROADMAP.md` | Phase plan and proposed dependencies/acceptance. |
| `07-ALPHA-ACCEPTANCE.md` | Proposed testable checks and required Alpha gates. |
| `08-PROTOTYPE-HANDOFF-AND-EVIDENCE.md` | Prototype instructions, update plan, and dated QA/implementation history. |
| `10-OPEN-DECISIONS.md` | Pending choices and documentation gaps. |
| `11-TECHNICAL-ARCHITECTURE-AND-DATA-API-PLAN.md` | Logical planning draft with Firebase as the current implementation target; no approved physical schema or contract. |
| `12-FIREBASE-IMPLEMENTATION-AND-LOCAL-TESTING.md` | Emulator implementation details, callable surface, privacy behavior, assumptions, test commands, and production boundaries. |
| `MASTER-PROJECT-STATUS.md` | Current implementation progress, verification, blockers, and next work. |
| `AGENTS.md` | Repository guidance; not a product document. |

## Prototype files

The active prototype is `prototypes/index.html`; `prototypes/index-step8b-baseline.html` preserves its earlier baseline. Other files under `prototypes/` are design boards, screenshots, and earlier explorations. They are illustrative evidence, not production app code or an authority for approved requirements. Consult the prototype handoff document for known limitations and QA status.

## Source of truth

Use the PRD for detailed requirements, the consolidated decision record for approved decisions, and the numbered specifications for their subject areas. Where an old imported section disagrees with a later approved decision, the decision history and current overview govern. Open proposals remain proposals until approved.









