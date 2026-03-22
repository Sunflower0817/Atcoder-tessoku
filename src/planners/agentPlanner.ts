import { appConfig } from '../config.js';
import type { DayContext, MealDecision } from '../types.js';
import type { Planner } from './planner.js';

const SYSTEM_PROMPT = `You decide dormitory meals. Return JSON only.
Schema: {"breakfast":"eat|skip|unchanged","dinner":"eat|skip|unchanged","reason":string[],"confidence":number}
Constraints:
- If constraints.deadlinePassed=true OR constraints.operationAllowed=false, both meals must be unchanged.
- Allowed values are breakfast/dinner: eat, skip, unchanged only.
- If uncertain, use unchanged.
Rules:
- Breakfast defaults to skip.
- Saturday/Sunday => breakfast skip and dinner skip.
- Weekday dinner defaults to eat.
- If any event mentions 飲み会, 会食, ディナー, 夕食, 懇親会, 食事 => dinner skip.
- If any event mentions 出張, 帰省, 旅行, 不在 => breakfast skip and dinner skip.
- Ambiguous events should keep default behavior.
- reason must be an array of short strings.
- confidence is between 0 and 1.`;

export class AgentPlanner implements Planner {
  buildPrompt(context: DayContext): string {
    return JSON.stringify(context, null, 2);
  }

  async plan(context: DayContext): Promise<MealDecision> {
    if (context.constraints.deadlinePassed || !context.constraints.operationAllowed) {
      return {
        breakfast: 'unchanged',
        dinner: 'unchanged',
        reason: ['deadline or operation constraint'],
        confidence: 1
      };
    }

    if (!appConfig.openai.apiKey) {
      return this.ruleBasedFallback(context, ['OPENAI_API_KEY missing; fallback applied']);
    }

    const response = await fetch(`${appConfig.openai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${appConfig.openai.apiKey}`
      },
      body: JSON.stringify({
        model: appConfig.openai.model,
        temperature: appConfig.openai.temperature,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: this.buildPrompt(context) }
        ]
      })
    });

    if (!response.ok) {
      return this.ruleBasedFallback(context, [`planner API failed: ${response.status}`]);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return this.ruleBasedFallback(context, ['planner response empty']);
    }

    const parsed = JSON.parse(content) as MealDecision;
    return this.sanitizeDecision(parsed, context);
  }

  private ruleBasedFallback(context: DayContext, extraReasons: string[] = []): MealDecision {
    const text = context.events.map((event) => `${event.summary} ${event.description ?? ''}`).join(' ');
    const weekend = context.constraints.weekday === 0 || context.constraints.weekday === 6;
    const absent = /(出張|帰省|旅行|不在)/.test(text);
    const dinnerSkip = /(飲み会|会食|ディナー|夕食|懇親会|食事)/.test(text);

    let breakfast: MealDecision['breakfast'] = 'skip';
    let dinner: MealDecision['dinner'] = weekend ? 'skip' : 'eat';

    if (weekend) {
      breakfast = 'skip';
      dinner = 'skip';
    }
    if (absent) {
      breakfast = 'skip';
      dinner = 'skip';
    } else if (dinnerSkip) {
      dinner = 'skip';
    }

    return {
      breakfast,
      dinner,
      reason: [...extraReasons, weekend ? 'weekend default' : 'weekday default', absent ? 'absence keyword detected' : dinnerSkip ? 'dinner keyword detected' : 'no override keyword'],
      confidence: extraReasons.length > 0 ? 0.6 : 0.8
    };
  }

  private sanitizeDecision(decision: MealDecision, context: DayContext): MealDecision {
    const allowed = new Set(['eat', 'skip', 'unchanged']);
    const breakfast = allowed.has(decision.breakfast) ? decision.breakfast : 'unchanged';
    const dinner = allowed.has(decision.dinner) ? decision.dinner : 'unchanged';
    if (context.constraints.deadlinePassed || !context.constraints.operationAllowed) {
      return { breakfast: 'unchanged', dinner: 'unchanged', reason: ['constraint override'], confidence: 1 };
    }
    return {
      breakfast,
      dinner,
      reason: Array.isArray(decision.reason) ? decision.reason : ['sanitized agent output'],
      confidence: typeof decision.confidence === 'number' ? Math.min(1, Math.max(0, decision.confidence)) : 0.5
    };
  }
}
