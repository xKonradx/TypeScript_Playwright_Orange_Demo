import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
};

type UserFixtures = {
  users: typeof TEST_USERS;
};

type TestFixtures = PageFixtures & UserFixtures;

export const TEST_USERS = {
  VALID: { username: "Admin", password: "admin123" },
  INVALID: { username: "InvalidUser", password: "admin123" },
  INVALID_PASSWORD: { username: "Admin", password: "wrongpassword" },
  EMPTY_USERNAME: { username: "", password: "admin123" },
  EMPTY_PASSWORD: { username: "Admin", password: "" },
  EMPTY_BOTH: { username: "", password: "" },
  SQL_INJECTION: {
    username: "admin'-- ",
    password: "' UNION SELECT 1,user(),version()-- "
  },
  XSS_ATTACK: { username: '"><img src=x onerror=alert("XSS")>', password: "admin123" }
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

  users: async ({}, use) => {
    await use(TEST_USERS);
  }
});

export { expect } from "@playwright/test";
