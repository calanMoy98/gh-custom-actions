<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles: I. Code Quality (added reusability requirement),
  II. Testing Standards (added idempotency requirement)
- Added sections: none
- Removed sections: none
- Follow-up TODOs: none
-->

# gh-custom-actions Constitution

## Core Principles

### I. Code Quality
All production code MUST be readable, consistent, maintainable, and reusable.
- MUST follow existing module, naming, and layout conventions in the touched
  package (GitHub Action, Discord bot, Teams/Telegram/email notifier, or workflow).
- MUST keep changes focused: no drive-by refactors, unrelated file churn, or
  speculative abstractions.
- MUST be reusable: shared logic MUST live in composable units that callers
  can invoke without copy-paste; package-local helpers MUST be extractable
  for reuse across commands, actions, or notifiers when the same behavior
  appears more than once.
- MUST handle errors explicitly at boundaries (action failures, Discord
  interactions, HTTP/webhook calls) with clear messages; MUST NOT swallow
  failures silently.
- MUST NOT commit secrets, tokens, publish profiles, or local config containing
  credentials; secrets belong in GitHub Secrets or ignored local files only.
- SHOULD prefer small, composable units (one command/action/event handler per
  file) over monolithic scripts.
**Rationale**: Custom actions and bots are reused across workflows and servers;
unclear, brittle, or duplicated code multiplies operational risk.

### II. Testing Standards
Behavior that can break consumers MUST be covered by automated checks before
merge when feasible. Tests and testable code MUST be idempotent: running the
same check once or one thousand times MUST yield the same result.
- MUST add or update tests for new public behavior (action inputs/outputs,
  notification payload shaping, Discord command `execute` paths) when a test
  harness exists for that package.
- MUST keep CI green for the packages touched by a change; skipping tests in
  deploy workflows does not exempt local/package test expectations.
- MUST treat contract surfaces as testable: `action.yml` inputs/outputs,
  slash-command `data` definitions, and webhook/embed payload shapes.
- MUST write idempotent tests and production paths under test: no reliance on
  mutable shared state, wall-clock order, leftover files, or prior-run side
  effects; repeated execution of the same suite or operation MUST produce the
  same pass/fail outcome and the same observable result.
- Integration or smoke checks MUST cover cross-boundary paths (workflow →
  action, bot → Discord API mock/stub, notifier → target API) when unit tests
  alone cannot prove the contract.
- Flaky or environment-dependent tests MUST be fixed or quarantined with a
  tracked follow-up; they MUST NOT be ignored without justification.
**Rationale**: Actions and bots fail in production when contracts drift;
non-idempotent tests hide real failures and waste CI trust.

### III. UX Consistency
User-facing surfaces MUST feel coherent across channels and commands.
- Discord slash commands MUST share the same interaction patterns: validate
  input early, reply or defer promptly, use ephemeral replies for errors and
  private feedback, and reuse shared cooldown/error handling.
- Notification payloads (Discord embeds, Teams/Telegram/email content) MUST
  present the same core facts when available (status, repo/ref, actor, link to
  run or resource) with consistent field naming and ordering.
- GitHub Action `action.yml` inputs MUST use clear names, descriptions, and
  sensible defaults; required vs optional MUST match real runtime needs.
- Error and help text MUST be actionable (what failed and what to fix), not
  raw stack traces exposed to end users.
- Visual and tonal consistency MUST be preserved within a channel (embed
  colors/status mapping, button/select `customId` conventions) unless a
  documented change intentionally updates the UX contract.
**Rationale**: Operators and Discord users judge reliability by predictable
interactions and readable notifications.

### IV. Performance
Features MUST stay within acceptable latency and resource budgets for their
runtime.
- Actions and notifiers MUST avoid unnecessary network round-trips, large
  payload copies, and blocking work on the critical path.
- Discord handlers MUST acknowledge interactions within Discord's timing
  limits (reply or defer); long work MUST continue after acknowledgment.
- Startup and command loading MUST remain efficient (lazy or cached dynamic
  imports where already established; no redundant full reloads in hot paths).
- Deploy and build workflows SHOULD cache dependencies and skip redundant
  work; package size and cold-start cost SHOULD be considered for serverless
  or Function App targets.
- Performance regressions that affect user-visible latency or CI duration
  MUST be justified in the PR or reverted.
**Rationale**: Slow actions block pipelines; slow bot replies break Discord
UX and look like outages.

## Quality Gates

Pull requests and Spec Kit plans MUST satisfy the Core Principles before
merge or implementation sign-off.
- Code Quality: review for scope control, reusability (no unjustified
  duplication), error handling, and secret hygiene.
- Testing: required checks pass; new contracts have coverage or an explicit
  waiver with rationale; suites MUST be idempotent across repeated runs.
- UX: command and notification behavior matches existing patterns unless the
  PR documents an intentional UX change.
- Performance: no unexplained increase in interaction latency, action runtime,
  or CI duration for the changed path.

## Development Workflow

- Spec Kit flow for new features: specify → plan → tasks → implement, with
  constitution compliance checked at plan and review gates.
- Prefer package-local changes under `notification/` or `.github/workflows/`
  over cross-cutting rewrites unless the feature requires a shared contract.
- Reusable workflows MUST document required inputs, secrets, and caller
  `permissions` expectations in the workflow description or README for that
  path.
- Breaking changes to `action.yml`, slash-command names/options, or
  notification payload schemas MUST be called out in the PR and versioned or
  migrated deliberately.

## Governance

This constitution is the governing standard for `gh-custom-actions`. It
supersedes informal practice when they conflict.
- Amendments MUST update this file, bump **Version** using semantic
  versioning (MAJOR: remove/redefine principles; MINOR: add/expand guidance;
  PATCH: clarify wording), set **Last Amended** to the change date, and
  include a Sync Impact Report comment at the top of this file.
- Compliance review: every PR and Spec Kit plan/review gate MUST verify
  applicable principles; unjustified violations are blockers.
- Complexity and principle exceptions MUST be documented in the PR or plan
  with rationale and a path back to compliance.
- Runtime guidance for a package lives in that package's README; the
  constitution defines non-negotiable project rules those docs MUST NOT
  contradict.

**Version**: 1.1.0 | **Ratified**: 2026-08-04 | **Last Amended**: 2026-08-05
