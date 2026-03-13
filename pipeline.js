import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';

function generateHtmlReport(results) {
  const order = ['AT RISK', 'WATCH', 'HEALTHY', 'ERROR'];
  const grouped = order.reduce((acc, status) => {
    acc[status] = results.filter(r => r.health_status === status);
    return acc;
  }, {});

  const counts = {
    total: results.length,
    atRisk: grouped['AT RISK'].length,
    watch: grouped['WATCH'].length,
    healthy: grouped['HEALTHY'].length,
    error: grouped['ERROR'].length,
  };

  const badge = (status) => {
    const styles = {
      'AT RISK': 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;',
      'WATCH':   'background:#fef9c3;color:#854d0e;border:1px solid #fde047;',
      'HEALTHY': 'background:#dcfce7;color:#166534;border:1px solid #86efac;',
      'ERROR':   'background:#f3f4f6;color:#374151;border:1px solid #d1d5db;',
    };
    return `<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;letter-spacing:0.04em;${styles[status] || styles['ERROR']}">${status}</span>`;
  };

  const cardBorderColor = { 'AT RISK': '#fca5a5', 'WATCH': '#fde047', 'HEALTHY': '#86efac', 'ERROR': '#d1d5db' };

  const renderCard = (deal) => {
    const riskList = deal.risk_factors && deal.risk_factors.length > 0
      ? `<ul style="margin:6px 0 0 0;padding-left:18px;">${deal.risk_factors.map(r => `<li style="margin-bottom:4px;">${r}</li>`).join('')}</ul>`
      : '<p style="margin:6px 0 0 0;color:#6b7280;">None identified.</p>';

    const nextStep = deal.recommended_next_step
      ? `<p style="margin:0;">${deal.recommended_next_step}</p>`
      : '<p style="margin:0;color:#6b7280;">—</p>';

    const forecastNote = deal.forecast_note
      ? `<p style="margin:0;">${deal.forecast_note}</p>`
      : '<p style="margin:0;color:#6b7280;">—</p>';

    const border = cardBorderColor[deal.health_status] || '#d1d5db';

    return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-left:4px solid ${border};border-radius:8px;padding:20px 24px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <h3 style="margin:0;font-size:16px;font-weight:600;color:#111827;">${deal.deal_name}</h3>
        ${badge(deal.health_status)}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div>
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;">Risk Factors</p>
          ${riskList}
        </div>
        <div>
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;">Recommended Next Step</p>
          ${nextStep}
        </div>
      </div>
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid #f3f4f6;">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;">Forecast Note</p>
        ${forecastNote}
      </div>
    </div>`;
  };

  const renderSection = (status, label) => {
    const deals = grouped[status];
    if (deals.length === 0) return '';
    return `
  <section style="margin-bottom:36px;">
    <h2 style="margin:0 0 14px 0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#374151;">${label} <span style="font-weight:400;color:#9ca3af;">(${deals.length})</span></h2>
    ${deals.map(renderCard).join('')}
  </section>`;
  };

  const statBox = (label, value, color) =>
    `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px 24px;min-width:120px;text-align:center;">
      <p style="margin:0 0 4px 0;font-size:28px;font-weight:700;color:${color};">${value}</p>
      <p style="margin:0;font-size:12px;color:#6b7280;font-weight:500;">${label}</p>
    </div>`;

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pipeline Health Report — ${today}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1f2937; background: #f9fafb; }
    li { color: #374151; }
  </style>
</head>
<body>
  <div style="max-width:860px;margin:0 auto;padding:40px 24px;">

    <header style="margin-bottom:36px;">
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Deal Intelligence Report</p>
      <h1 style="margin:0 0 4px 0;font-size:26px;font-weight:700;color:#111827;">Pipeline Health Summary</h1>
      <p style="margin:0;color:#6b7280;">Generated ${today}</p>
    </header>

    <section style="margin-bottom:40px;">
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        ${statBox('Total Deals', counts.total, '#111827')}
        ${statBox('At Risk', counts.atRisk, '#dc2626')}
        ${statBox('Watch', counts.watch, '#d97706')}
        ${statBox('Healthy', counts.healthy, '#16a34a')}
        ${counts.error > 0 ? statBox('Errors', counts.error, '#6b7280') : ''}
      </div>
    </section>

    ${renderSection('AT RISK', 'At Risk')}
    ${renderSection('WATCH', 'Watch')}
    ${renderSection('HEALTHY', 'Healthy')}
    ${counts.error > 0 ? renderSection('ERROR', 'Errors') : ''}

  </div>
</body>
</html>`;
}

const TODAY = new Date().toISOString().split('T')[0];

const SYSTEM_PROMPT = `You are a sales pipeline analyst. Evaluate each B2B SaaS deal using the following rules and return ONLY a valid JSON object with no markdown, no explanation, no code fences.

## Stage Max-Day Thresholds (days_in_stage)
- Discovery: max 14 days
- Proposal Sent: max 10 days
- Negotiation: max 21 days
- Verbal Commit: max 7 days
Exceeding the threshold is a risk factor.

## Activity Rules (days since last_activity_date, relative to today: ${TODAY})
- > 21 days since last activity → AT RISK
- > 14 days since last activity → WATCH
- ≤ 14 days → acceptable

## Next Step Quality
- Empty next_step → AT RISK (always)
- Vague next step (contains only phrases like "follow up", "check in", "catch up") → WATCH
- Strong next step requires ALL THREE: a named prospect-side person, a specific action, and a specific date

## Health Status Logic
- AT RISK: any single AT RISK signal (empty next step, activity > 21 days, stage far over threshold)
- WATCH: any WATCH signal without an AT RISK signal (vague next step, activity 14–21 days, stage moderately over threshold)
- HEALTHY: no red flags

## Forecast Category Context
- Commit: 75–90% probability
- Best Case: 40–74% probability
- Pipeline: 10–39% probability

## Required Output Shape
Return exactly this JSON structure:
{
  "deal_name": "<string>",
  "health_status": "HEALTHY" | "WATCH" | "AT RISK",
  "risk_factors": ["<string>", ...],
  "recommended_next_step": "<string>",
  "forecast_note": "<string>"
}

risk_factors should be an array of specific, actionable observations (empty array if HEALTHY).
recommended_next_step should be concrete and specific, not generic.
forecast_note should assess whether the forecast_category is realistic given the deal's health.`;

async function analyzeDeal(client, deal, index, total) {
  const dealText = Object.entries(deal)
    .map(([k, v]) => `${k}: ${v || '(empty)'}`)
    .join('\n');

  console.log(`\n[${index}/${total}] Analyzing: ${deal.deal_name}...`);

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Evaluate this deal:\n\n${dealText}`,
      },
    ],
  });

  const raw = message.content[0].text.trim()
    .replace(/^```(?:json)?\s*\n?/, '')
    .replace(/\n?```\s*$/, '');

  try {
    const result = JSON.parse(raw);
    console.log(`  → ${result.health_status}${result.risk_factors.length > 0 ? ' | Risks: ' + result.risk_factors.join('; ') : ''}`);
    return result;
  } catch {
    console.error(`  → ERROR: Could not parse response for ${deal.deal_name}`);
    console.error(`     Raw response: ${raw}`);
    return {
      deal_name: deal.deal_name,
      health_status: 'ERROR',
      risk_factors: ['Failed to parse Claude response'],
      recommended_next_step: '',
      forecast_note: '',
    };
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set.');
    process.exit(1);
  }

  const client = new Anthropic();

  console.log('Reading sample-pipeline.csv...');
  const csvContent = readFileSync('sample-pipeline.csv', 'utf-8');
  const deals = parse(csvContent, { columns: true, skip_empty_lines: true });
  console.log(`Loaded ${deals.length} deals.\n`);

  const results = [];
  for (let i = 0; i < deals.length; i++) {
    const result = await analyzeDeal(client, deals[i], i + 1, deals.length);
    results.push(result);
  }

  writeFileSync('pipeline-output.json', JSON.stringify(results, null, 2));

  const html = generateHtmlReport(results);
  writeFileSync('pipeline-report.html', html);

  const counts = results.reduce(
    (acc, r) => {
      if (r.health_status === 'HEALTHY') acc.healthy++;
      else if (r.health_status === 'WATCH') acc.watch++;
      else if (r.health_status === 'AT RISK') acc.atRisk++;
      return acc;
    },
    { healthy: 0, watch: 0, atRisk: 0 }
  );

  console.log('\n─────────────────────────────────');
  console.log(`Analysis complete. Results written to pipeline-output.json and pipeline-report.html`);
  console.log(`Total: ${results.length} deals`);
  console.log(`  HEALTHY:  ${counts.healthy}`);
  console.log(`  WATCH:    ${counts.watch}`);
  console.log(`  AT RISK:  ${counts.atRisk}`);
  console.log('─────────────────────────────────');
}

main();
