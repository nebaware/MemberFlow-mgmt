# Developer Prompt

Use this prompt when assigning a developer or coding agent to one specific feature area.

## Prompt

You are working inside `D:\memberflow-pro`.

You are assigned to exactly one feature area from `docs/team-plans`. Your job is to advance only that assigned feature while preserving the rest of the product.

### Required inputs before you start

- Assigned plan file: `docs/team-plans/<feature-plan>.md`
- Assigned checklist: `docs/team-plans/checklists/<feature-checklist>.md`
- Shared roadmap: `docs/team-plans/delivery-roadmap.md`
- Gap baseline: `docs/team-plans/gap-analysis.md`

### Non-negotiable rules

- Do not change features outside your assigned domain unless a shared dependency strictly requires it.
- If you must touch shared code, keep the change minimal and document why.
- Do not redesign dashboards or routes owned by another team.
- Do not invent new role names, status enums, or API response shapes without checking the platform foundation plan.
- Do not expose passwords, hashes, tokens, secrets, or sensitive internal fields in UI, logs, or API responses.
- Do not silently break existing behavior in dashboards that already work.
- Prefer extending existing files and flows over replacing them.

### Scope discipline

You must classify every intended code change into one of these buckets before editing:

- `in-scope`: directly required by your assigned feature plan
- `shared dependency`: required to support your feature safely
- `out-of-scope`: belongs to another team and must not be changed now

If a requested change is `out-of-scope`, stop and list it as a dependency or follow-up instead of implementing it.

### Required workflow

1. Read your assigned plan and checklist.
2. Read `gap-analysis.md` and identify which parts of your feature are already done, partial, or missing.
3. Inspect the current implementation in code before proposing edits.
4. List the exact files you will change.
5. Implement only the smallest complete slice that advances your feature safely.
6. Verify that existing flows in the same feature still work.
7. Report:
- what you changed
- what you deliberately did not change
- what remains blocked by another team or by platform foundation work

### Output format for every task

- Assigned feature
- In-scope files
- Shared dependency files, if any
- Risks
- Changes made
- Remaining blockers

### Examples of ownership boundaries

- Member team may change member list, member CRUD, import or export, and member-related APIs.
- Member team must not redesign payments, rewrite event flows, or alter super admin organization logic unless required by a shared contract.
- Payments team may extend payment records, invoice flows, and subscription logic.
- Payments team must not alter blog workflows or member moderation logic.
- Public experience team may build public event pages and registration UI.
- Public experience team must not modify admin-only event management flows except through shared APIs.

### Engineering preference

- Preserve working routes and existing dashboard shells where possible.
- Prefer additive changes.
- Keep code coherent with the current React + Express structure.
- If you find foundational gaps, document them and implement only the minimal safe workaround.

Your goal is not to “improve the whole project.” Your goal is to advance one assigned feature cleanly, without causing cross-team interference.
