import type { Locator } from 'playwright';
import type { MdMealRow, MealAction } from '../types.js';
import { mdmealSelectors } from './selectors.js';

function normalizeStatus(text: string): MealAction {
  const normalized = text.trim().toLowerCase();
  if (/(eat|有|喫食|申込)/.test(normalized)) return 'eat';
  if (/(skip|無|不要|停止|キャンセル)/.test(normalized)) return 'skip';
  return 'unchanged';
}

export async function parseOrderRow(row: Locator, date: string): Promise<MdMealRow> {
  const breakfastText = await row.locator(mdmealSelectors.orderList.breakfastStatus).textContent() ?? '';
  const dinnerText = await row.locator(mdmealSelectors.orderList.dinnerStatus).textContent() ?? '';
  const holiday = await row.locator(mdmealSelectors.orderList.holidayFlag).count() > 0;
  const deadlinePassed = await row.locator(mdmealSelectors.orderList.deadlineFlag).count() > 0;
  const closed = await row.locator(mdmealSelectors.orderList.closedFlag).count() > 0;

  return {
    date,
    breakfastStatus: normalizeStatus(breakfastText),
    dinnerStatus: normalizeStatus(dinnerText),
    breakfastEditable: !holiday && !deadlinePassed && !closed,
    dinnerEditable: !holiday && !deadlinePassed && !closed,
    holiday,
    deadlinePassed,
    notes: [holiday ? 'holiday' : '', deadlinePassed ? 'deadline passed' : '', closed ? 'closed' : ''].filter(Boolean)
  };
}
