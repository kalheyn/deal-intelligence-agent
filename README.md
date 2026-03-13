# Deal Intelligence Agent

A Node.js agent that reads a CRM pipeline export, evaluates each deal against the MEDPIC sales methodology, and produces health assessments, risk flags, and recommended next steps — formatted for sales leadership review.

## What it does

- Reads `sample-pipeline.csv` (your CRM export)
- Sends each deal to Claude claude-opus-4-6 for structured analysis
- Flags deals as **HEALTHY**, **WATCH**, or **AT RISK** based on stage age, activity recency, and next step quality
- Writes results to `pipeline-output.json` and `pipeline-report.html`

## Setup

**Prerequisites:** Node.js 18+, an Anthropic API key

```bash
npm install
```

Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=your_key_here
```

## Usage

```bash
npm start
```

The agent reads `sample-pipeline.csv`, analyzes each deal, and writes:

- `pipeline-output.json` — structured results for each deal
- `pipeline-report.html` — visual report grouped by health status (open in any browser)

## CSV format

Your pipeline export must include these columns:

| Column | Description |
|---|---|
| `deal_name` | Deal identifier |
| `account_name` | Company name |
| `deal_value` | Dollar value of the deal |
| `stage` | Current pipeline stage |
| `days_in_stage` | Days the deal has been in the current stage |
| `last_activity_date` | Date of most recent CRM activity (YYYY-MM-DD) |
| `next_step` | Next step logged in CRM |
| `forecast_category` | Commit / Best Case / Pipeline |
| `owner` | AE name |
| `close_date` | Expected close date (YYYY-MM-DD) |

See `sample-pipeline.csv` for an example with 8 deals.

## Health status rules

**AT RISK** — any of:
- Next step field is empty
- Last activity more than 21 days ago
- Stage age significantly exceeds the maximum threshold

**WATCH** — any of:
- Next step is vague ("follow up", "check in")
- Last activity 14–21 days ago
- Stage age moderately exceeds the maximum threshold

**HEALTHY** — no red flags

Stage thresholds: Discovery 14 days, Proposal Sent 10 days, Negotiation 21 days, Verbal Commit 7 days.

## Output shape

Each deal in `pipeline-output.json`:

```json
{
  "deal_name": "Acme Logistics - Workflow Automation",
  "health_status": "HEALTHY",
  "risk_factors": [],
  "recommended_next_step": "...",
  "forecast_note": "..."
}
```

## Hooks

Two validation hooks run automatically:

- `hooks/protect-env.js` — prevents `.env` from being committed
- `hooks/validate-output.js` — checks `pipeline-output.json` structure after each run

## Methodology

Deal evaluation follows **MEDPIC**: Metrics, Economic Buyer, Decision Criteria, Decision Process, Identified Pain, Competition. Full methodology and scoring guidance is in [CLAUDE.md](CLAUDE.md).
