export type MealType = 'breakfast' | 'dinner';
export type MealAction = 'eat' | 'skip' | 'unchanged';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end?: string;
  allDay: boolean;
}

export interface MealDecision {
  breakfast: MealAction;
  dinner: MealAction;
  reason: string[];
  confidence: number;
}

export interface PlannerConstraints {
  date: string;
  weekday: number;
  deadlinePassed: boolean;
  operationAllowed: boolean;
  currentBreakfast?: MealAction;
  currentDinner?: MealAction;
}

export interface DayContext {
  date: string;
  events: CalendarEvent[];
  constraints: PlannerConstraints;
}

export interface MdMealRow {
  date: string;
  breakfastStatus: MealAction;
  dinnerStatus: MealAction;
  breakfastEditable: boolean;
  dinnerEditable: boolean;
  holiday: boolean;
  deadlinePassed: boolean;
  notes: string[];
}

export interface RunOptions {
  date: string;
  dryRun?: boolean;
}

export interface ManualRunOptions extends RunOptions {
  meal: MealType;
  action: Exclude<MealAction, 'unchanged'>;
}

export interface ApplyResult {
  changed: boolean;
  meal: MealType;
  action: MealAction;
  message: string;
}
