import { chromium, type BrowserContext, type Page } from 'playwright';
import { appConfig } from '../config.js';
import type { ApplyResult, ManualRunOptions, MdMealRow, MealAction, MealDecision, MealType, RunOptions } from '../types.js';
import { parseOrderRow } from './parser.js';
import { mdmealSelectors } from './selectors.js';
import { isPastThreeBusinessDayDeadline } from './dateUtils.js';

export class MdMealBot {
  async getRow(date: string): Promise<MdMealRow> {
    return this.withPage(async (page) => {
      await this.ensureLoggedIn(page);
      await this.openOrderList(page);
      const row = page.locator(mdmealSelectors.orderList.rowByDate(date)).first();
      await row.waitFor({ state: 'visible' });
      return parseOrderRow(row, date);
    });
  }

  async runManual(options: ManualRunOptions): Promise<ApplyResult[]> {
    const decision: MealDecision = {
      breakfast: options.meal === 'breakfast' ? options.action : 'unchanged',
      dinner: options.meal === 'dinner' ? options.action : 'unchanged',
      reason: ['manual CLI request'],
      confidence: 1
    };
    return this.applyDecision(options, decision);
  }

  async applyDecision(options: RunOptions, decision: MealDecision): Promise<ApplyResult[]> {
    return this.withPage(async (page) => {
      await this.ensureLoggedIn(page);
      await this.openOrderList(page);
      const row = page.locator(mdmealSelectors.orderList.rowByDate(options.date)).first();
      await row.waitFor({ state: 'visible' });
      const parsedRow = await parseOrderRow(row, options.date);
      const results: ApplyResult[] = [];

      results.push(await this.applyMealAction(page, row, parsedRow, 'breakfast', decision.breakfast, options.dryRun ?? false));
      results.push(await this.applyMealAction(page, row, parsedRow, 'dinner', decision.dinner, options.dryRun ?? false));

      const changed = results.some((result) => result.changed);
      if (changed && !(options.dryRun ?? false)) {
        await page.locator(mdmealSelectors.confirm.confirmButton).click();
        await page.locator(mdmealSelectors.confirm.commitButton).click();
      }
      return results;
    });
  }

  private async applyMealAction(page: Page, row: any, parsedRow: MdMealRow, meal: MealType, action: MealAction, dryRun: boolean): Promise<ApplyResult> {
    const current = meal === 'breakfast' ? parsedRow.breakfastStatus : parsedRow.dinnerStatus;
    const editable = meal === 'breakfast' ? parsedRow.breakfastEditable : parsedRow.dinnerEditable;
    const selector = meal === 'breakfast'
      ? action === 'eat'
        ? mdmealSelectors.orderList.breakfastActionEat
        : mdmealSelectors.orderList.breakfastActionSkip
      : action === 'eat'
        ? mdmealSelectors.orderList.dinnerActionEat
        : mdmealSelectors.orderList.dinnerActionSkip;

    if (action === 'unchanged') {
      return { changed: false, meal, action, message: 'planner requested unchanged' };
    }
    if (parsedRow.deadlinePassed || isPastThreeBusinessDayDeadline(parsedRow.date)) {
      return { changed: false, meal, action: 'unchanged', message: 'deadline passed' };
    }
    if (!editable) {
      return { changed: false, meal, action: 'unchanged', message: 'operation not allowed on screen state' };
    }
    if (current === action) {
      return { changed: false, meal, action, message: 'already desired state' };
    }
    if (dryRun) {
      return { changed: true, meal, action, message: 'dry-run only' };
    }

    await row.locator(selector).click();
    await page.waitForTimeout(300);
    return { changed: true, meal, action, message: 'action applied' };
  }

  private async ensureLoggedIn(page: Page): Promise<void> {
    await page.goto(appConfig.mdmeal.orderUrl, { waitUntil: 'networkidle' });
    if (page.url().includes('login')) {
      await page.goto(appConfig.mdmeal.loginUrl, { waitUntil: 'networkidle' });
      await page.locator(mdmealSelectors.login.username).fill(appConfig.mdmeal.username);
      await page.locator(mdmealSelectors.login.password).fill(appConfig.mdmeal.password);
      await page.locator(mdmealSelectors.login.submit).click();
      await page.context().storageState({ path: appConfig.mdmeal.storageState });
    }
  }

  private async openOrderList(page: Page): Promise<void> {
    await page.goto(appConfig.mdmeal.orderUrl, { waitUntil: 'networkidle' });
    // TODO: if M-D meal requires explicit step navigation, wire it here using selectors.ts.
  }

  private async withPage<T>(handler: (page: Page, context: BrowserContext) => Promise<T>): Promise<T> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: appConfig.mdmeal.storageState });
    const page = await context.newPage();
    try {
      return await handler(page, context);
    } finally {
      await context.close();
      await browser.close();
    }
  }
}
