import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { AdminPage } from "../pages/AdminPage";
import { PimPage } from "../pages/PimPage";
import { LeavePage } from "../pages/LeavePage";
import { TimePage } from "../pages/TimePage";
import { MyInfoPage } from "../pages/MyInfoPage";
import { RecruitmentPage } from "../pages/RecruitmentPage";
import { PerformancePage } from "../pages/PerformancePage";
import { DirectoryPage } from "../pages/DirectoryPage";
import { MaintenancePage } from "../pages/MaintenancePage";
import { ClaimPage } from "../pages/ClaimPage";
import { BuzzPage } from "../pages/BuzzPage";

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
  adminPage: AdminPage;
  pimPage: PimPage;
  leavePage: LeavePage;
  timePage: TimePage;
  myInfoPage: MyInfoPage;
  recruitmentPage: RecruitmentPage;
  performancePage: PerformancePage;
  directoryPage: DirectoryPage;
  maintenancePage: MaintenancePage;
  claimPage: ClaimPage;
  buzzPage: BuzzPage;
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

  adminPage: async ({ page }, use) => {
    const adminPage = new AdminPage(page);
    await use(adminPage);
  },

  pimPage: async ({ page }, use) => {
    const pimPage = new PimPage(page);
    await use(pimPage);
  },

  leavePage: async ({ page }, use) => {
    const leavePage = new LeavePage(page);
    await use(leavePage);
  },

  timePage: async ({ page }, use) => {
    const timePage = new TimePage(page);
    await use(timePage);
  },

  myInfoPage: async ({ page }, use) => {
    const myInfoPage = new MyInfoPage(page);
    await use(myInfoPage);
  },

  recruitmentPage: async ({ page }, use) => {
    const recruitmentPage = new RecruitmentPage(page);
    await use(recruitmentPage);
  },

  performancePage: async ({ page }, use) => {
    const performancePage = new PerformancePage(page);
    await use(performancePage);
  },

  directoryPage: async ({ page }, use) => {
    const directoryPage = new DirectoryPage(page);
    await use(directoryPage);
  },

  maintenancePage: async ({ page }, use) => {
    const maintenancePage = new MaintenancePage(page);
    await use(maintenancePage);
  },

  claimPage: async ({ page }, use) => {
    const claimPage = new ClaimPage(page);
    await use(claimPage);
  },

  buzzPage: async ({ page }, use) => {
    const buzzPage = new BuzzPage(page);
    await use(buzzPage);
  },

  users: async ({}, use) => {
    await use(TEST_USERS);
  }
});

export { expect } from "@playwright/test";
