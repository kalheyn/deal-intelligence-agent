Add a new CRM field named "$ARGUMENTS" end-to-end across pipeline.js, CLAUDE.md, and hooks/validate-output.js.

Follow these steps in order:

---

## Step 1 — Gather information

Read the following files:
- `pipeline.js`
- `CLAUDE.md`
- `hooks/validate-output.js`
- `sample-pipeline.csv`

---

## Step 2 — Ask clarifying questions

Before making any changes, ask the user:

1. **What type of value does this field hold?** (e.g., free text, date, dollar amount, number, boolean, enum)
2. **Is this field required or optional?** (Required = flag missing values in validation; Optional = skip if empty)
3. **Where should it appear in the deal output?** Options:
   - In the deal header line (alongside deal name, stage, value, close date)
   - In the MEDPIC STATUS block
   - In the RISK FACTORS logic (i.e., the field's value should trigger WATCH or AT RISK if it meets some condition)
   - As a standalone labeled line in the output
4. **Should Claude use this field when generating risk flags or next steps?** If yes, describe the rule — e.g., "if this field is empty, flag as WATCH" or "if the value is X, include it in risk factors."
5. **Should the field be added to the CSV sample data?** (yes/no — to keep sample-pipeline.csv consistent)

Wait for the user's answers before proceeding.

---

## Step 3 — Plan the changes

Based on the answers, describe exactly what you will change in each file before writing anything:

- **pipeline.js**: Explain how the new field will be passed to Claude (it is already passed via `Object.entries(deal)`, so no parsing change is needed unless the field needs transformation). If a validation rule applies (e.g., empty = AT RISK), explain how you'll add it to the SYSTEM_PROMPT. If the field should appear in the JSON output shape, explain the addition to the Required Output Shape section of the prompt.
- **CLAUDE.md**: Describe which section the field will be added to and show the exact text that will be inserted.
- **hooks/validate-output.js**: State whether the field will be added to `REQUIRED_FIELDS`. If it's optional, do not add it.
- **sample-pipeline.csv**: If the user said yes, add the column header and a realistic sample value for each existing row.

Show this plan and ask: "Does this look right? I'll make all changes once you confirm."

---

## Step 4 — Make the changes (after confirmation)

Apply all changes consistently across the affected files. Make only the changes described in Step 3 — do not refactor or modify unrelated code.

### pipeline.js
- Add the field to the SYSTEM_PROMPT's `## Required Output Shape` JSON block if it should appear in output.
- Add any new scoring/risk rule to the SYSTEM_PROMPT's existing rule sections (Activity Rules, Next Step Quality, Health Status Logic), using the same format and tone as the existing rules.
- Do not change the CSV parsing logic — `Object.entries(deal)` already passes all columns to Claude automatically.

### CLAUDE.md
- Add the field to the appropriate section of the output format (per the user's answer in Step 2).
- Use the same formatting conventions as surrounding content (indented labels, consistent capitalization).
- Do not alter any other section.

### hooks/validate-output.js
- If the field is required: add its name (as it appears in the JSON output) to the `REQUIRED_FIELDS` array.
- If optional: do not add it. Add a comment near `REQUIRED_FIELDS` noting that the field exists but is optional.

### sample-pipeline.csv
- If the user confirmed: add the new column header to row 1 and fill in a realistic value for each data row. Values should match the field type and be varied enough to be useful for testing.

---

## Step 5 — Confirm and summarize

After writing all changes, show a brief summary:
- Which files were modified
- What was added to each
- Any caveats (e.g., "Claude will now see this field but will only flag it if the value is empty — adjust the SYSTEM_PROMPT rule if you want different behavior")
