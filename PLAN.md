# Plan: pipeline.js — Deal Intelligence Analyzer

## Context

Reads `sample-pipeline.csv`, sends each deal to Claude for analysis using the evaluation criteria in `CLAUDE.md`, and writes structured results to `pipeline-output.json`.

**Key finding:** `@anthropic-ai/claude-code` (the only installed package) is the Claude Code CLI — it is NOT a programmable API client. Making API calls requires `@anthropic-ai/sdk`. Both `csv-parse` and `@anthropic-ai/sdk` need to be installed.

**Module system:** `package.json` currently has `"type": "commonjs"`. Switch to `"type": "module"` for ESM `import` syntax, consistent with modern Anthropic SDK usage.

---

## Steps

### 1. Install dependencies
```bash
npm install @anthropic-ai/sdk csv-parse
```

### 2. Update package.json
- Set `"type": "module"`
- Add `"start": "node pipeline.js"` script

### 3. Create `pipeline.js`

**Logic flow:**
1. Read and parse `sample-pipeline.csv` via `csv-parse/sync` → array of deal objects
2. Build a system prompt embedding the health rules from `CLAUDE.md`:
   - Stage max-day thresholds (Discovery ≤14, Proposal Sent ≤10, Negotiation ≤21, Verbal Commit ≤7)
   - Activity red flags (>14 days = WATCH, >21 days = AT RISK)
   - Next step quality rules (empty = AT RISK, vague = WATCH, strong = all three criteria)
   - Today's date for computing days-since-activity
3. For each deal, call `anthropic.messages.create()` with:
   - `model: "claude-opus-4-6"`
   - Deal fields as structured text
   - Instruction to return **only** a JSON object (no markdown) with: `deal_name`, `health_status` (HEALTHY/WATCH/AT RISK), `risk_factors` (string[]), `recommended_next_step` (string), `forecast_note` (string)
4. Parse JSON response; on error, log and store an error record
5. Console.log progress per deal (e.g. `[1/8] Analyzing: Acme Logistics...`) and result status
6. Write results array to `pipeline-output.json` with pretty formatting
7. Generate `pipeline-report.html` from results via `generateHtmlReport()`
8. Log final summary: total, healthy, watch, at-risk counts

**Files to create/modify:**
- `pipeline.js` (new)
- `package.json` (update type + add start script)

---

## Verification
1. `npm install` completes without errors
2. Set `ANTHROPIC_API_KEY`, then run `node pipeline.js`
3. Console shows per-deal progress
4. `pipeline-output.json` created with 8 objects, each with correct shape
5. AT RISK deals (Vantage Manufacturing, Nexgen Retail) and WATCH deals (Brightfield Capital, Strata Real Estate, Pinnacle Software) receive appropriate health_status values
6. `pipeline-report.html` is generated and opens correctly in a browser with: summary stat boxes, deal cards grouped AT RISK → WATCH → HEALTHY, color-coded badges, and no external dependencies
