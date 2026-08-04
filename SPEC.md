# Authorship Meter — Specification v1.1

A disclosure format for describing how a piece of work was made: what a human
contributed, what an AI contributed, and at which point in the process.

The meter is **ball-park by design**. It answers "roughly how was this made?" — not
"exactly how many words did the model write?"

> **v1.1 adds** the provenance and validity a public claim needs — *when* it was
> assessed, *who* claims it, *how* (self / LLM / third-party), *which version* of
> the work it describes — plus a placement standard for embedding it, and a
> revision model so a declaration stays true as the work changes. It does **not**
> change the stage set, the level→share mapping, or the band boundaries, so a v1.0
> declaration still renders correctly. *Implementation status:* the spec is v1.1;
> the published component and `authorship.schema.json` currently implement v1.0.
> Migration is tracked in the project backlog.

---

## 1. Design principles

1. **Ordinal, not continuous.** Contributions are declared as one of five named
   levels per stage. Percentages look precise; the underlying judgment is not.
2. **Derived rendering.** The visual bar is computed from the declared levels via a
   fixed, published mapping. Nobody tunes a number until it looks flattering.
3. **Stages, not a single blob.** "Human idea, AI production" is the interesting
   case. A one-dimensional split cannot express it.
4. **Disclosure, not defense.** The format exists to describe process honestly. It
   is not a quality mark and confers no endorsement.
5. **Legible in three seconds.** The headline band and bar must communicate without
   the reader learning the scheme first. Detail is progressive.
6. **Good-faith declaration, traceable claim.** The format cannot enforce truth; it
   makes a claim legible, sourced, and dated so that dishonesty is *visible* and the
   claim is *accountable*. It assumes honesty and clarity from the human actor and
   is built so that assumption can be checked. In the first stage of adoption the
   encouraged default is an **LLM-produced assessment** (`method: llm-assisted`)
   that the human confirms or contests — an outside assessor blunts the
   self-crediting bias inherent in pure self-declaration.

---

## 2. The five stages

| Stage | Question it answers |
|---|---|
| **Conception** | Whose idea, thesis, or angle is this? |
| **Structure** | Who decided the architecture, outline, or composition? |
| **Production** | Who made the artifact itself — prose, code, pixels, audio? |
| **Curation** | Who selected, cut, revised, and shaped the result? |
| **Verification** | Who fact-checked, tested, and signed off? |

Stages are ordered by process, not importance. All five are declared; none may be
omitted.

---

## 3. The five levels

Each stage takes exactly one level.

| Level | Name | Meaning |
|---|---|---|
| **1** | Human only | No AI involvement in this stage. |
| **2** | Human-led, AI-assisted | Human drives; AI suggests, drafts fragments, or accelerates. |
| **3** | Co-created | Neither party's contribution dominates; the result is genuinely mixed. |
| **4** | AI-led, human-directed | AI produces the substance; human sets direction and constraints. |
| **5** | AI-generated | AI produced this stage; human involvement is limited to accepting it. |

### 3.1 Rule — verification ceiling

**Verification may not be declared level 5.** A human always signs off. Work with
no human verification step cannot use this meter.

Level 4 on verification is permitted but should be rare — it means automated checks
did the work and a human set them up.

---

## 4. Composite and rendering

```
composite = Σ(level × weight) / Σ(weight)
ai_share  = (composite − 1) / 4 × 100
```

Weights default to `1` for every stage and may be overridden per project type
(see §9). The bar renders `ai_share` on the right, the remainder on the left.

### 4.1 Level → share (single stage)

Human and AI share are complementary and always sum to 100%. **Both are surfaced to
the reader**, color-matched to the bar; neither end of the scale is privileged.
An unfamiliar reader should never have to subtract to learn the human side, and
showing AI share alone reads as advocacy rather than disclosure.

| Level | Human share | AI share |
|---|---|---|
| 1 | 100% | 0% |
| 2 | 75% | 25% |
| 3 | 50% | 50% |
| 4 | 25% | 75% |
| 5 | 0% | 100% |

### 4.2 Composite → band label

| Composite | Band |
|---|---|
| 1.0 – 1.49 | **Human authored** |
| 1.5 – 2.49 | **Human-led, AI-assisted** |
| 2.5 – 3.49 | **Co-created** |
| 3.5 – 4.49 | **AI-led, human-directed** |
| 4.5 – 5.0 | **AI-generated, human-verified** |

The band is the headline. The bar is the texture. The stage rows are the evidence.

---

## 5. Declaration format

A declaration is a JSON object, conventionally `authorship.json`, validated against
[`authorship.schema.json`](authorship.schema.json).

