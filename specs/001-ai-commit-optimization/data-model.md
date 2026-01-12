# Data Model: AI Commit Generator Optimization

**Feature**: 001-ai-commit-optimization  
**Date**: 2026-01-12

## Overview

This document defines the TypeScript interfaces and data structures for the optimized AI commit generator. All entities are runtime-only (no persistence).

---

## Core Entities

### DiffSummary

Represents a compressed view of all staged changes.

```typescript
interface DiffSummary {
  /** Individual file summaries */
  files: FileSummary[];
  
  /** Total lines added across all files */
  totalAdditions: number;
  
  /** Total lines deleted across all files */
  totalDeletions: number;
  
  /** Total files changed */
  totalFiles: number;
  
  /** Whether compression was applied (raw diff > 10,000 chars) */
  wasCompressed: boolean;
  
  /** Original diff length in characters */
  originalLength: number;
  
  /** Compressed diff length (if compressed) */
  compressedLength: number;
  
  /** Token estimate for the compressed content */
  estimatedTokens: number;
}
```

### FileSummary

Per-file change analysis.

```typescript
interface FileSummary {
  /** File path relative to repo root */
  path: string;
  
  /** Type of change */
  changeType: 'add' | 'modify' | 'delete' | 'rename';
  
  /** Lines added in this file */
  additions: number;
  
  /** Lines deleted in this file */
  deletions: number;
  
  /** File category for prioritization */
  category: FileCategory;
  
  /** Whether this is a binary file */
  isBinary: boolean;
  
  /** Semantic importance score (0-100) */
  importanceScore: number;
  
  /** Key changes extracted from diff (top 3-5) */
  keyChanges: string[];
  
  /** For renames: the old path */
  oldPath?: string;
}

type FileCategory = 
  | 'source'      // .ts, .tsx, .js, .jsx, .py, etc.
  | 'test'        // .test.ts, .spec.ts, __tests__/
  | 'config'      // .json, .yaml, .rc files
  | 'generated'   // lock files, prisma client, etc.
  | 'docs'        // .md, README
  | 'asset'       // images, fonts, static files
  | 'other';      // uncategorized
```

### ChangeClassification

Pre-analysis result for commit type/scope detection.

```typescript
interface ChangeClassification {
  /** Detected commit type */
  type: CommitType;
  
  /** Primary scope (e.g., 'auth', 'ui', 'api') */
  scope: string;
  
  /** How confident we are in this classification */
  confidence: 'high' | 'medium' | 'low';
  
  /** Secondary scopes if changes span multiple areas */
  secondaryScopes: string[];
  
  /** Human-readable reasoning for debugging */
  reasoning: string;
  
  /** Raw scores for each type (for debugging) */
  typeScores: Record<CommitType, number>;
}

type CommitType = 
  | 'feat'     // New feature
  | 'fix'      // Bug fix
  | 'docs'     // Documentation
  | 'style'    // Formatting
  | 'refactor' // Code restructure
  | 'perf'     // Performance
  | 'test'     // Tests
  | 'chore';   // Maintenance
```

### ValidationResult

Enhanced validation with correction hints.

```typescript
interface ValidationResult {
  /** Whether the commit message passes all required checks */
  isValid: boolean;
  
  /** Critical errors that must be fixed */
  errors: string[];
  
  /** Non-critical warnings */
  warnings: string[];
  
  /** Specific correction hints for retry */
  corrections: CorrectionHint[];
}

interface CorrectionHint {
  /** Type of issue detected */
  issue: ValidationIssue;
  
  /** Human-readable description */
  description: string;
  
  /** Specific fix instruction for LLM */
  suggestion: string;
  
  /** Whether this must be fixed */
  priority: 'must_fix' | 'should_fix';
}

type ValidationIssue =
  | 'subject_too_long'
  | 'subject_wrong_case'
  | 'subject_has_period'
  | 'missing_bullets'
  | 'bullet_too_long'
  | 'invalid_type'
  | 'invalid_scope'
  | 'invalid_format'
  | 'copied_example';
```

### GenerationContext

State maintained across generation attempts.

```typescript
interface GenerationContext {
  /** User's optional description of changes */
  userDescription: string;
  
  /** Whether this is a regeneration attempt */
  isRegenerate: boolean;
  
  /** Whether user provided specific feedback (edit mode) */
  isEditMode: boolean;
  
  /** Previous generated output (for refinement) */
  previousOutput: string | null;
  
  /** Validation result from previous attempt */
  previousValidation: ValidationResult | null;
  
  /** Number of generation attempts so far */
  attemptCount: number;
  
  /** Maximum allowed attempts before forcing manual edit */
  maxAttempts: number;
}
```

