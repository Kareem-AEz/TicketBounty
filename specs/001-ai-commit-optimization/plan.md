# Implementation Plan: AI Commit Generator Optimization

**Branch**: `001-ai-commit-optimization` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-ai-commit-optimization/spec.md`

## Summary

Optimize the existing `scripts/ai-commit.ts` CLI tool to reduce token usage by 50% through intelligent diff summarization using statistical + heuristic analysis (no additional LLM calls), improve commit message quality with pre-analysis change classification, and implement intelligent retry mechanisms with targeted correction guidance.

**Key Technical Decisions (from Clarifications):**
- Diff summarization: Statistical + heuristic analysis (deterministic, no LLM)
- Compression threshold: 10,000 characters (~2,500 tokens)
- Quality tradeoff: Maintain quality for <100 files; graceful degradation for edge cases
- Sensitive data: Warn + require explicit confirmation
- Binary files: Metadata only (filename, size, change type)

## Technical Context

**Language/Version**: TypeScript 5 (tsx runtime)  
**Primary Dependencies**: @ai-sdk/openai-compatible, ai (Vercel AI SDK 6.x), child_process, readline  
**Storage**: N/A (stateless CLI tool)  
**Testing**: Manual testing with benchmark diffs  
**Target Platform**: Node.js CLI (cross-platform via tsx)  
**Project Type**: Single standalone script  
**Performance Goals**: 50% token reduction, 30% faster generation for large diffs  
**Constraints**: Must work with any OpenAI-compatible API (LM Studio, Gemini, Groq, OpenAI)  
**Scale/Scope**: Handle diffs up to 500 files without context overflow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies | Status | Notes |
|-----------|---------|--------|-------|
| I. Feature-Based Architecture | ❌ N/A | — | Standalone CLI script in `scripts/` |
| II. Server-First Rendering | ❌ N/A | — | Not a web application |
| III. Type Safety Everywhere | ✅ Yes | ✅ Pass | TypeScript with proper interfaces |
| IV. React Query for Server State | ❌ N/A | — | No React/web involved |
| V. URL State for Shareability | ❌ N/A | — | CLI tool |
| VI. Accessibility as Foundation | ❌ N/A | — | CLI tool (terminal output) |
| VII. Clean Code Standards | ✅ Yes | ✅ Pass | ESLint + Prettier compatible |

**Gate Status**: ✅ PASSED — No constitution violations

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-commit-optimization/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (testing guide)
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (repository root)

```text
scripts/
└── ai-commit.ts         # Main script to be optimized (1,064 lines)
```

**Structure Decision**: Single file optimization. No new files required — all changes are modifications to `scripts/ai-commit.ts`. The script already has clear section markers and well-organized code structure.

## Complexity Tracking

> No complexity violations — single file modification with no new abstractions required.

## Architecture Overview

### Current Flow (to be preserved)

```
main() → checkConfiguration() → getLoadedModel() → getStagedChanges()
       → getUserDescription() → generateCommitMessage() → handleUserChoice()
       → executeCommit() or recurse for regenerate/edit
```

### New Components (to be added)

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW: Pre-Processing Layer                     │
├─────────────────────────────────────────────────────────────────┤
│  analyzeDiff()           - Statistical analysis of changes       │
│  classifyChanges()       - Detect type/scope before prompting   │
│  summarizeDiff()         - Compress when >10,000 chars          │
│  detectSensitiveData()   - Scan for API keys, passwords, etc.   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MODIFIED: Prompt Builder                      │
├─────────────────────────────────────────────────────────────────┤
│  buildCondensedPrompt()  - 40% smaller system prompt            │
│  buildStructuredInput()  - Classification + summary for LLM     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NEW: Intelligent Retry                        │
├─────────────────────────────────────────────────────────────────┤
│  buildRefinementPrompt() - Targeted fixes from validation       │
│  ValidationResult        - Enhanced with suggested corrections  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Implementation Areas

### 1. Diff Analysis & Summarization (FR-001 through FR-005)

**Location**: New functions before `buildPrompt()`

```typescript
interface DiffSummary {
  files: FileSummary[];
  totalAdditions: number;
  totalDeletions: number;
  primaryCategory: 'feature' | 'fix' | 'refactor' | 'chore' | 'docs' | 'style';
  compressedDiff: string;  // Used when raw diff > 10,000 chars
}

