import type { DayContext, MealDecision } from '../types.js';

export interface Planner {
  plan(context: DayContext): Promise<MealDecision>;
}
