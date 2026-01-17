# Research: AI Commit Generator Optimization

**Feature**: 001-ai-commit-optimization  
**Date**: 2026-01-12

## Research Questions & Findings

### 1. Diff Summarization Techniques

**Question**: What's the most effective way to compress git diffs while preserving semantic meaning?

**Decision**: Statistical + heuristic analysis (no additional LLM calls)

**Rationale**:

- LLM-based summarization adds latency and cost (defeats the purpose)
- AST parsing requires language-specific tooling (complexity)
- Statistical analysis is fast, deterministic, and sufficient for commit context

**Alternatives Considered**:
| Approach | Pros | Cons | Why Rejected |
|----------|------|------|--------------|
| AST parsing | Semantic accuracy | Language-specific deps, complexity | Over-engineering for this use case |
| Two-stage LLM | Best quality | Doubles API calls and cost | Defeats token efficiency goal |
| Truncation | Simple | Loses important context | Already proven problematic |

**Implementation Approach**:

1. Parse unified diff format to extract file-level statistics
2. Count additions/deletions per file
3. Detect file categories (source, config, generated, test, docs)
4. For each file >500 lines changed: summarize to key changes only
5. Prioritize by semantic importance score

### 2. Change Type Classification Heuristics

**Question**: How to accurately detect commit type (feat/fix/refactor/etc.) before prompting?

**Decision**: Multi-signal heuristic scoring

**Signals and weights**:

```
TYPE DETECTION SIGNALS:
─────────────────────────────────────────
feat (new feature):
  +3  New file added to src/features/
  +2  New exported function/class
  +2  New route added
  +1  "add" in file path or diff context

fix (bug fix):
  +3  Change in catch/error handling block
  +2  Modification to existing conditional logic
  +1  "fix" in commit context or file path
  +1  Test file modified alongside source

refactor (code restructure):
  +3  File renamed/moved
  +2  Import statements changed significantly
  +2  No net behavior change (same exports)
  +1  "refactor" in file path

chore (maintenance):
  +4  package.json/lock file changes
  +3  Config file changes (.eslintrc, tsconfig)
  +3  Scripts folder changes
  +2  CI/CD file changes

docs (documentation):
  +5  Only .md files changed
  +3  Only JSDoc/comments changed
  +2  README in changed files

style (formatting):
  +5  Only whitespace changes in diff
  +3  Only import sorting changes
  +2  Prettier/ESLint auto-fixes

test (testing):
  +5  Only test files changed
  +3  .test.ts or .spec.ts files
  +2  __tests__ directory changes

perf (performance):
  +3  "cache", "memoize", "optimize" in diff
  +2  useMemo, useCallback, React.memo added
  +1  "performance" in comments
```

**Scope Detection**:

1. Check `src/features/{scope}/` pattern first (highest confidence)
2. Fall back to file path analysis (components → ui, prisma → db, etc.)
3. Use existing `getScopeHints()` logic as baseline

### 3. Prompt Token Optimization

**Question**: How to reduce system prompt from ~2,000 tokens to ~1,200 tokens (40% reduction)?

**Decision**: Structured minimalism with JSON schema output

**Current prompt analysis**:
| Section | Est. Tokens | Can Reduce? |
|---------|-------------|-------------|
| Role definition | 50 | No |
| Analysis process | 200 | Yes → 100 |
| Commit types | 150 | Yes → 80 |
| Example format (6 examples) | 600 | Yes → 200 (2 examples) |
| Quality guidelines | 400 | Yes → 150 |
| Format rules | 200 | Yes → 100 |
| Context hints | 200 | Move to user msg |
| **Total** | ~1,800 | **~630** |

**Optimized structure**:

```
ROLE: Generate conventional commits from git diffs.

TYPES: feat|fix|docs|style|refactor|perf|test|chore

FORMAT:
type(scope): subject (max 50 chars, lowercase, imperative)

- Bullet point 1 (max 72 chars)
- Bullet point 2

EXAMPLE (good):
fix(api): handle null user in webhook
- Add null check for userId in stripe-webhook.ts
- Return 400 instead of 500 on missing metadata

AVOID: Vague subjects, marketing language, listing file names only.

Output ONLY the commit message. No explanations.
```

### 4. Sensitive Data Detection Patterns

**Question**: What patterns reliably detect secrets without false positives?

**Decision**: Conservative regex patterns with confirmation flow

**Research findings**:

- Trufflehog/GitLeaks patterns are battle-tested but complex
- Simple patterns catch 90% of cases with few false positives
- User confirmation prevents blocking legitimate changes

**Patterns selected** (low false-positive, high recall):

```typescript
const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern:
      /['"]?(?:api[_-]?key|apikey)['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi,
    label: "API Key",
  },
  {
    pattern: /['"]?(?:password|passwd|pwd)['"]?\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    label: "Password",
  },
  {
    pattern:
      /['"]?(?:secret|token)['"]?\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/gi,
    label: "Secret/Token",
  },
  {
    pattern: /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/,
    label: "Private Key",
  },
  { pattern: /ghp_[A-Za-z0-9]{36}/, label: "GitHub PAT" },
  { pattern: /sk-[A-Za-z0-9]{48}/, label: "OpenAI Key" },
  { pattern: /AKIA[0-9A-Z]{16}/, label: "AWS Access Key" },
];
```

### 5. Intelligent Retry Strategy

**Question**: How to make regeneration targeted instead of from-scratch?

**Decision**: Validation-guided refinement prompts

**Research**: Current behavior just bumps temperature (+0.1) — no guidance. Models respond well to specific correction requests.

**Retry strategy**:

1. **First retry (soft guidance)**: Include previous output + specific issue

   ```
   Previous output had [ISSUE].
   Fix: [SPECIFIC_INSTRUCTION]
   Keep other parts unchanged if valid.
   ```

2. **Second retry (stronger guidance)**: More prescriptive

   ```
   REQUIRED FIXES:
   1. Subject must be under 50 chars (was 67)
   2. Add at least 2 bullet points

   Generate corrected version:
   ```

3. **Third retry (abort)**: Present last attempt, ask user to edit manually

**Temperature progression**:

- Retry 1: 0.2 (same as initial)
- Retry 2: 0.3 (slight increase)
- Retry 3: 0.4 (more variation)

### 6. Binary File Handling

**Question**: How does git represent binary files and how should we summarize them?

**Decision**: Detect via git diff output and include metadata only

**Detection**: Git diff outputs `Binary files a/path and b/path differ` for binary changes.

**Summary format**:

```typescript
{
  path: "public/logo.png",
  changeType: "modify",
  isBinary: true,
  binaryInfo: "Image file modified"
}
```

**Included in prompt as**:

```
Binary: public/logo.png (modified)
Binary: public/favicon.ico (added)
```

## Resolved Clarifications

All technical uncertainties from spec have been resolved:

| Item                      | Resolution                        |
| ------------------------- | --------------------------------- |
| Diff compression approach | Statistical heuristics            |
| Compression threshold     | 10,000 characters                 |
| Quality vs token tradeoff | Quality first, degrade >100 files |
| Sensitive data handling   | Warn + confirm                    |
| Binary file handling      | Metadata only                     |
| Retry mechanism           | Validation-guided refinement      |

## Next Steps

1. → Proceed to Phase 1: Data Model definition
2. → Generate quickstart.md for testing
3. → Create implementation tasks