interface FileSummary {
  path: string;
  changeType: 'add' | 'modify' | 'delete';
  additions: number;
  deletions: number;
  category: FileCategory;
  isBinary: boolean;
  keyChanges: string[];  // Top 3-5 significant changes
}
```

**Heuristics for semantic importance (FR-002):**
1. Source files (.ts, .tsx, .js, .jsx, .py, etc.) > Config files
2. Logic changes (function/class mods) > Formatting changes
3. New code > Removed code > Modified code
4. Feature files (`src/features/`) > Utility files (`src/lib/`)
5. Generated files (prisma, lockfiles) = lowest priority

### 2. Change Classification (FR-006 through FR-008)

**Location**: New `classifyChanges()` function

```typescript
interface ChangeClassification {
  type: 'feat' | 'fix' | 'refactor' | 'chore' | 'docs' | 'style' | 'test' | 'perf';
  scope: string;
  confidence: 'high' | 'medium' | 'low';
  secondaryScopes: string[];
  reasoning: string;  // For debugging
}
```

**Classification heuristics:**
- `feat`: New files added, new exports, new functions with public signatures
- `fix`: Changes to existing logic, error handling modifications
- `refactor`: Renames, restructuring without behavior change
- `chore`: Config files, dependencies, scripts, build tools
- `docs`: .md files, JSDoc comments, README changes
- `style`: Formatting only (detected via whitespace-only changes)
- `test`: Test files (.test.ts, .spec.ts, __tests__/)
- `perf`: Performance-related keywords in diff (cache, optimize, memoize)

### 3. Condensed Prompt (FR-009 through FR-011)

**Target**: 40% reduction in system prompt tokens (~800 tokens instead of ~2,000)

**Strategy:**
- Remove verbose examples (keep 1 good, 1 bad)
- Convert bullet lists to concise format
- Remove redundant "CRITICAL" markers
- Use JSON schema for output structure instead of prose
- Move contextual hints to user message only (not duplicated)

### 4. Intelligent Retry (FR-012 through FR-014)

**Enhanced ValidationResult:**

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedCorrections: CorrectionHint[];  // NEW
}

interface CorrectionHint {
  issue: 'subject_too_long' | 'missing_bullets' | 'wrong_format' | 'wrong_type';
  suggestion: string;
  priority: 'must_fix' | 'should_fix';
}
```

**Refinement prompt (for retry):**
Instead of regenerating from scratch, include specific correction guidance:
- "Previous subject was 67 chars. Shorten to under 50 while preserving meaning."
- "Missing bullet points. Add 2-3 bullets explaining the key changes."
- "Format invalid. Ensure format: type(scope): subject"

### 5. Security: Sensitive Data Detection (FR-017, FR-018)

**Patterns to detect:**

```typescript
const SENSITIVE_PATTERNS = [
  /(?:api[_-]?key|apikey)\s*[:=]\s*['"][^'"]+['"]/gi,
  /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/gi,
  /(?:secret|token)\s*[:=]\s*['"][^'"]+['"]/gi,
  /-----BEGIN (?:RSA |DSA |EC )?PRIVATE KEY-----/,
  /(?:aws|azure|gcp)[_-]?(?:access|secret)[_-]?key/gi,
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/,
];
```

**User flow when detected:**
```
⚠️  Potential sensitive data detected in diff:
   - Line 45: Possible API key pattern
   - Line 102: Possible password assignment

This diff will be sent to: [API_URL]

Continue anyway? (y/N): _
```
