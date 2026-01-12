# Feature Specification: AI Commit Generator Optimization

**Feature Branch**: `001-ai-commit-optimization`  
**Created**: 2026-01-12  
**Status**: Draft  
**Input**: User description: "Improve AI commit generator prompt efficiency (token usage) and enhance the algorithm/mechanism for better commit message generation"

## Clarifications

### Session 2026-01-12

- Q: What diff summarization approach should be used? → A: Statistical + heuristic analysis (line counts, change types, file categories) — no additional LLM calls, deterministic, fast
- Q: What is the acceptable quality degradation when optimizing for tokens? → A: Maintain current quality for typical commits; accept degradation only for edge cases (>100 files)
- Q: How should the system handle detected sensitive data in diffs? → A: Warn user and require explicit confirmation to proceed
- Q: At what diff size should summarization/compression activate? → A: 10,000 characters (~2,500 tokens) — balanced approach preserving context while avoiding overflow
- Q: How should binary files be represented in the summarized diff? → A: Include as metadata only (filename, size change, add/modify/delete) — provides context without wasting tokens

---

## Analysis Summary

This specification addresses improvements to the existing `scripts/ai-commit.ts` tool which generates conventional commit messages from staged git changes. The current implementation has significant opportunities for optimization in both token efficiency and generation quality.

### Current State Analysis

**Token Efficiency Issues Identified:**
- `MAX_DIFF_LENGTH = 100,000` characters (~25,000+ tokens for large diffs)
- System prompt contains ~2,000 tokens with verbose, redundant examples
- User prompt repeats instructions and includes full uncompressed diff
- No diff summarization or prioritization strategy

**Algorithm/Mechanism Issues Identified:**
- Linear single-pass generation with no intelligent retry
- Basic scope detection using simple string matching on file paths
- Naive temperature adjustment (+0.1 on regenerate)
- No pre-analysis or change classification before prompting
- All files treated equally regardless of importance
- Post-generation validation only, no guided correction

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reduced Token Usage for Large Changesets (Priority: P1)

As a developer working on large changesets, I want the commit generator to use fewer tokens while maintaining quality, so that generation is faster, cheaper (for paid APIs), and stays within model context limits.

**Why this priority**: Token efficiency directly impacts cost (for cloud APIs), speed, and whether the tool works at all for large diffs that exceed context windows.

**Independent Test**: Can be tested by comparing token counts and generation quality between current and optimized versions using a set of benchmark diffs of varying sizes.

**Acceptance Scenarios**:

1. **Given** a staged diff of 50,000 characters, **When** generating a commit message, **Then** the total prompt tokens should be at least 50% fewer than the current implementation while maintaining the same output quality.
2. **Given** a staged diff exceeding the model's context window, **When** generating a commit message, **Then** the system should intelligently compress/summarize the diff to fit within limits rather than truncating arbitrarily.
3. **Given** multiple staged files, **When** one file has significantly more changes than others, **Then** the system should prioritize showing the most meaningful changes, not just the first N characters.

---

### User Story 2 - Improved Commit Message Quality (Priority: P2)

As a developer, I want the generated commit messages to more accurately reflect the nature and intent of my changes, with better scope detection and change classification.

**Why this priority**: Better quality output means fewer regeneration attempts, less manual editing, and more useful git history.

**Independent Test**: Can be tested by generating commits for a diverse set of changes (features, fixes, refactors, docs) and measuring accuracy of type/scope detection and bullet point relevance.

**Acceptance Scenarios**:

1. **Given** changes that add new functionality, **When** generating a commit message, **Then** the system should correctly identify it as a `feat` type with appropriate scope at least 90% of the time.
2. **Given** changes across multiple features/domains, **When** generating a commit message, **Then** the system should identify the primary scope and mention secondary impacts in bullet points.
3. **Given** mixed changes (e.g., feature + dependency update), **When** generating a commit message, **Then** the system should group related changes logically in the output.

---

### User Story 3 - Intelligent Retry and Refinement (Priority: P3)

As a developer who receives an imperfect commit message, I want the regeneration process to be smarter about addressing specific issues rather than starting from scratch.

**Why this priority**: Reduces wasted tokens and time on regeneration by making targeted improvements based on validation feedback.

**Independent Test**: Can be tested by intentionally generating messages with specific validation failures and measuring whether retry correctly addresses those issues.

**Acceptance Scenarios**:

1. **Given** a generated commit with a subject line over 50 characters, **When** user requests regeneration, **Then** the system should specifically instruct the model to shorten the subject while preserving meaning.
2. **Given** a generated commit missing bullet points, **When** user requests regeneration, **Then** the system should specifically request detailed bullet points be added.
3. **Given** validation errors from a previous attempt, **When** regenerating, **Then** the system should include specific correction guidance based on the exact failures.

---

### User Story 4 - Condensed Prompt Engineering (Priority: P4)

As a maintainer of this tool, I want the prompt to be maintainable, well-structured, and use modern prompt engineering techniques for consistency and quality.

