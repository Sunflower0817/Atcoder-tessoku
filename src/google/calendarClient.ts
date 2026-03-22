import { google } from 'googleapis';
import { appConfig } from '../config.js';
import type { CalendarEvent } from '../types.js';

export class GoogleCalendarClient {
  private readonly calendar = google.calendar({ version: 'v3', auth: new google.auth.OAuth2() });

  constructor() {
    const auth = new google.auth.OAuth2(
      appConfig.google.clientId,
      appConfig.google.clientSecret,
      appConfig.google.redirectUri
    );
    auth.setCredentials({ refresh_token: appConfig.google.refreshToken });
    (this.calendar as any)._options.auth = auth;
  }

  async listEventsForDate(date: string): Promise<CalendarEvent[]> {
    const timeMin = new Date(`${date}T00:00:00+09:00`).toISOString();
    const timeMax = new Date(`${date}T23:59:59+09:00`).toISOString();
    const response = await this.calendar.events.list({
      calendarId: appConfig.google.calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return (response.data.items ?? []).map((item: any) => ({
      id: item.id ?? `${date}-${item.summary ?? 'event'}`,
      summary: item.summary ?? '(no title)',
      description: item.description ?? undefined,
      location: item.location ?? undefined,
      start: item.start?.dateTime ?? item.start?.date ?? date,
      end: item.end?.dateTime ?? item.end?.date ?? undefined,
      allDay: Boolean(item.start?.date && !item.start?.dateTime)
    }));
  }
}