```json
{
  "version": "1.1",
  "subject": {
    "name": "AI Metrics Catalog",
    "type": "site",
    "url": "https://example.org/catalog/",
    "source": "https://github.com/example/ai-metrics-catalog",
    "version": "2026-06-18",
    "updated": "2026-06-18"
  },
  "assessed_at": "2026-06-18",
  "stages": {
    "conception":   { "level": 1, "note": "Taxonomy and layer model defined by the author." },
    "structure":    { "level": 2, "note": "Card schema drafted by author, refined with AI." },
    "production":   { "level": 4, "note": "HTML/CSS/JS generated to spec, reviewed per file." },
    "curation":     { "level": 2, "note": "Every metric row selected and edited by hand." },
    "verification": { "level": 2, "note": "Author verified formulas and tool references." }
  },
  "tools": ["Claude Opus 5"],
  "declared_by": "Luis Salas",
  "method": "llm-assisted"
}
```

### 5.1 Fields

| Field | Required | Notes |
|---|---|---|
| `version` | yes | Spec version this declaration follows. |
| `subject.name` | yes | What is being described. |
| `subject.type` | yes | `article` · `site` · `code` · `video` · `audio` · `image` · `deck` · `dataset` · `other` |
| `subject.url` | no | Canonical location of the work (where a reader finds it). |
| `subject.source` | recommended | Where the work and its declaration live — repo or project page. The per-instance "source of the effort" (§6.2). |
| `subject.version` | **yes (v1.1)** | The state of the work this declaration describes — a git SHA, semver, or date. Makes the claim *scoped*. |
| `subject.updated` | no | When the work was last materially changed. Enables staleness detection (§6.3). |
| `assessed_at` | **yes (v1.1)** | ISO date the declaration was made or last revised. Makes the claim *current*. Do not confuse with `subject.date`/`updated`, which are about the work. |
| `stages` | yes | All five stages, each with a `level` (1–5) and optional `note`. |
| `weights` | no | Per-stage overrides. Omit for equal weighting. |
| `tools` | no | Models or tools materially involved. |
| `declared_by` | recommended | Who made this declaration — the accountable owner. |
| `method` | recommended | `self-declared` · `llm-assisted` · `third-party`. The trust tier; surface it, never bury it (§6.1). |
| `history` | no | Prior declarations, newest first — each an object with at least `assessed_at`, `band` (or `composite`), and `reason` (§7). |

Notes are short — one sentence. They are the difference between a badge and a
disclosure, so they carry most of the format's credibility.

> `subject.date` from v1.0 (date the work was completed) remains valid and is
> subsumed by `subject.version`/`subject.updated`; keep it if useful, but
> `assessed_at` — the date of the *assessment* — is the field that governs validity.

---

## 6. Provenance and validity

A declaration is a public claim. To be trustworthy it must say what it is about,
who is making it, and on what basis — and it must be able to admit when it has gone
out of date.

### 6.1 What every instance must surface

Awareness and sourcing are not optional metadata; they are part of the disclosure.
Every rendered meter must show, without the reader digging:

- **The reading** — band label, bar, and dual Human/AI share (§4).
- **Method** — `self-declared` / `llm-assisted` / `third-party`. This is the single
  most important trust signal, because self-declaration carries a known upward-human
  bias. It is shown, not hidden.
- **Declarer** — `declared_by`. A claim with an owner is accountable; an anonymous
  one is not.
- **Date** — `assessed_at`, labelled **"Assessed"** (see §6.4 on wording).
- **Two links** (§6.2).
- **A standing note** that the claim is the declarer's and is not endorsed by the
  meter (the one-line form of §10).

### 6.2 The two links — method and declaration

A meter instance carries two distinct provenances; collapsing them into one link
loses the accountability half.

1. **Method link** — *what does this scale mean?* Points at the Authorship Meter
   standard (this repository). It is **constant on every meter** and is rendered by
   the component itself; it does not belong in each declaration file. Surface as
   e.g. "About this scale ↗".
2. **Declaration link** — *who says this about this work, and can I inspect the
   claim?* Points at `subject.source` — where the work and its `authorship.json`
   live, ideally under version control so the claim has a history. This is the
   per-instance accountability anchor. Surface as e.g. "How this was assessed ↗".

### 6.3 Validity

A declaration is **valid** when it is:

1. **Scoped** — it states which version of the work it describes (`subject.version`).
2. **Current** — no material change to the work since `assessed_at` (§7).
3. **Sourced** — it was derived from an account of how the work was made, not
   inferred from the finished artifact (`method` records how; a sourced account is
   what `ASSESSMENT.md` requires).

**Staleness detection:** if `subject.updated` is later than `assessed_at`, the work
changed after it was last assessed. The component should render "declaration
predates the current version" rather than a confidently stale number. A meter that
can admit it is out of date is more trustworthy than one that cannot.

