import { config as loadEnv } from 'dotenv';

loadEnv();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function optionalNumber(name: string, fallback: number): number {
  const value = process.env[name];
  return value ? Number(value) : fallback;
}

export const appConfig = {
  timezone: process.env.TZ ?? 'Asia/Tokyo',
  batchDaysAhead: optionalNumber('BATCH_DAYS_AHEAD', 7),
  plannerMode: process.env.PLANNER_MODE ?? 'agent',
  google: {
    clientId: required('GOOGLE_CLIENT_ID'),
    clientSecret: required('GOOGLE_CLIENT_SECRET'),
    redirectUri: required('GOOGLE_REDIRECT_URI'),
    refreshToken: required('GOOGLE_REFRESH_TOKEN'),
    calendarId: process.env.GOOGLE_CALENDAR_ID ?? 'primary'
  },
  mdmeal: {
    baseUrl: required('MDMEAL_BASE_URL'),
    loginUrl: required('MDMEAL_LOGIN_URL'),
    orderUrl: required('MDMEAL_ORDER_URL'),
    username: required('MDMEAL_USERNAME'),
    password: required('MDMEAL_PASSWORD'),
    storageState: process.env.MDMEAL_STORAGE_STATE ?? 'playwright/.auth/mdmeal.json'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
    baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
    temperature: optionalNumber('OPENAI_TEMPERATURE', 0)
  }
};
