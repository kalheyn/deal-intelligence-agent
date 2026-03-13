# Deal Intelligence Agent — CLAUDE.md
 
## Purpose
This tool analyzes a CRM pipeline export (CSV) and produces deal health
assessments, MEDPIC-based risk flags, recommended next steps, and a
formatted forecast summary for sales leadership. Output should read like
it was written by an experienced sales manager — not a generic AI tool.
 
## Sales Methodology: MEDPIC
Evaluate every deal against these six dimensions. A missing or weak factor
is a risk signal. Flag which specific factor is the problem, not just that
the deal is at risk.
 
M — Metrics
Has the prospect quantified the value of solving their problem?
A real Metrics answer is a number: '$400k in annual processing costs'
or '200 hours/month of manual work.' Vague language like 'we want to
be more efficient' means Metrics is NOT established.
 
E — Economic Buyer
Has the person with budget authority (CFO, VP, Director) been in a
meeting or directly engaged? The day-to-day contact is NOT the Economic
Buyer unless explicitly confirmed. If EB has never appeared, flag it.
 
D — Decision Criteria
Does the AE know what matters most to the prospect when evaluating
solutions? Price, implementation speed, integrations, vendor reputation?
Generic or missing criteria = risk.
 
P — Decision Process
Does the AE know the exact steps, stakeholders, and timeline to get a
decision? Does legal get involved? Does procurement review above a
certain dollar amount? A close date without a mapped decision process
is a guess, not a forecast.
 
I — Identified Pain
Is there a specific, felt problem that has a cost and that multiple
stakeholders agree needs to be addressed? Vague or generic pain means
the deal lacks internal urgency and will lose to 'do nothing.'
 
C — Competition
Does the AE know who else is being evaluated — including named
competitors, build vs. buy, and the option to do nothing? 'Do nothing'
is often the most dangerous competitor. Flag if competition is unknown.
 
## Champion vs. Contact — Critical Distinction
A champion is NOT the same as an enthusiastic contact. A real champion
is someone who is actively selling internally on the AE's behalf.
 
Signs of a real champion:
- Shares internal information without being asked (org charts, budget
  cycles, internal politics, competing priorities)
- Initiates contact when something changes on their end
- Has introduced the AE to other stakeholders proactively
- Has asked for materials to share internally (slides, ROI models)
 
Signs the 'champion' is just a contact:
- Only responds to AE outreach, never initiates
- Cannot or will not facilitate an Economic Buyer introduction
- Expresses enthusiasm but never shares internal constraints
- Goes quiet when asked about next steps
 
Note: Champion quality is qualitative and usually cannot be fully
assessed from CRM data alone. Flag this limitation in output when
the data is ambiguous.
 
## Stage Definitions and Health Thresholds
Flag a deal as WATCH if it exceeds the time threshold below.
Flag as AT RISK if it exceeds the threshold AND has a missing next step
or no recent contact-level activity.
 
Discovery:       Max 14 days. Primary risk: no next meeting booked.
                 Suggests prospect is not engaged or AE lacks urgency.
 
Proposal Sent:   Max 10 days. Primary risk: no response after 7 days.
                 Suggests champion is not championing internally.
 
Negotiation:     Max 21 days. Primary risk: champion goes quiet.
                 Suggests internal resistance or competing priorities.
 
Verbal Commit:   Max 7 days. Primary risk: no contract sent.
                 Suggests process/legal issues or soft verbal commit.
 
[Update these stages after Sean interview — his org may use different
stage names or different time thresholds based on deal size/industry.]
 
## Activity-Level Red Flag Thresholds
These apply regardless of stage:
 
- Last activity > 14 days ago: WATCH
- Last activity > 21 days ago: AT RISK
- Next step field is empty: AT RISK (always, regardless of stage)
- Next step says only 'follow up' or 'check in': WATCH
  (vague next steps are a proxy for disengagement)
- Close date has moved more than once: WATCH — note the pattern
- Close date has moved more than twice: AT RISK
- No contact-level activity (only account-level): WATCH
  (AE may be working with the wrong person)
 
## Context-Dependent Rules — Apply With Judgment
Do NOT apply thresholds mechanically. These factors require nuance:
 
Deal size: A $500k deal stalling for 30 days is different from a $10k
deal. Large deals have longer natural cycles and more stakeholders.
Apply proportionally more patience for high-value deals.

Deal size must also shape the urgency and tone of AT RISK responses:

- Small deals (under ~$25k): A deal that is AT RISK with no activity
  for 3+ weeks and no next step is a strong candidate to be cut or
  moved to inactive. The recommended_next_step should reflect this —
  one last re-engagement attempt with a hard deadline, framed as a
  final check-in before the deal is removed from the forecast.
  forecast_note should say so plainly: "At this deal size and level
  of disengagement, recommend cutting or moving to inactive unless
  the AE can re-engage within [X] days."

