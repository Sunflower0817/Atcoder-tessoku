export const mdmealSelectors = {
  login: {
    username: 'input[name="username"]',
    password: 'input[name="password"]',
    submit: 'button[type="submit"]'
  },
  navigation: {
    orderLink: 'a[href*="order"]',
    listLink: 'a[href*="list"]'
  },
  orderList: {
    table: 'table',
    rowByDate: (date: string) => `tr[data-date="${date}"]`,
    dateCell: '[data-column="date"]',
    breakfastStatus: '[data-column="breakfast-status"]',
    dinnerStatus: '[data-column="dinner-status"]',
    breakfastActionEat: '[data-action="breakfast-eat"]',
    breakfastActionSkip: '[data-action="breakfast-skip"]',
    dinnerActionEat: '[data-action="dinner-eat"]',
    dinnerActionSkip: '[data-action="dinner-skip"]',
    holidayFlag: '[data-flag="holiday"]',
    deadlineFlag: '[data-flag="deadline"]',
    closedFlag: '[data-flag="closed"]'
  },
  confirm: {
    confirmButton: 'button[data-role="confirm"]',
    commitButton: 'button[data-role="commit"]'
  }
} as const;

// TODO: Replace selectors with real M-D meal DOM once production markup is confirmed.
