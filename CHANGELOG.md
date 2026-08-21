# Changelog

All notable changes to the Authorship Meter — the format spec, the component, and
the schema — are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Version numbers track the
**spec version** (see [SPEC.md](SPEC.md) §12): a major bump is a change that silently
alters an existing declaration's headline (the stage set, the level→share mapping, or
the band boundaries); everything else is minor or patch.

## [Unreleased]

Adoption and tooling changes since v1.1, not yet a version bump — no change to the
spec, schema, or level→share mapping.

### Added
- `INTEGRATION.md` — guide for adding the meter to an existing project: where the
  live widget can and cannot run (a GitHub-rendered README strips `<script>`), link
  vs. vendor, and a worked example.
- `declarations/` hosting pattern — declarations for external projects can be hosted
  on the meter's own site (`declarations/<project>.{html,json}`) instead of inside
  the consuming app's build. First used for `live-visuals`.
- `feedback/` — field reports from real integrations, starting with
  `live-visuals-integration.md`.

- SPEC §11 now covers watermarking/detection and regulatory compliance alongside
  C2PA, split into 11.1–11.3. Two new "what this is not" entries: not a watermark
  or detector, not a regulatory compliance mechanism.
- README's illustrative example graphic (`assets/authorship-example.svg`) — a
  single mocked-up reading (band, share bar, five per-stage indicators) so a
  first-time reader sees what a declaration looks like before reading the
  explanation.
- README's short glossary distinguishing disclosure, detection, watermark,
  C2PA-style provenance, "assessed vs. validated," and regulatory compliance.

### Changed
- "About this scale" link (`METER_HOME`) now points at the repository rather than the
  Pages demo gallery, so it lands on the scale's definition.
- The embedded component script is loaded with a cache-busting query (`?v=…`) so a
  fix to the linked `authorship-meter.js` propagates instead of being served stale
  from the Pages cache. (A more durable fix — versioned filenames — is on the
  backlog.)
- README restructured: "What this is not" now follows "Why it matters" directly (its
  natural counterpart), and "Add it to your project" absorbed "Getting a declaration
  assessed" into one three-step flow (assess → confirm → publish the badge).
- README's opening line no longer claims to be "honest" — that's not something a
  format can assert about itself. It's now grounded in method: a structured,
  LLM-assisted assessment against published criteria.

## [1.1.0] — 2026-08-04

Provenance, validity, and a revision model — what a public claim needs. Additive:
a v1.0 declaration still renders. It is simply not *valid* under §6.3 until it carries
`assessed_at` and `subject.version`. No change to the stage set, level→share mapping,
or band boundaries.

### Added
- **Provenance & validity** (SPEC §6): `assessed_at` and `subject.version` (both
  required once `version: "1.1"`), plus optional `subject.source`, `subject.updated`,
  and `history`. Validity defined as **scoped · current · sourced**.
- **Method, declarer, and assessed date surfaced on every rendered instance** — never
  buried in expandable detail. Method is the primary trust signal.
- **Two links** on each meter: a constant "About this scale" (the framework) and a
  per-instance "How this was assessed" (from `subject.source`).
- **Staleness detection**: when `subject.updated` postdates `assessed_at`, the
  component shows a warning instead of a confident stale number.
- **Revision model** (SPEC §7): a declaration describes the work as it currently
  stands; material change triggers re-assessment. Includes the material-change table.
- **Placement & communication standard** (SPEC §8): an intro-line reference plus the
  full meter at the foot of the content.
- Principle 6 (good-faith, traceable claims); `llm-assisted` as the encouraged
  first-stage default.
- Schema: conditional `if/then` requiring the new fields only for `version: "1.1"`,
  so v1.0 declarations still validate. `stale.json` example added to exercise the
  staleness banner.

### Changed
- Schema `version` enum accepts `"1.0"` and `"1.1"`.

## [1.0.1] — 2026-08-01

### Fixed
- "Hide breakdown" did nothing on full (non-compact) meters — the open state was
  re-derived from the `open` attribute each render, but the default-open state was not
  backed by the attribute, so toggling could only ever add it. Open/closed is now
  tracked as internal state.

### Changed
- Human share is shown alongside AI share everywhere (complementary to 100%,
  color-matched), so an unfamiliar reader needn't subtract.
- README: "What this is not" moved to follow "The model"; human sign-off rule
  emboldened; "Why" tightened.

## [1.0.0] — 2026-07-30

Initial public release.

### Added
- The format: five stages (Conception · Structure · Production · Curation ·
  Verification), five ordinal levels, composite → band mapping, the verification
  ceiling (verification may never be level 5).
- `authorship-meter.js` — dependency-free custom element with `compact` / `open`
  modes.
- `SPEC.md`, `ASSESSMENT.md` (LLM assessment instructions), `authorship.schema.json`,
  a demo `index.html`, and example declarations.
- Published to GitHub Pages.
