# Authorship Meter — Assessment & Integration Playbook

A portable, self-contained guide for adding an **Authorship Meter** declaration to a
software or content project — and, crucially, for **producing that declaration from
the project's own history** rather than guessing it.

Hand this entire file to an LLM or agent working *inside the target project's
repository*. It contains everything needed to run the assessment and wire up the
files, without any other document present.

- **What the meter is:** a disclosure format showing how much of a work came from a
  human vs. an AI model, broken down by five process stages, on a five-level scale.
- **Canonical sources** (stable URLs — consult for the full definitions):
  - Spec: <https://github.com/luispsalas/authorship-meter/blob/main/SPEC.md>
  - Assessment instructions: <https://github.com/luispsalas/authorship-meter/blob/main/ASSESSMENT.md>
  - Component: `https://luispsalas.github.io/authorship-meter/authorship-meter.js`
  - Schema: `https://luispsalas.github.io/authorship-meter/authorship.schema.json`
- **Status:** the format is a work in progress (spec v1.1) and expected to improve
  with feedback. Loop findings back to the canonical repo.

---

## The model in one screen

**Five stages**, each declared at exactly **one of five levels**:

| Stage | Question it answers |
|---|---|
| **Conception** | Whose idea, thesis, or angle is this? |
| **Structure** | Who decided the architecture, outline, or composition? |
| **Production** | Who made the artifact itself — prose, code, pixels, audio? |
| **Curation** | Who selected, cut, revised, and shaped the result? |
| **Verification** | Who fact-checked, tested, and signed off? |

| Level | Name | Human share | AI share |
|---|---|---|---|
| 1 | Human only | 100% | 0% |
| 2 | Human-led, AI-assisted | 75% | 25% |
| 3 | Co-created | 50% | 50% |
| 4 | AI-led, human-directed | 25% | 75% |
| 5 | AI-generated | 0% | 100% |

Composite = mean of the five levels → mapped to a band (*Human authored* →
*Human-led, AI-assisted* → *Co-created* → *AI-led, human-directed* →
*AI-generated, human-verified*).

**Hard rule:** Verification may never be level 5 — a human always signs off. A
project with no human verification step cannot use this meter.

---

# Part A — Produce the declaration from the project's history

The point of this section is honesty of sourcing. A declaration inferred by *reading
the finished artifact* is worse than none: polished code is not evidence of AI
production, and rough code is not evidence of human production. The project's **git
history plus the author's own account** are the evidence base. History is richest for
Production and Curation; it is weakest for Conception and Verification, which usually
need the author to speak. Use both.

## A.1 — Mine the repository's history

Run these in the target repo and read the output as *evidence*, not as answers:

```bash
# Timeline, authors, and subjects — the shape of how the work grew
git log --date=short --format='%h  %ad  %an  %s'

# AI involvement signal: commits that credit a model as co-author
git log --format='%H%n%(trailers:key=Co-Authored-By)' | grep -iB1 -E 'claude|gpt|copilot|gemini|llm' || echo "no AI co-author trailers found"

# Volume of change per commit (leadership ≠ volume — see calibration rule 2)
git log --shortstat --date=short --format='%h %ad %s'

# The earliest commits — where structure and scaffolding were set
git log --reverse --date=short --format='%h %ad %s' | head -20

# Non-code decision surfaces, if present
ls -la  # look for docs/, DESIGN.md, ADR/, PRs, issue templates
```

**How to read the signals — and their limits:**

| Signal | What it suggests | Limit — do not over-read |
|---|---|---|
| `Co-Authored-By: Claude` (or other model) trailers | AI materially involved in **Production** / **Curation** of those commits | A trailer marks involvement, not *level*. Close human direction of an AI = level 4, not 5 (rule 2). Absence of a trailer is **not** proof of no AI — many people omit them. |
| Commit author name | Who *committed* | Not who *wrote*. A human can commit AI-generated code under their own name. The co-author trailer is the better signal; the author's account is better still. |
| Large diffs landing in one commit | Possible generated output | Could equally be a vendored library or a manual bulk edit. Inspect the diff. |
| Early commits / scaffolding | **Structure** evidence | Repo history begins at `git init`. **Conception usually predates the repo** — history cannot see it. Ask the author. |
| Test files, CI config, review comments | **Verification** evidence | Presence of tests ≠ who designed/ran them. Automated checks a human set up and reads = verification level 4; a human checking personally = 1–2. |
| Squashed / imported / force-pushed history | — | Granularity may be lost; treat a flat history as low-evidence and lean harder on the author's account. |

