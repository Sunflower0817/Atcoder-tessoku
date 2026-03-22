import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { appConfig } from '../src/config.js';
import { mdmealSelectors } from '../src/mdmeal/selectors.js';

async function main(): Promise<void> {
  await mkdir('playwright/.auth', { recursive: true });
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(appConfig.mdmeal.loginUrl, { waitUntil: 'networkidle' });
  await page.locator(mdmealSelectors.login.username).fill(appConfig.mdmeal.username);
  await page.locator(mdmealSelectors.login.password).fill(appConfig.mdmeal.password);
  await page.locator(mdmealSelectors.login.submit).click();
  await page.waitForLoadState('networkidle');
  await context.storageState({ path: appConfig.mdmeal.storageState });
  await browser.close();

  console.log(`Saved storage state to ${appConfig.mdmeal.storageState}`);
}

main().catch((error) => {
  console.error('[auth] fatal error', error);
  process.exitCode = 1;
});
