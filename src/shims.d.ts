declare const process: {
  argv: string[];
  env: Record<string, string | undefined>;
  exitCode?: number;
};

declare module 'node:fs/promises' {
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
}

declare module 'dotenv' {
  export function config(): void;
}

declare module 'googleapis' {
  export const google: any;
}

declare module 'playwright' {
  export type Locator = any;
  export type Page = any;
  export type BrowserContext = any;
  export const chromium: any;
}