**If the repository has no meaningful history** (single "initial commit", squashed
import), say so explicitly and fall back entirely to the author's account. Do not
manufacture confidence the history doesn't support.

## A.2 — Ask the author what history can't show

History is silent on intent and on pre-repo work. Get these from the author before
assigning Conception or Verification:

- Where did the idea come from — a brief, a conversation, their own thinking?
- Was there an outline, design, or architecture decided before the first commit? By whom?
- Which parts were generated by a model, and which were typed by a person?
- Between first draft and final: how much was cut, rewritten, or reordered, and by whom?
- Who checked it — facts, tests, links, behavior — and how?
- Which models or tools were materially involved?

## A.3 — Assign a level per stage

For each stage, pick the level whose description best fits the combined evidence.

**Conception** — *whose idea, thesis, or angle?*
1. Declarer had the idea; AI absent. · 2. Declarer's idea; AI sharpened it. ·
3. Idea emerged from back-and-forth. · 4. AI proposed the direction; declarer chose
and constrained. · 5. AI proposed the work; declarer accepted as-is.

**Structure** — *who decided architecture, outline, composition?*
1. Designed entirely by declarer. · 2. Declarer's structure; AI suggested. ·
3. Negotiated across iterations. · 4. AI proposed; declarer approved/adjusted. ·
5. Taken from AI output unchanged.

**Production** — *who made the artifact itself?*
1. Every line/word/frame by a person. · 2. Person produced it; AI filled fragments. ·
3. Substantial parts from each, interleaved. · 4. AI generated the substance to the
declarer's spec, reviewed as it went. · 5. AI generated it; declarer did not modify.

**Curation** — *who selected, cut, revised?*
1. All selection/editing by declarer. · 2. Declarer edited throughout; AI suggested. ·
3. Editing shared. · 4. AI performed revision passes; declarer set criteria. ·
5. No human curation; first output shipped.

**Verification** — *who checked and signed off?*
1. Declarer verified personally. · 2. Declarer verified, AI surfaced candidates. ·
3. Shared automated + manual. · 4. Automated checks did it; declarer designed and
read them. · **5. Not declarable** (verification ceiling).

## A.4 — Calibration rules

Apply when evidence is thin or a stage sits between two levels:

1. **When uncertain, choose the higher (more AI) level.** Under-disclosure costs trust; over-disclosure is merely unflattering.
2. **Volume is not leadership.** A model producing 90% of the code under close line-by-line direction is level 4, not 5. Level 5 means the human did not meaningfully intervene.
3. **Editing does not lower Production.** Heavy human editing of AI output is recorded in **Curation**, not by discounting Production. Avoid this double-count.
4. **Tool use is not AI use.** Spell-check, autocomplete, search, linters, deterministic formatters do not raise a level. Generative assistance does.
5. **Prompting is conception work, and it is human.** A detailed brief to a model is a human contribution to Conception/Structure — but it does not lower Production.
6. **Judge the shipped work, not the process's best moment.** If three drafts were hand-written and the fourth regenerated and shipped, declare the fourth.
7. **Do not smooth the profile.** Real work is often 1 / 2 / 5 / 2 / 1. A jagged profile is informative; flattening it to the middle destroys the signal.

## A.5 — Write the notes

Each stage gets **one concrete sentence** naming what actually happened. Notes carry
the format's credibility; levels without notes are a badge, not a disclosure. Do not
restate the level name.

- Good: `"HTML and shaders generated from a written spec; reviewed commit by commit."`
- Bad: `"AI helped with production."`

## A.6 — Emit valid JSON and check it

Produce `authorship.json` following the template in Part C. Then verify:

- [ ] All five stages present, each level 1–5.
- [ ] Verification is **not** 5.
- [ ] Every note is one concrete sentence.
- [ ] `assessed_at` is today's date.
- [ ] `subject.version` identifies the state assessed — a commit SHA (`git rev-parse --short HEAD`), semver, or date.
- [ ] `subject.source` points to the repo (so the declaration is inspectable).
- [ ] `method` is `llm-assisted` when a model produced this declaration.
- [ ] `tools` lists models that materially contributed.

Then **report** the composite, the human/AI share, and the band — and state in one
line whether the band matches the intuitive story of how the work was made. If it
doesn't, the levels are probably wrong; revisit rather than trusting the arithmetic.

**Then hand it to the human to confirm or contest before it ships** — `llm-assisted`
means the model assesses and the author signs off, not that the model's word is final.

---

# Part B — Wire it into the project

## B.1 — Where the live widget can and can't run

The component is a custom element; it needs `<script>` to execute.

