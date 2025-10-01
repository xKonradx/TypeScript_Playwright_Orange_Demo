import { test as base, Page } from "@playwright/test";
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
import { BasePage } from "../pages/BasePage";

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

function createPageFixture<T extends BasePage>(PageClass: new (page: Page) => T) {
  return async ({ page }: { page: Page }, use: (fixture: T) => Promise<void>) => {
    const pageInstance = new PageClass(page);
    await use(pageInstance);
  };
}

export const test = base.extend<TestFixtures>({
  loginPage: createPageFixture(LoginPage),
  dashboardPage: createPageFixture(DashboardPage),
  forgotPasswordPage: createPageFixture(ForgotPasswordPage),
  adminPage: createPageFixture(AdminPage),
  pimPage: createPageFixture(PimPage),
  leavePage: createPageFixture(LeavePage),
  timePage: createPageFixture(TimePage),
  myInfoPage: createPageFixture(MyInfoPage),
  recruitmentPage: createPageFixture(RecruitmentPage),
  performancePage: createPageFixture(PerformancePage),
  directoryPage: createPageFixture(DirectoryPage),
  maintenancePage: createPageFixture(MaintenancePage),
  claimPage: createPageFixture(ClaimPage),
  buzzPage: createPageFixture(BuzzPage),

  users: async ({}, use) => {
    await use(TEST_USERS);
  }
});

export { expect } from "@playwright/test";
