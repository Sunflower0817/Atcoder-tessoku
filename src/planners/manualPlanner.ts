import type { DayContext, MealDecision } from '../types.js';
import type { Planner } from './planner.js';

export class ManualPlanner implements Planner {
  constructor(private readonly breakfast: MealDecision['breakfast'], private readonly dinner: MealDecision['dinner']) {}

  async plan(context: DayContext): Promise<MealDecision> {
    return {
      breakfast: context.constraints.operationAllowed ? this.breakfast : 'unchanged',
      dinner: context.constraints.operationAllowed ? this.dinner : 'unchanged',
      reason: ['manual override'],
      confidence: 1
    };
  }
}