- **It will NOT run in a GitHub-rendered README** (or any Markdown viewer that strips
  scripts). A `<authorship-meter>` tag pasted into a README renders as nothing.
- **It runs on a real HTML page** — a GitHub Pages deploy, any static host, any page
  whose `<head>` you control.

**Therefore:** if the project's readable surface is a README, give the meter its own
small HTML page and link to it from the README. **Never** hardcode the current band
or percentage as text in the README — it will go stale the moment the work is
re-assessed, which is exactly what the meter exists to prevent. Link to the live
page; let it be the single source of truth.

## B.2 — Files to add

| File | Where | Purpose |
|---|---|---|
| `authorship.json` | Fetchable next to the page that embeds it (for static-site frameworks, usually a passthrough dir like `public/`) | The declaration. |
| `authorship.html` | Same place | Hosts the live widget (Part C shell). |

For frameworks with a build step (Vite, etc.), put both in the static passthrough
directory (`public/`) so they ship to the site root unprocessed. For a plain static
site, put them anywhere served.

## B.3 — README placement (non-invasive standard)

**Intro line**, near the top:

```markdown
This project carries an [Authorship Meter](#authorship) declaration — human/AI
contribution, disclosed by stage.
```

**Section at the foot**, before the license:

```markdown
## Authorship

This project publishes a live [Authorship Meter](https://github.com/luispsalas/authorship-meter)
declaration — how much came from a human vs. an AI model, by process stage.

**[View the current declaration →](<url to the authorship.html page>)**

Self-assessed by the author (with LLM assistance) and re-issued whenever the
project changes materially.
```

## B.4 — Link vs. vendor the component

- **Link** to `https://luispsalas.github.io/authorship-meter/authorship-meter.js` —
  fixes and spec improvements land automatically. Recommended while the format is
  pre-1.0-stable. Tradeoff: a live external dependency.
- **Vendor** a pinned copy into the repo once the format stabilizes, for
  reproducibility. Record that choice in the project's own notes when you make it.

## B.5 — Keeping it true over time (revision model)

A declaration describes the work **as it currently stands**. Re-assess and replace it
when the work changes *materially* — substantial content added/removed/rewritten, a
direction change, a new production pass, or verification performed for the first
time. Typos, formatting, restyling, and dependency bumps do **not** trigger it.
Operational test: *would any stage level move by ≥ 1?* If yes, re-run Part A, bump
`assessed_at` and `subject.version`, and (optionally) prepend the old declaration to
a `history` array with a `reason`. As an author revises and verifies their own work,
its declaration naturally drifts *toward human* — that is intended.

---

# Part C — Templates

### `authorship.json`

```json
{
  "version": "1.1",
  "subject": {
    "name": "<project name>",
    "type": "code",
    "url": "<live URL, if any>",
    "source": "<repository URL>",
    "version": "<commit SHA / semver / date assessed>",
    "updated": "<date of last material change>"
  },
  "assessed_at": "<YYYY-MM-DD>",
  "stages": {
    "conception":   { "level": 0, "note": "" },
    "structure":    { "level": 0, "note": "" },
    "production":   { "level": 0, "note": "" },
    "curation":     { "level": 0, "note": "" },
    "verification": { "level": 0, "note": "" }
  },
  "tools": ["<model(s) that materially contributed>"],
  "declared_by": "<accountable owner>",
  "method": "llm-assisted"
}
```

`subject.type` — one of: `article` · `site` · `code` · `video` · `audio` · `image` ·
`deck` · `dataset` · `other`. For an application browsed via a web URL, `code` is
usually the better fit than `site` — the primary artifact is the program, not a
content page.

### `authorship.html`

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Authorship — <project name></title>
<style>
  body { margin: 0; padding: 2.5rem 1.25rem 4rem; font: 15px/1.6 system-ui, sans-serif; }
  main { max-width: 34rem; margin: 0 auto; }
  p.back { margin-bottom: 2rem; }
</style>
<script src="https://luispsalas.github.io/authorship-meter/authorship-meter.js" defer></script>
</head>
<body>
<main>
  <p class="back"><a href="./">← Back to the project</a></p>
  <h1>Authorship</h1>
  <p>How this project was made — human and AI contribution, by process stage.</p>
  <authorship-meter src="authorship.json"></authorship-meter>
</main>
</body>
</html>
```

The component renders its own provenance row (method, declarer, "Assessed &lt;date&gt;")
and both links — nothing else needs building by hand.

---

*Authorship Meter is a work in progress. This playbook tracks spec v1.1. Feedback →
<https://github.com/luispsalas/authorship-meter>.*