**Why this priority**: Better prompt structure improves maintainability, debugging, and allows for easier iteration on quality improvements.

**Independent Test**: Can be tested by reviewing prompt token count reduction and output format consistency across multiple generation runs.

**Acceptance Scenarios**:

1. **Given** the optimized system prompt, **When** compared to the current prompt, **Then** it should be at least 40% shorter in tokens while achieving equivalent or better output quality.
2. **Given** multiple generation runs with the same diff, **When** comparing outputs, **Then** the format should be consistent (proper conventional commit structure) at least 95% of the time.

---

### Edge Cases

- What happens when the diff contains only whitespace/formatting changes?
- How does the system handle binary file changes that can't be meaningfully diffed? → **Decision**: Include as metadata only (filename, size change, add/modify/delete) without binary content
- What happens when all staged files are in the excluded list?
- How does the system handle very small diffs (1-2 line changes)?
- What happens when the diff contains sensitive data (passwords, keys)? → **Decision**: Warn user with detected patterns and require explicit "y" confirmation before sending to LLM
- How does the system handle merge commits with complex histories? → **Decision**: Out of scope for initial optimization. Current behavior preserved (process like any other diff). May revisit in future iteration if needed.

---

## Requirements *(mandatory)*

### Functional Requirements

**Diff Processing & Compression:**
- **FR-001**: System MUST summarize large diffs using statistical + heuristic analysis: line counts per file, change types (add/modify/delete), and file category classification — without additional LLM calls
- **FR-002**: System MUST prioritize changes by semantic importance using heuristics: logic changes (function/class modifications) over formatting, new code over boilerplate, source files over generated/config files
- **FR-003**: System MUST activate diff summarization when raw diff exceeds 10,000 characters (~2,500 tokens); handle larger diffs by intelligent compression rather than truncation
- **FR-004**: System MUST detect and de-prioritize auto-generated or lock files even if not in the explicit exclusion list
- **FR-005**: System MUST represent binary files as metadata only (filename, size change, change type) without including binary content in the prompt

**Change Classification:**
- **FR-006**: System MUST pre-analyze changes to classify the primary change type (feat/fix/refactor/chore/docs) before prompting
- **FR-007**: System MUST detect the primary scope from file paths with improved heuristics beyond simple string matching
- **FR-008**: System MUST identify when changes span multiple scopes and determine the dominant one

**Prompt Optimization:**
- **FR-009**: System MUST use a condensed prompt format that reduces token usage by at least 40%
- **FR-010**: System MUST use structured output guidance to improve format consistency
- **FR-011**: System MUST separate "analysis" instructions from "output format" instructions for clarity

**Intelligent Retry:**
- **FR-012**: System MUST track specific validation failures and include targeted correction guidance on retry
- **FR-013**: System MUST use validation feedback to construct focused refinement prompts rather than regenerating from scratch
- **FR-014**: System MUST limit retry attempts and provide clear guidance when multiple retries fail

**Quality & Validation:**
- **FR-015**: System MUST validate output format before presenting to user (conventional commit structure)
- **FR-016**: System MUST warn users about potential issues (very short diff, binary files, sensitive content patterns)

**Security:**
- **FR-017**: System MUST scan diffs for sensitive data patterns (API keys, passwords, tokens, private keys) before sending to LLM
- **FR-018**: When sensitive data is detected, system MUST display a warning and require explicit user confirmation ("y") to proceed

### Key Entities

- **DiffSummary**: Represents a compressed view of changes - file path, change type (add/modify/delete), key changes, lines affected, semantic category
- **ChangeClassification**: Pre-analysis result - detected type, detected scope, confidence level, secondary scopes
- **ValidationResult**: Post-generation check - format validity, specific errors, specific warnings, suggested corrections
- **GenerationContext**: State across retries - previous output, validation failures, user feedback, retry count

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Average token usage for prompts reduced by at least 50% compared to current implementation for the same changesets
- **SC-002**: Commit messages correctly identify change type (feat/fix/chore/refactor/docs) at least 90% of the time on a benchmark test set
- **SC-003**: Generation time for large diffs (>10,000 lines) reduced by at least 30% due to smaller prompts
- **SC-004**: First-attempt acceptance rate (user chooses "y" without regeneration) increases by at least 20%
- **SC-005**: Average regeneration attempts needed per successful commit reduced by at least 40%
- **SC-006**: System handles diffs up to 500 files without context limit failures

---

## Constraints & Tradeoffs

- **Quality vs Tokens**: For typical commits (<100 files), maintain current quality levels. Token optimization MUST NOT degrade accuracy for normal use cases. For edge cases (>100 files), graceful degradation is acceptable with user warning.
- **Speed vs Completeness**: Prefer faster generation over exhaustive analysis when tradeoffs exist.

---

## Assumptions

- The underlying LLM API (LM Studio, OpenAI-compatible) remains available and functional
- Users have git properly configured with staged changes available
- The conventional commits format remains the target output format
- Token costs and context limits remain relevant concerns for users
- Users prefer faster generation over slightly higher quality when trade-offs exist
