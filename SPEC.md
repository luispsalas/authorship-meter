# Authorship Meter — Specification v1.0

A disclosure format for describing how a piece of work was made: what a human
contributed, what an AI contributed, and at which point in the process.

The meter is **ball-park by design**. It answers "roughly how was this made?" — not
"exactly how many words did the model write?"

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
(see §6). The bar renders `ai_share` on the right, the remainder on the left.

### 4.1 Level → AI share (single stage)

| Level | AI share |
|---|---|
| 1 | 0% |
| 2 | 25% |
| 3 | 50% |
| 4 | 75% |
| 5 | 100% |

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
  "version": "1.0",
  "subject": {
    "name": "AI Metrics Catalog",
    "type": "site",
    "url": "https://example.org/catalog/",
    "date": "2026-06-18"
  },
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
| `subject.url` | no | Canonical location of the work. |
| `subject.date` | no | ISO date the work was completed. |
| `stages` | yes | All five stages, each with a `level` (1–5) and optional `note`. |
| `weights` | no | Per-stage overrides. Omit for equal weighting. |
| `tools` | no | Models or tools materially involved. |
| `declared_by` | no | Who made this declaration. |
| `method` | no | `self-declared` · `llm-assisted` · `third-party` |

Notes are short — one sentence. They are the difference between a badge and a
disclosure, so they carry most of the format's credibility.

---

## 6. Weight profiles

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

## 7. What this format is not

- **Not a quality signal.** A human-authored work is not thereby good.
- **Not a licensing or copyright claim.** Authorship for legal purposes is a
  separate question this format does not attempt to answer.
- **Not automatically verifiable.** A declaration is a claim by its declarer. The
  `method` field records how it was arrived at; it does not prove it.
- **Not a token count.** Where a real countable quantity exists (lines of code,
  say), report it in a note. Do not convert it into a level and call it measured.

---

## 8. Relationship to other schemes

The declaration is intended to be compatible with, not a replacement for,
provenance standards that operate at the file level (C2PA Content Credentials and
similar). Those record *what happened to a file*; this records *how a work was
made*. A future revision may define a mapping between the two.

---

## 9. Versioning

The spec is versioned independently of the component. A declaration states the
spec version it follows. Breaking changes — adding or removing a stage, changing
the level→share mapping, changing band boundaries — require a major version bump,
because they silently change every existing declaration's headline.