### 6.4 Assessed, not validated

`assessed_at` is the date the declaration was *made or revised by its declarer* — it
is **not** a date on which anyone independently validated the claim. Label it
"Assessed", never "Validated." Reserve the language of validation for a genuine
third-party review (`method: third-party`). Calling a self- or LLM-assisted
declaration "validated" overclaims — precisely the drift this format exists to
prevent.

---

## 7. Revision model

Work keeps moving after it is declared. Without a rule, every declaration silently
decays into a false statement.

**Governing rule:** *a declaration describes the work as it currently stands, not
the history of how it got there.* On material change the work is re-assessed and the
declaration is replaced. The past lives in version control (and optionally in
`history`), not in the badge. (Averaging contributions across revisions is rejected:
it requires weighting each revision by size, which is unreproducible — the same
failure that ruled out raw percentages.)

**Material change — triggers re-assessment:**

| Re-assess | Do not re-assess |
|---|---|
| Substantial content added, removed, or rewritten | Typos, formatting, link fixes |
| Thesis or direction changed | Restyling, dependency bumps |
| A new production pass by either party | Republishing unchanged content |
| Verification performed for the first time | — |

**Operational test:** *would any stage level move by ≥ 1?* If yes, re-assess and
bump `assessed_at` (and `subject.version`). If keeping history, prepend the prior
declaration to `history` with a `reason`.

**A consequence worth expecting:** as an author revises and verifies their own work,
its declaration moves *toward human* over time. The meter rewards continued human
involvement rather than freezing a launch-day snapshot.

---

## 8. Placement and communication standard

How a meter is placed is part of the disclosure. This is the standard for the
author's own **HTML** content (repositories, pages); it is a recommendation for
anyone else.

**Minimum standard — two touchpoints, non-invasive:**

1. **Intro reference line** — one plain-language sentence in the introductory
   section, linking down to the meter. It sets expectation early without disrupting
   the content. Template:

   > *This piece carries an [Authorship Meter](#authorship) declaration — human/AI
   > contribution, disclosed by stage.*

2. **The meter at the foot of the content** — the full widget rendered under an
   `#authorship` anchor, so the intro line jumps to it. This keeps the disclosure
   present but out of the way of the work itself.

The meter's own two links (§6.2) carry the reader onward — to the method and to the
declaration source. Nothing else is required in the body.

**Non-HTML surfaces** (decks, PDFs, printed matter) cannot run the component and
need a static text form of the declaration. This is **out of scope for v1.1** and
under review — see the project backlog. First-stage adoption targets HTML repos and
pages.

---

## 9. Weight profiles

Equal weighting is the default and should be preferred. Profiles exist for cases
where a stage genuinely matters more to how the work is judged.

| Profile | Conception | Structure | Production | Curation | Verification |
|---|---|---|---|---|---|
| `equal` (default) | 1 | 1 | 1 | 1 | 1 |
| `editorial` | 2 | 1 | 1 | 2 | 1 |
| `engineering` | 1 | 2 | 1 | 1 | 2 |
| `creative` | 2 | 1 | 2 | 1 | 1 |

A declaration using a non-default profile must say so, because it changes the
headline. Custom weights are permitted; undisclosed custom weights are not.

---

## 10. What this format is not

- **Not a quality signal.** A human-authored work is not thereby good.
- **Not a licensing or copyright claim.** Authorship for legal purposes is a
  separate question this format does not attempt to answer.
- **Not a validation.** A declaration is a claim by its declarer. `method` records
  how it was arrived at; `assessed_at` records when. Neither proves it true (§6.4).
- **Not a token count.** Where a real countable quantity exists (lines of code,
  say), report it in a note. Do not convert it into a level and call it measured.

---

## 11. Relationship to other schemes

The declaration is intended to be compatible with, not a replacement for,
provenance standards that operate at the file level (C2PA Content Credentials and
similar). Those record *what happened to a file*; this records *how a work was
made*. A future revision may define a mapping between the two.

---

## 12. Versioning

The spec is versioned independently of the component. A declaration states the spec
version it follows.

- **Major bump** — a change that silently alters an existing declaration's headline:
  adding or removing a stage, changing the level→share mapping, or moving band
  boundaries. None of these happened in v1.1.
- **Minor bump (v1.0 → v1.1)** — additive: new fields (`assessed_at`,
  `subject.version`, `subject.source`, `subject.updated`, `history`), the provenance
  and placement standards, and the revision model. A v1.0 declaration still renders;
  it simply is not *valid* under §6.3 until it carries `assessed_at` and
  `subject.version`.
