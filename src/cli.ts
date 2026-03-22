import { appConfig } from './config.js';
import { GoogleCalendarClient } from './google/calendarClient.js';
import { MdMealBot } from './mdmeal/mdmealBot.js';
import { addDays, getWeekday } from './mdmeal/dateUtils.js';
import { AgentPlanner } from './planners/agentPlanner.js';
import { ManualPlanner } from './planners/manualPlanner.js';
import type { DayContext, ManualRunOptions, MealAction } from './types.js';

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

async function runMealCommand(): Promise<void> {
  const date = getArg('--date');
  const meal = getArg('--meal') as ManualRunOptions['meal'] | undefined;
  const action = getArg('--action') as Exclude<MealAction, 'unchanged'> | undefined;
  if (!date || !meal || !action) throw new Error('Usage: npm run meal -- --date YYYY-MM-DD --meal breakfast|dinner --action eat|skip');
  const bot = new MdMealBot();
  const results = await bot.runManual({ date, meal, action, dryRun: hasFlag('--dry-run') });
  console.log(JSON.stringify(results, null, 2));
}

async function runAutoCommand(): Promise<void> {
  const date = getArg('--date');
  if (!date) throw new Error('Usage: npm run auto -- --date YYYY-MM-DD [--dry-run]');

  const calendarClient = new GoogleCalendarClient();
  const bot = new MdMealBot();
  const row = await bot.getRow(date);
  const context: DayContext = {
    date,
    events: await calendarClient.listEventsForDate(date),
    constraints: {
      date,
      weekday: getWeekday(date),
      deadlinePassed: row.deadlinePassed,
      operationAllowed: row.breakfastEditable || row.dinnerEditable,
      currentBreakfast: row.breakfastStatus,
      currentDinner: row.dinnerStatus
    }
  };

  const planner = appConfig.plannerMode === 'manual'
    ? new ManualPlanner('unchanged', 'unchanged')
    : new AgentPlanner();
  const decision = await planner.plan(context);
  const results = await bot.applyDecision({ date, dryRun: hasFlag('--dry-run') }, decision);
  console.log(JSON.stringify({ context, decision, results }, null, 2));
}

async function runBatchCommand(): Promise<void> {
  for (let offset = 0; offset < appConfig.batchDaysAhead; offset += 1) {
    const date = addDays(new Date().toISOString().slice(0, 10), offset);
    process.argv.push('--date', date);
    await runAutoCommand();
    process.argv.splice(-2, 2);
  }
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command === 'meal') return runMealCommand();
  if (command === 'auto') return runAutoCommand();
  if (command === 'batch') return runBatchCommand();
  throw new Error('Available commands: meal | auto | batch');
}

main().catch((error) => {
  console.error('[cli] fatal error', error);
  process.exitCode = 1;
});
