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
  validUser: { username: string; password: string };
  invalidUser: { username: string; password: string };
  invalidPasswordUser: { username: string; password: string };
  emptyUsernameUser: { username: string; password: string };
  emptyPasswordUser: { username: string; password: string };
  emptyBothUser: { username: string; password: string };
  sqlInjectionUser: { username: string; password: string };
  xssAttackUser: { username: string; password: string };
};

type TestFixtures = PageFixtures & UserFixtures & { users: UserFixtures };

export const TEST_USERS = {
  validUser: { username: "Admin", password: "admin123" },
  invalidUser: { username: "InvalidUserUser", password: "admin123" },
  invalidPasswordUser: { username: "Admin", password: "wrongpassword" },
  emptyUsernameUser: { username: "", password: "admin123" },
  emptyPasswordUser: { username: "Admin", password: "" },
  emptyBothUser: { username: "", password: "" },
  sqlInjectionUser: {
    username: "admin'-- ",
    password: "' UNION SELECT 1,user(),version()-- "
  },
  xssAttackUser: {
    username: '"><img src=x onerror=alert("XSS")>',
    password: "admin123"
  }
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
