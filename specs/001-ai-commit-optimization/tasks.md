# Tasks: AI Commit Generator Optimization

**Input**: Design documents from `specs/001-ai-commit-optimization/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested — manual testing via quickstart.md scenarios

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- All tasks modify `scripts/ai-commit.ts` (single file optimization)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add new type definitions and configuration constants that all user stories depend on

- [x] T001 Add new interface definitions (DiffSummary, FileSummary, FileCategory) at line ~40 in scripts/ai-commit.ts
- [x] T002 Add ChangeClassification and CommitType interfaces after T001 in scripts/ai-commit.ts
- [x] T003 Add enhanced ValidationResult and CorrectionHint interfaces after T002 in scripts/ai-commit.ts
- [x] T004 Add SensitiveDataMatch interface and SensitiveDataType after T003 in scripts/ai-commit.ts
- [x] T005 Update GenerationContext interface to include attemptCount, maxAttempts, previousValidation in scripts/ai-commit.ts
- [x] T006 Add new configuration constants (COMPRESSION_THRESHOLD, MAX_FILES_FULL_QUALITY, MAX_RETRY_ATTEMPTS, etc.) at line ~75 in scripts/ai-commit.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utility functions that multiple user stories depend on

**⚠️ CRITICAL**: These functions are shared across multiple user stories

- [x] T007 Implement categorizeFile() function to classify files by FileCategory in scripts/ai-commit.ts
- [x] T008 Implement calculateImportanceScore() function for semantic file prioritization in scripts/ai-commit.ts
- [x] T009 Implement parseDiffStats() function to extract additions/deletions per file from git diff output in scripts/ai-commit.ts
- [x] T010 Implement detectBinaryFiles() function to identify binary file changes in scripts/ai-commit.ts
- [x] T011 Implement SENSITIVE_PATTERNS constant array with regex patterns for security scanning in scripts/ai-commit.ts
- [x] T012 Implement detectSensitiveData() function to scan diff for secrets/keys in scripts/ai-commit.ts
- [x] T013 Implement promptForSensitiveConfirmation() function for user warning flow in scripts/ai-commit.ts

**Checkpoint**: Foundation ready — all utility functions available for user story implementation

---

## Phase 3: User Story 1 - Reduced Token Usage (Priority: P1) 🎯 MVP

**Goal**: Reduce token usage by 50% through intelligent diff summarization and compression

**Independent Test**: Compare token counts between current and optimized versions using benchmark diffs (see quickstart.md Scenario 2)

### Implementation for User Story 1

- [x] T014 [US1] Implement analyzeDiff() function that returns DiffSummary with file statistics in scripts/ai-commit.ts
- [x] T015 [US1] Implement extractKeyChanges() function to identify top 3-5 significant changes per file in scripts/ai-commit.ts
- [x] T016 [US1] Implement summarizeDiff() function that compresses diff when >10,000 chars in scripts/ai-commit.ts
- [x] T017 [US1] Implement formatCompressedDiff() function to create token-efficient diff representation in scripts/ai-commit.ts
- [x] T018 [US1] Implement formatBinaryFileMetadata() function for binary file representation in scripts/ai-commit.ts
- [x] T019 [US1] Update getStagedChanges() to call analyzeDiff() and summarizeDiff() in scripts/ai-commit.ts
- [x] T020 [US1] Update StagedChanges interface to include summary, processedDiff fields in scripts/ai-commit.ts
- [x] T021 [US1] Add compression stats logging (original size, compressed size, token estimate) in scripts/ai-commit.ts

**Checkpoint**: User Story 1 complete — diff compression working, test with large changeset

---

## Phase 4: User Story 2 - Improved Quality (Priority: P2)

**Goal**: Better commit type/scope detection through pre-analysis classification

**Independent Test**: Generate commits for diverse changes (feat/fix/refactor/docs) and verify 90% accuracy (see quickstart.md Scenario 3)

### Implementation for User Story 2

- [x] T022 [US2] Implement detectCommitType() function with scoring heuristics for each type in scripts/ai-commit.ts
- [x] T023 [US2] Implement detectPrimaryScope() function with enhanced path analysis in scripts/ai-commit.ts
- [x] T024 [US2] Implement detectSecondaryScopes() function for multi-scope changes in scripts/ai-commit.ts
- [x] T025 [US2] Implement classifyChanges() function that returns ChangeClassification in scripts/ai-commit.ts
- [x] T026 [US2] Update getStagedChanges() to call classifyChanges() and store result in scripts/ai-commit.ts
- [x] T027 [US2] Update buildPrompt() to include classification hints in user message in scripts/ai-commit.ts
- [x] T028 [US2] Add classification confidence display in console output in scripts/ai-commit.ts

**Checkpoint**: User Story 2 complete — classification working, test with mixed changesets

---

## Phase 5: User Story 3 - Intelligent Retry (Priority: P3)

**Goal**: Targeted regeneration with validation-guided correction hints

**Independent Test**: Intentionally generate failing messages and verify retry addresses specific issues (see quickstart.md Scenario 5)

### Implementation for User Story 3

- [x] T029 [US3] Implement generateCorrectionHints() function from validation errors in scripts/ai-commit.ts
- [x] T030 [US3] Update validateCommitMessage() to return CorrectionHint[] in ValidationResult in scripts/ai-commit.ts
- [x] T031 [US3] Implement buildRefinementPrompt() function for targeted retry guidance in scripts/ai-commit.ts
- [x] T032 [US3] Update GenerationContext handling in main() to track attemptCount in scripts/ai-commit.ts
- [x] T033 [US3] Implement getRetryTemperature() function with progressive temperature array in scripts/ai-commit.ts
- [x] T034 [US3] Update generateCommitMessage() to use refinement prompt on retry in scripts/ai-commit.ts
- [x] T035 [US3] Implement maxRetriesReached() warning with manual edit suggestion in scripts/ai-commit.ts
- [x] T036 [US3] Update handleUserChoice() to pass validation result to context on regenerate in scripts/ai-commit.ts

**Checkpoint**: User Story 3 complete — intelligent retry working, test with validation failures

---

## Phase 6: User Story 4 - Condensed Prompt (Priority: P4)

**Goal**: 40% smaller system prompt while maintaining quality

**Independent Test**: Compare token counts and output consistency (see quickstart.md Scenario 1 baseline)

### Implementation for User Story 4

- [x] T037 [US4] Create CONDENSED_SYSTEM_PROMPT constant with optimized prompt text in scripts/ai-commit.ts
- [x] T038 [US4] Implement buildCondensedPrompt() function replacing buildPrompt() in scripts/ai-commit.ts
- [x] T039 [US4] Implement buildStructuredUserMessage() with classification + summary integration in scripts/ai-commit.ts
- [x] T040 [US4] Remove duplicate context hints from system prompt (move to user message only) in scripts/ai-commit.ts
- [x] T041 [US4] Reduce examples from 6 to 2 (1 good, 1 bad) in system prompt in scripts/ai-commit.ts
- [x] T042 [US4] Update generateCommitMessage() to use buildCondensedPrompt() in scripts/ai-commit.ts
- [x] T043 [US4] Add prompt token count estimation and logging in scripts/ai-commit.ts

**Checkpoint**: User Story 4 complete — prompt optimized, verify 40% token reduction

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Security integration, edge case handling, final cleanup

- [x] T044 Integrate detectSensitiveData() call in getStagedChanges() flow in scripts/ai-commit.ts
- [x] T045 Add sensitive data warning display before generation in scripts/ai-commit.ts
- [x] T046 Handle edge case: all files in exclusion list in scripts/ai-commit.ts
- [x] T047 Handle edge case: very small diffs (1-2 lines) in scripts/ai-commit.ts
- [x] T048 Handle edge case: whitespace-only changes in scripts/ai-commit.ts
- [x] T049 Add degradation warning when >100 files staged in scripts/ai-commit.ts
- [x] T050 Update help text and configuration comments in scripts/ai-commit.ts
- [x] T051 Run ESLint and Prettier on scripts/ai-commit.ts
- [ ] T052 Manual testing: Run all 8 quickstart.md scenarios including timing comparison for SC-003 (measure generation time improvement for large diffs)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
┌───┴───┬───────┬───────┐
↓       ↓       ↓       ↓
US1     US2     US3     US4
(P1)    (P2)    (P3)    (P4)
↓       ↓       ↓       ↓
└───┬───┴───────┴───────┘
    ↓
Phase 7 (Polish)
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 — No dependencies on other stories ✅
- **User Story 2 (P2)**: Depends on Phase 2 — No dependencies on other stories ✅
- **User Story 3 (P3)**: Depends on Phase 2 — No dependencies on other stories ✅
- **User Story 4 (P4)**: Depends on Phase 2 — Can integrate US1/US2 results but independently testable ✅

### Within Each User Story

1. Core function implementations first
2. Integration with existing flow second
3. Logging/display last
4. Each story complete before checkpoint

### Parallel Opportunities

Since all tasks modify the same file (`scripts/ai-commit.ts`), parallelization is limited. However:

- **Phase 1**: T001-T006 can be done in sequence (same file, additive)
- **Phase 2**: T007-T013 can be done in sequence (same file, additive)
- **User Stories**: After Phase 2, stories can be implemented sequentially by priority OR:
  - If multiple developers: Each takes one user story (coordinate on file sections)

---

## Parallel Example: Sequential Single-Developer Flow

```bash
# Recommended execution order (single developer):

