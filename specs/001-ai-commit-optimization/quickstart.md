# Quickstart: Testing AI Commit Generator Optimization

**Feature**: 001-ai-commit-optimization  
**Date**: 2026-01-12

## Prerequisites

- Node.js 18+ installed
- LM Studio running locally OR external API configured in `.env`
- Git repository with some staged changes

## Environment Setup

```bash
# Ensure dependencies are installed
npm install

# Configure API (optional - defaults to LM Studio localhost)
# In .env file:
AI_COMMIT_API_URL=http://localhost:1234/v1
AI_COMMIT_API_KEY=lm-studio
AI_COMMIT_MODEL=your-model-name
```

## Running the Script

```bash
# Stage some changes first
git add <files>

# Run the commit generator
npm run commit
```

## Test Scenarios

### Scenario 1: Small Diff (Baseline)

**Setup**: Stage 1-3 files with <500 lines changed

```bash
# Example: Make a small change
echo "// test" >> src/lib/utils.ts
git add src/lib/utils.ts
npm run commit
```

**Expected behavior**:

- No compression (diff < 10,000 chars)
- Quick generation (<5 seconds)
- Accurate type/scope detection

**Metrics to capture**:

- [ ] Token count (from output)
- [ ] Generation time
- [ ] First-attempt acceptance (y/n/r/e)

---

### Scenario 2: Large Diff (Compression Test)

**Setup**: Stage changes > 10,000 characters

```bash
# Option A: Multiple files
git add src/features/ticket/*.ts

# Option B: Single large file change
# (Make significant modifications to a large file)
```

**Expected behavior**:

- Compression activates automatically
- Summary shown instead of raw diff
- Token count significantly lower than raw diff
- Quality maintained for commit message

**Metrics to capture**:

- [ ] Original diff size (chars)
- [ ] Compressed size
- [ ] Token reduction percentage
- [ ] Quality of generated message

---

### Scenario 3: Multi-Scope Changes

**Setup**: Stage files from multiple features/areas

```bash
git add src/features/auth/actions/sign-in.ts
git add src/features/ticket/components/ticket-item.tsx
git add src/lib/prisma.ts
```

**Expected behavior**:

- Primary scope detected (highest impact area)
- Secondary scopes mentioned in bullets
- Type accurately reflects dominant change

**Verification**:

- [ ] Primary scope makes sense
- [ ] All areas mentioned in commit body
- [ ] No important changes omitted

---

### Scenario 4: Sensitive Data Warning

**Setup**: Stage a file containing something that looks like a secret

```bash
# Create test file (DO NOT COMMIT REAL SECRETS)
echo 'const API_KEY = "sk-test1234567890abcdef1234567890abcdef123456"' > /tmp/test-secret.ts
# Stage it temporarily for testing
```

**Expected behavior**:

- Warning displayed before generation
- Pattern type identified (OpenAI Key, API Key, etc.)
- Requires explicit "y" confirmation to proceed

**Verification**:

- [ ] Warning appears with correct pattern type
- [ ] User can cancel (N) or proceed (y)
- [ ] Proceeding works normally after confirmation

---

### Scenario 5: Regeneration with Validation Failure

**Setup**: Any staged changes

**Process**:

1. Run `npm run commit`
2. If first attempt has validation warnings, press `r` to regenerate
3. Observe refinement behavior

**Expected behavior**:

- Second attempt includes specific correction guidance
- Temperature slightly increased for variation
- Issues from first attempt should be addressed

**Verification**:

- [ ] Refinement prompt visible in debug output (if enabled)
- [ ] Second attempt improves on first
- [ ] Maximum 3 retries before manual edit suggestion

---

### Scenario 6: Edit Mode (User Feedback)

**Setup**: Any staged changes

**Process**:

1. Run `npm run commit`
2. Press `e` to enter edit mode
3. Provide feedback: "Make the subject shorter" or "Add more detail to bullets"

**Expected behavior**:

- Feedback incorporated into refinement prompt
- Previous output preserved where valid
- Only requested changes applied

**Verification**:

- [ ] Feedback accurately applied
- [ ] Unchanged parts preserved
- [ ] Result addresses user's request

---

### Scenario 7: Binary Files

**Setup**: Stage binary file changes

```bash
# Example with an image
cp new-image.png public/image.png
git add public/image.png
```

**Expected behavior**:

- Binary file shown as metadata only
- No binary content in prompt
- Commit message mentions asset change

**Verification**:

- [ ] "Binary: public/image.png (modified)" in output
- [ ] Commit message acknowledges the change
- [ ] No error or garbage in output

---

### Scenario 8: Edge Case - All Excluded Files

**Setup**: Stage only lock files or generated files

```bash
# This should be handled gracefully
git add package-lock.json
```

**Expected behavior**:

- Either: Generate message acknowledging dependency update
- Or: Warn that only excluded files are staged

---

## Metrics Collection Template

Use this template to track optimization results:

```markdown
## Test Run: [DATE]

### Environment

- Model: [model name]
- API: [local/external]

### Results

| Scenario       | Original Tokens | Optimized Tokens | Reduction | Quality (1-5) | First Accept |
| -------------- | --------------- | ---------------- | --------- | ------------- | ------------ |
| Small diff     |                 |                  |           |               |              |
| Large diff     |                 |                  |           |               |              |
| Multi-scope    |                 |                  |           |               |              |
| Sensitive data | N/A             | N/A              | N/A       |               |              |
| Regeneration   |                 |                  |           |               |              |
| Edit mode      |                 |                  |           |               |              |
| Binary files   |                 |                  |           |               |              |

### Notes

-
```

## Success Criteria Validation

After running all scenarios, verify:

- [ ] **SC-001**: Token usage reduced by ≥50% for large diffs
- [ ] **SC-002**: Type detection accuracy ≥90% (track across scenarios)
- [ ] **SC-003**: Generation time reduced by ≥30% for large diffs
- [ ] **SC-004**: First-attempt acceptance rate (target: baseline + 20%)
- [ ] **SC-005**: Regeneration attempts reduced (track average)
- [ ] **SC-006**: 500+ files handled without context overflow

## Troubleshooting

### "Cannot connect to API"

```bash
# Check if LM Studio is running
curl http://localhost:1234/v1/models

# Or check external API config
echo $AI_COMMIT_API_URL
```

### "Context limit exceeded"

- Compression should prevent this
- If still occurring, check `COMPRESSION_THRESHOLD` constant
- May need to reduce threshold for smaller context models

### "Validation always fails"

- Check if model understands conventional commits format
- Try a larger/more capable model
- Review system prompt for clarity
