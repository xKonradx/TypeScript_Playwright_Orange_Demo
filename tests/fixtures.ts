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
};

type TestFixtures = PageFixtures & UserFixtures;

export const TEST_USERS = {
  VALID: { username: 'Admin', password: 'admin123' },
  INVALID: { username: 'InvalidUser', password: 'admin123' }
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
  }
});

export { expect } from '@playwright/test';