# Day 1: Foundation
T001 → T002 → T003 → T004 → T005 → T006  # Setup interfaces
T007 → T008 → T009 → T010 → T011 → T012 → T013  # Foundational functions

# Day 2: MVP (User Story 1)
T014 → T015 → T016 → T017 → T018 → T019 → T020 → T021
# CHECKPOINT: Test diff compression with large changeset

# Day 3: Quality (User Story 2)
T022 → T023 → T024 → T025 → T026 → T027 → T028
# CHECKPOINT: Test classification accuracy

# Day 4: Retry (User Story 3)
T029 → T030 → T031 → T032 → T033 → T034 → T035 → T036
# CHECKPOINT: Test intelligent retry

# Day 5: Prompt Optimization (User Story 4) + Polish
T037 → T038 → T039 → T040 → T041 → T042 → T043
T044 → T045 → T046 → T047 → T048 → T049 → T050 → T051 → T052
# FINAL: Run all quickstart.md scenarios
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T013)
3. Complete Phase 3: User Story 1 (T014-T021)
4. **STOP and VALIDATE**: Test with large diff, verify 50% token reduction
5. Ship MVP if acceptable

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP ships!**
3. Add User Story 2 → Test independently → Quality improvement
4. Add User Story 3 → Test independently → Better UX on retry
5. Add User Story 4 → Test independently → Maximum optimization
6. Polish phase → Production ready

### Success Validation

After each user story, validate against success criteria from spec.md:

| Story | Success Criteria                   | How to Validate                   |
| ----- | ---------------------------------- | --------------------------------- |
| US1   | SC-001: 50% token reduction        | Compare token counts before/after |
| US1   | SC-006: 500 files without overflow | Test with large changeset         |
| US2   | SC-002: 90% type accuracy          | Test with diverse changes         |
| US3   | SC-005: 40% fewer retries          | Track regeneration attempts       |
| US4   | SC-001: Prompt 40% smaller         | Compare prompt token counts       |

---

## Notes

- All tasks modify `scripts/ai-commit.ts` — commit after each logical group
- Use section markers (`// =====`) already in file for organization
- New functions should be added in appropriate sections (Type Definitions, Helper Functions, etc.)
- Run `npm run lint:fix` after each phase
- Test with real staged changes throughout development
- Refer to data-model.md for exact interface definitions
- Refer to research.md for heuristic details and pattern definitions