- Mid-size deals ($25k–$150k): AT RISK signals warrant active
  intervention. recommended_next_step should name a specific person,
  action, and date, and should escalate if the AE's contact has gone
  quiet (e.g., try a different stakeholder, loop in a manager).
  forecast_note should flag slippage risk and suggest a downgrade if
  re-engagement doesn't happen within a defined window.

- Large deals ($150k+): AT RISK signals are serious but do not
  automatically mean the deal is dying. recommended_next_step should
  prescribe aggressive re-engagement: executive outreach, in-person
  meeting, or involving the AE's own leadership. forecast_note
  should note the deal's strategic value and resist calling it dead
  without evidence. "A deal of this size warrants AE leadership
  attention before removing from forecast."

Use deal_value from the CRM data to calibrate. If deal size is not
provided, note the limitation and treat the deal as mid-size by
default.
 
Industry: Healthcare, government, and financial services have longer
procurement cycles by default. A deal that looks stuck may simply be
in a slow-moving org. Note this in output rather than just flagging.
 
Deal type: Expansion deals (existing customers) move faster and have
a lower bar for Economic Buyer access than new business. Do not
penalize expansion deals for missing E in MEDPIC as heavily.
 
## Next Step Quality Standards
A next step must have ALL THREE of these to be considered strong:
1. A named person on the PROSPECT's side who has committed to an action
2. A specific action (not 'follow up' or 'check in')
3. A specific date
 
Strong: 'Sarah will send security questionnaire by Wednesday'
Strong: 'Contract review with legal scheduled for Thursday at 2pm'
Strong: 'John (VP Finance) will review ROI model and respond by Friday'
 
Weak: 'I will follow up next week' (AE-owned, vague, no date)
Weak: 'Check in after the holidays' (no owner, no action, no date)
Weak: 'Send a proposal' (no prospect commitment)
 
## Forecast Categories and Probability Ranges
Commit:    75-90% — AE is confident, deal closes this quarter.
Best Case: 40-74% — Could close, but something could go wrong.
Pipeline:  10-39% — In play but not close. Not in near-term forecast.
 
## How to Calculate Forecasted Revenue Contribution
Forecasted contribution = Deal Size x Close Probability
Sum across all deals = Pipeline Forecast for the period.
 
Note: Metrics (M in MEDPIC) is the value the PROSPECT gains — their
business case. Deal Size is what they pay. These are separate figures.
 
## Output Format — Per Deal
For each deal, produce exactly this structure:
 
DEAL: [Deal Name] | [Account Name]
STAGE: [Current Stage] | Days in stage: [X]
VALUE: $[Deal Value] | Close date: [Date] | Forecast: [Category]
HEALTH: HEALTHY / WATCH / AT RISK
 
MEDPIC STATUS:
  M (Metrics): [Established / Not established / Partial]
  E (Economic Buyer): [Engaged / Not engaged / Unknown]
  D (Decision Criteria): [Known / Unknown]
  P (Decision Process): [Mapped / Unclear]
  I (Identified Pain): [Sharp / Vague / Unknown]
  C (Competition): [Known / Unknown / Do-nothing risk]
 
RISK FACTORS: [List top 1-3 specific risks. If none, say 'None identified.']
 
RECOMMENDED NEXT STEP: [Specific, jointly-owned, time-bound action.
Name a person on the prospect's side. Give a date.]
 
FORECAST NOTE: [One sentence for leadership. Use plain language.]
FORECASTED CONTRIBUTION: $[Deal Value x Probability]
 
## Output Format — Pipeline Summary (end of report)
AT RISK deals: [list with owner and value]
WATCH deals: [list with owner and value]
HEALTHY deals: [list with owner and value]
Total pipeline value: $[sum]
Weighted forecast (sum of contributions): $[sum]
 
## Language to Use
Use these phrases — they sound native to sales practitioners:
- 'Champion is actively engaged' / 'No evidence of internal champion'
- 'Economic Buyer has been in the room' / 'Economic Buyer not engaged'
- 'Decision process is mapped' / 'Close date is a guess — no mapped process'
- 'Pain is quantified' / 'Pain is articulated but not quantified'
- 'Deal is in commit' / 'Deal should be moved to best case'
- 'Next step is jointly owned' / 'Next step is AE-owned only'
- 'Slippage risk is high' / 'On track to close this quarter'
 
## Language to Avoid
Never use these — they make output sound generic:
- 'Follow up' without specifying with whom, about what, by when
- 'Check in' as a next step
- 'Looks good' without specific evidence
- 'The deal is progressing' without data to support it
- 'Needs attention' without naming the specific MEDPIC factor
 
## Known Limitations — State These in Output When Relevant
- Champion quality is qualitative. CRM data can hint at it but cannot
  confirm it. Flag uncertainty rather than assuming.
- Competition data is often incomplete in CRM exports. Note if unknown.
- Context matters: large deals, slow industries, and expansion deals
  deserve more nuanced treatment than mechanical threshold application.
