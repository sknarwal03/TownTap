# Agent instructions

## Source of truth

- Treat documents in `docs/` as authoritative for product requirements and technical decisions.
- Read relevant documentation before proposing or implementing behavior.
- If required details are absent or documents conflict, record the gap or ask for clarification rather than inventing product rules.
- Keep specifications in `docs/` and update them when the user approves decisions.

## Current stage

- This is a documentation-first project. Do not implement application features until requested and supported by specifications.
- Do not add dependencies or configure Firebase unless explicitly requested.
- Preserve existing files when making changes; inspect before modifying.
- Keep `prototypes/` explorations separate from production application code.
