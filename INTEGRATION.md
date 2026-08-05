# Integration Guide

How to add the Authorship Meter to an existing project. Read [SPEC.md](SPEC.md)
first if you haven't — this assumes the stage/level model, §6 provenance, and §8
placement standard.

This guide is generic. A worked example against a real repo
([live-visuals](https://github.com/luispsalas/live-visuals)) follows in §6.

---

## 1. Where the live widget can and can't run

The component (`authorship-meter.js`) is a custom element — it needs `<script>` to
execute. Two common surfaces silently can't run it:

- **GitHub-rendered Markdown** (a repo's `README.md` as GitHub displays it) —
  GitHub sanitizes `<script>` tags out of rendered Markdown. A `<authorship-meter>`
  tag pasted into a README renders as nothing.
- **Any other sanitized viewer** — most Markdown renderers, some CMSs, anywhere
  user content is shown but scripts are stripped for safety.

**Where it does run:** a real HTML page — a GitHub Pages deploy, any static site,
any page you control the `<head>` of.

**Consequence for placement:** if the project's readable "content" is a README,
the live meter needs a *separate HTML page* to live on, and the README links out
to it rather than embedding it. Don't hardcode the current reading (band, %) as
text in the README — that number will drift the next time the declaration is
re-assessed (§7), and a stale hardcoded number is exactly the failure the meter
exists to prevent. Link to the live page; let it be the single source of truth.

---

## 2. Link the component, don't vendor it (for now)

Two ways to load `authorship-meter.js`:

- **Link** to the published copy: `https://luispsalas.github.io/authorship-meter/authorship-meter.js`
- **Vendor** a copy into the consuming repo.

**Recommendation while the spec is pre-1.0-stable: link.** Fixes and improvements
(like the v1.1 provenance work) land automatically in every project that links,
with no manual resync. The tradeoff is a live external dependency — if that URL
ever moves or the component ships a breaking change, linked pages are affected
immediately. Revisit vendoring (a pinned copy per project) once the component
reaches a stable release; note that decision in the consuming project's own
context file when you make it.

---

## 3. Write the declaration — don't guess it

`authorship.json` must be produced by running [ASSESSMENT.md](ASSESSMENT.md)
against an actual account of how the project was made — who had the idea, who
structured it, who produced it, who edited it, who verified it, in what order.
**Not** by reading the finished code or README and inferring backward; ASSESSMENT.md
is explicit that an unsourced declaration is worse than none.

Practically: open a session with [ASSESSMENT.md](ASSESSMENT.md) loaded, in the
target repo, with its real history available (git log, the author's own account of
the build), and let it produce the JSON. `method: llm-assisted` is the encouraged
default (SPEC §1, principle 6) — the model assesses, the author confirms or
contests before it ships.

Required for v1.1 validity (SPEC §6.3): `assessed_at` and `subject.version`
(commit SHA, semver, or date — whatever identifies the state assessed).
Recommended: `subject.source` (the repo, so the declaration link in §6.2 resolves).

---

## 4. Files to add

For a project with a real HTML surface (a built site, a Pages deploy, any static
host):

| File | Purpose |
|---|---|
| `authorship.json` | The declaration (§3). Wherever it's fetchable relative to the page that embeds it. |
| A page hosting `<authorship-meter src="authorship.json">` | Either the project's existing content page (§8 placement: intro line + meter at the foot), or — if the readable surface is a sanitized README — a small dedicated page (§1). |

Minimal dedicated-page shell:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Authorship — <project name></title>
  <script src="https://luispsalas.github.io/authorship-meter/authorship-meter.js" defer></script>
</head>
<body>
  <authorship-meter src="authorship.json"></authorship-meter>
</body>
</html>
```

The component renders its own provenance row (method, declarer, "Assessed <date>")
and both links (§6.2) — nothing else needs to be built by hand.

---

## 5. README placement (SPEC §8, adapted for sanitized Markdown)

**Intro line**, near the top, linking to an in-page anchor:

```markdown
This piece carries an [Authorship Meter](#authorship) declaration — human/AI
contribution, disclosed by stage.
```

**Bottom section**, under that anchor — since the live widget can't run here,
describe it and link out rather than embed it:

```markdown
## Authorship

This project publishes a live [Authorship Meter](https://github.com/luispsalas/authorship-meter)
declaration — how much came from a human vs. an AI model, by process stage.

**[View the current declaration →](<url to the dedicated page>)**

Self-assessed by the author (with LLM assistance) and re-issued whenever the
project changes materially.
```

---

## 6. Worked example — live-visuals

[live-visuals](https://github.com/luispsalas/live-visuals) is a Vite app (control
panel + output window as separate build entries) deployed to GitHub Pages via
Actions. Its `public/` directory is copied straight into the built site without
processing — the standard Vite passthrough — so static files dropped there need no
build-config change and land at the site root.

- **`public/authorship.json`** — the declaration. Not written yet (§3 applies:
  needs an actual assessment against live-visuals' build history, which this guide
  does not have).
- **`public/authorship.html`** — a dedicated page (§1: the README is GitHub-rendered
  Markdown, so the widget can't live there), served at
  `https://luispsalas.github.io/live-visuals/authorship.html` once built.
- **README.md** — intro line after the header image, before "## Start here"; an
  `## Authorship` section before `## Licence`, matching the doc's existing rhythm of
  closing meta-sections (Privacy & security, Credits, Licence).
- **`subject.type`**: `"code"` fits best — the primary artifact is the application,
  not a content site, even though it's browsed via a Pages URL. Judgment call, noted
  here so a future re-assessment doesn't second-guess it without reason.
- **Component**: linked (§2), not vendored — matches the project's WIP status.

Ready-to-paste file contents and the exact README diff are drafted per-session
rather than duplicated here, since they depend on the live-visuals declaration not
yet existing.
