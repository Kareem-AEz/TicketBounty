# convit Configuration Reference

Full semantics for every field in `.convitrc.json`. All fields are optional.
The config file is safe to commit — API credentials never belong here.

---

## `rules`

Controls commit message formatting and LLM behavior.

### `rules.maxSubjectLength`

| | |
|-|-|
| **Type** | `number` |
| **Default** | `50` |
| **Range** | 40–72 recommended |

Maximum character count for the `type(scope): subject` line (the first line of
the commit message). Validation fails if the generated subject exceeds this.

- `50` is the [Conventional Commits](https://www.conventionalcommits.org/) and
  widely-accepted Git standard. Most Git GUIs truncate at 72.
- Raise to `72` if your team prefers more descriptive subjects.
- Lower to `40` if you enforce very terse one-liners.

**Effect on the correction loop:** if the LLM generates a subject over this
limit, it receives a `must_fix` correction hint on the next retry with the
exact character count and the limit.

---

### `rules.maxBulletLength`

| | |
|-|-|
| **Type** | `number` |
| **Default** | `72` |
| **Range** | 60–100 recommended |

Maximum character count per bullet point in the commit body.

- `72` is the traditional `git log` line-wrap standard and matches most
  terminal widths.
- Raise to `100` for teams that read diffs in wide IDE panes.
- Lower to `60` for changelog pipelines that wrap aggressively.

---

### `rules.minBullets`

| | |
|-|-|
| **Type** | `number` |
| **Default** | `1` |
| **Range** | 0–5 |

Minimum number of bullet points the LLM must include in the commit body.

- `1` (default) — requires at least one line of context after the subject.
- `0` — allows subject-only commits (`feat(auth): add login`). Useful for
  small single-file changes where a body adds no information.
- `2` or `3` — enforces richer context. Good for teams that use `git log`
  as a changelog.

**Effect on the correction loop:** if the LLM returns fewer bullets than
this minimum, it receives a `must_fix` hint with the exact count deficit.

---

### `rules.temperature`

| | |
|-|-|
| **Type** | `number` |
| **Default** | `0.2` |
| **Range** | 0.0–1.0 |

LLM sampling temperature passed to the model API.

- `0.0` — fully deterministic. Identical diffs produce identical messages.
  Can become repetitive for similar changesets.
- `0.2` (default) — focused and consistent without being robotic. Recommended
  for most projects.
- `0.3`–`0.4` — slightly more varied phrasing. convit escalates to these
  automatically on retries (`[0.2, 0.3, 0.4]`), so you rarely need to
  change this.
- `0.7`+ — creative but unreliable for structured output formats. Avoid.

Omit this key unless you have a specific reason to change it — convit manages
temperature progression internally during the retry loop.

---

### `rules.timeout`

| | |
|-|-|
| **Type** | `number` |
| **Default** | `60000` |
| **Env override** | `CONVIT_TIMEOUT` |

Request timeout in milliseconds for the LLM API call. If the model does not
respond within this window, convit aborts and reports a timeout error.

- `60000` (default) — 60 seconds. Suitable for most models.
- `120000` — 2 minutes. Use for slower models or large diffs.
- `30000` — 30 seconds. Use for fast local models (e.g. LM Studio).

Env `CONVIT_TIMEOUT` takes precedence over `rules.timeout` in `.convitrc`.

---

## `scopePatterns`

An array of regex rules that map file paths to commit scopes. convit runs all
patterns against every changed file in the diff, tallies the weighted votes,
and emits the winning scope.

**Shape of each entry:**

```typescript
{
  pattern: string  // regex string — do NOT wrap in /slashes/
  scope:   string  // emitted scope value, or "$1" to use first capture group
  weight:  number  // vote weight — higher wins ties
}
```

### `scopePatterns[].pattern`

A regex string (not a regex literal — no `/` wrapping). Tested against each
changed file path using `new RegExp(pattern)`.

- Use `([^/]+)` to capture a directory name segment.
- Paths use forward slashes on all platforms.
- Patterns are tested against the full relative path from repo root
  (e.g. `src/features/auth/login.ts`).

### `scopePatterns[].scope`

The scope string emitted when the pattern matches.

- Plain string: `"db"`, `"ui"`, `"api"` — always emits that literal value.
- `"$1"` — substitutes the first regex capture group. For the pattern
  `src/features/([^/]+)/.*` matching `src/features/auth/login.ts`,
  `"$1"` emits `"auth"`.

### `scopePatterns[].weight`

Integer vote weight. Every file that matches a pattern casts `weight` votes
for that scope. The scope with the highest total votes across all changed
files wins.

Recommended weight scale:

| Weight | When to use |
|--------|-------------|
| `10` | Primary structural boundary (feature slices, packages, crates) |
| `8` | Generic source directories (`src/`) |
| `5` | Cross-cutting layers (UI components, DB schema) |
| `3` | Auxiliary directories (scripts, tools) |

**User-defined patterns run before built-in defaults.** If your pattern
matches, it takes precedence over the built-in `packages/` and `src/`
patterns.

**Built-in default patterns** (applied when no user patterns match):

```
packages/([^/]+)/.*  →  $1   weight 10
src/([^/]+)/.*       →  $1   weight 8
components/.*        →  ui   weight 5
schema.*             →  db   weight 5
```

---

## `exclude`

| | |
|-|-|
| **Type** | `string[]` |
| **Default** | See below |

File paths or glob patterns to exclude from diff analysis entirely. Excluded
files do not appear in the diff sent to the LLM and do not participate in
scope voting.

**Built-in excludes** (always active, cannot be overridden):

```
package-lock.json   pnpm-lock.yaml   yarn.lock
Cargo.lock          go.sum           Gemfile.lock
.turbo              target/          __pycache__/
.pytest_cache/
```

**When to add entries:**

- Generated client code: `"src/generated/prisma"`, `"src/graphql/__generated__"`
- Framework output: `".next/"`, `"dist/"`, `"build/"`, `"out/"`
- Large auto-formatted files that add noise without signal

**Example:**

```json
"exclude": [
  "src/generated/prisma",
  ".next/",
  "public/assets/"
]
```

---

## Environment variables (not in config file)

These are never read from `.convitrc.json`. Set them in `.env`.

| Variable | Required | Description |
|----------|----------|-------------|
| `CONVIT_URL` | Yes | Base URL of the OpenAI-compatible API (`https://api.openai.com/v1`, LM Studio, etc.) |
| `CONVIT_KEY` | Cloud only | API key. Not needed for local models (LM Studio, Ollama). |
| `CONVIT_MODEL` | No | Model ID override. Auto-detected from LM Studio if omitted. |
| `CONVIT_INPUT_COST` | No | Cost per 1M input tokens in USD. Enables cost display. |
| `CONVIT_OUTPUT_COST` | No | Cost per 1M output tokens in USD. Enables cost display. |

**Precedence:** `--model` flag > env vars > `.convitrc` > defaults.
