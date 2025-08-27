import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
};

type UserFixtures = {
  validUser: { username: string; password: string };
  invalidUser: { username: string; password: string };
  invalidPasswordUser: { username: string; password: string };
  emptyUsernameUser: { username: string; password: string };
  emptyPasswordUser: { username: string; password: string };
  emptyBothUser: { username: string; password: string };
  sqlInjectionUser: { username: string; password: string };
  xssAttackUser: { username: string; password: string };
};

type TestFixtures = PageFixtures & UserFixtures;

export const TEST_USERS = {
  VALID: { username: 'Admin', password: 'admin123' },
  INVALID: { username: 'InvalidUser', password: 'admin123' },
  INVALID_PASSWORD: { username: 'Admin', password: 'wrongpassword' },
  EMPTY_USERNAME: { username: '', password: 'admin123' },
  EMPTY_PASSWORD: { username: 'Admin', password: '' },
  EMPTY_BOTH: { username: '', password: '' },
  SQL_INJECTION: { username: "admin'-- ", password: "' UNION SELECT 1,user(),version()-- " },
  XSS_ATTACK: { username: '"><img src=x onerror=alert("XSS")>', password: 'admin123' }
} as const;

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  forgotPasswordPage: async ({ page }, use) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await use(forgotPasswordPage);
  },

  validUser: async ({}, use) => {
    await use(TEST_USERS.VALID);
  },

  invalidUser: async ({}, use) => {
    await use(TEST_USERS.INVALID);
  },

  invalidPasswordUser: async ({}, use) => {
    await use(TEST_USERS.INVALID_PASSWORD);
  },

  emptyUsernameUser: async ({}, use) => {
    await use(TEST_USERS.EMPTY_USERNAME);
  },

  emptyPasswordUser: async ({}, use) => {
    await use(TEST_USERS.EMPTY_PASSWORD);
  },

  emptyBothUser: async ({}, use) => {
    await use(TEST_USERS.EMPTY_BOTH);
  },

  sqlInjectionUser: async ({}, use) => {
    await use(TEST_USERS.SQL_INJECTION);
  },

  xssAttackUser: async ({}, use) => {
    await use(TEST_USERS.XSS_ATTACK);
  }
});

export { expect } from '@playwright/test';