### SensitiveDataMatch

Result of sensitive data scanning.

```typescript
interface SensitiveDataMatch {
  /** Type of sensitive data detected */
  type: SensitiveDataType;
  
  /** Line number in the diff where found */
  line: number;
  
  /** File path where found */
  file: string;
  
  /** Masked preview of the match (first/last 4 chars) */
  preview: string;
}

type SensitiveDataType =
  | 'api_key'
  | 'password'
  | 'secret'
  | 'token'
  | 'private_key'
  | 'github_pat'
  | 'openai_key'
  | 'aws_key';
```

### StagedChanges (Modified)

Enhanced version of existing interface.

```typescript
interface StagedChanges {
  /** List of staged file paths */
  files: string[];
  
  /** Newline-separated file list */
  fileList: string;
  
  /** Full raw diff output */
  diff: string;
  
  /** Processed diff (summarized if > threshold) */
  processedDiff: string;
  
  /** Diff summary with analysis */
  summary: DiffSummary;
  
  /** Pre-computed classification */
  classification: ChangeClassification;
  
  /** Any sensitive data detected */
  sensitiveMatches: SensitiveDataMatch[];
}
```

---

## Configuration Constants (Updated)

```typescript
/** Threshold for activating diff compression (characters) */
const COMPRESSION_THRESHOLD = 10_000;

/** Maximum files before showing degradation warning */
const MAX_FILES_FULL_QUALITY = 100;

/** Maximum retry attempts before forcing manual edit */
const MAX_RETRY_ATTEMPTS = 3;

/** Temperature progression for retries */
const RETRY_TEMPERATURES = [0.2, 0.3, 0.4];

/** File extensions considered "source code" */
const SOURCE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.rs', '.java', '.kt',
  '.c', '.cpp', '.h', '.hpp', '.cs', '.swift'
];

/** Patterns for auto-generated files (always lowest priority) */
const GENERATED_PATTERNS = [
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
  /\.prisma\/client/,
  /generated\//,
  /\.min\.(js|css)$/,
  /dist\//,
  /build\//,
];
```

---

## State Transitions

### Generation Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       ↓
┌──────────────────┐
│ getStagedChanges │ → Check for sensitive data
└────────┬─────────┘
         ↓
    [sensitive?]──yes──→ WARN + CONFIRM
         │no                    │
         ↓                      ↓
┌────────────────────┐    ┌─────────┐
│ analyzeDiff        │←───│ proceed │
│ classifyChanges    │    └─────────┘
│ summarizeDiff      │
└────────┬───────────┘
         ↓
┌────────────────────┐
│ buildPrompt        │
│ (condensed)        │
└────────┬───────────┘
         ↓
┌────────────────────┐
│ streamText (LLM)   │
└────────┬───────────┘
         ↓
┌────────────────────┐
│ validateCommit     │
└────────┬───────────┘
         ↓
    [valid?]──no──→ [attempts < max?]──yes──→ buildRefinementPrompt → RETRY
         │yes              │no
         ↓                 ↓
┌────────────────┐   ┌────────────────────┐
│ presentToUser  │   │ presentWithWarning │
└────────┬───────┘   │ (suggest manual)   │
         ↓           └────────────────────┘
    [choice?]
    ├── y → COMMIT
    ├── n → CANCEL
    ├── r → REGENERATE (attemptCount++)
    └── e → EDIT MODE (with feedback)
```

---

## Validation Rules

### Commit Message Format

| Field | Rule | Validation |
|-------|------|------------|
| Type | Must be valid CommitType | Regex: `^(feat\|fix\|docs\|style\|refactor\|perf\|test\|chore)` |
| Scope | Lowercase alphanumeric + hyphen | Regex: `[a-z][a-z0-9-]*` |
| Subject | Max 50 chars, lowercase start, no period | Length check + regex |
| Body | At least 1 bullet, each max 72 chars | Count + length checks |
| Format | `type(scope): subject\n\n- bullet` | Full regex validation |

### Quality Checks

1. **No copied examples**: Detect common example phrases from prompt
2. **Meaningful bullets**: Reject generic phrases ("update file", "change code")
3. **Scope matches files**: Warn if scope doesn't match file paths
4. **Type matches changes**: Warn if type seems incorrect based on classification
