import { test, expect } from "./fixtures";

test.describe(
  "Navigation Functionality",
  {
    tag: ["@navigation", "@critical"]
  },
  () => {
    test.beforeEach(async ({ loginPage, dashboardPage, users }) => {
      const user = users.VALID;
      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await expect(dashboardPage.dashboardHeading).toBeVisible();
    });

    test(
      "TC_NAV_001: Admin module navigation",
      {
        tag: ["@smoke"]
      },
      async ({ loginPage, dashboardPage, adminPage }) => {
        await dashboardPage.clickMenu("Admin");
        await expect(loginPage.page).toHaveURL(/admin/, { timeout: 10000 });
        await expect(adminPage.pageHeading).toBeVisible();
      }
    );

    test(
      "TC_NAV_002: PIM module navigation",
      {
        tag: ["@smoke"]
      },
      async ({ loginPage, dashboardPage, pimPage }) => {
        await dashboardPage.clickMenu("PIM");
        await expect(loginPage.page).toHaveURL(/pim/, { timeout: 10000 });
        await expect(pimPage.employeeListTab).toBeVisible();
      }
    );

    test(
      "TC_NAV_003: Leave module navigation",
      {
        tag: ["@medium"]
      },
      async ({ loginPage, dashboardPage, leavePage }) => {
        await dashboardPage.clickMenu("Leave");
        await expect(loginPage.page).toHaveURL(/leave/, { timeout: 10000 });
        await expect(leavePage.pageHeading).toBeVisible();
      }
    );

    test(
      "TC_NAV_004: Time module navigation",
      {
        tag: ["@medium"]
      },
      async ({ loginPage, dashboardPage, timePage }) => {
        await dashboardPage.clickMenu("Time");
        await expect(loginPage.page).toHaveURL(/time/, { timeout: 10000 });
        await expect(timePage.pageHeading).toBeVisible();
      }
    );

    test(
      "TC_NAV_005: Recruitment module navigation",
      {
        tag: ["@medium"]
      },
      async ({ loginPage, dashboardPage, recruitmentPage }) => {
        await dashboardPage.clickMenu("Recruitment");
        await expect(loginPage.page).toHaveURL(/recruitment/, { timeout: 10000 });
        await expect(recruitmentPage.pageHeading).toBeVisible();
      }
    );

    test(
      "TC_NAV_006: My Info module navigation",
      {
        tag: ["@medium"]
      },
      async ({ loginPage, dashboardPage, myInfoPage }) => {
        await dashboardPage.clickMenu("My Info");
        await expect(loginPage.page).toHaveURL(/pim/, { timeout: 10000 });
        await expect(myInfoPage.personalDetailsHeading).toBeVisible();
      }
    );

    test(
      "TC_NAV_007: Performance module navigation",
      {
        tag: ["@medium"]
      },
      async ({ loginPage, dashboardPage, performancePage }) => {
        await dashboardPage.clickMenu("Performance");
        await expect(loginPage.page).toHaveURL(/performance/, { timeout: 10000 });
        await expect(performancePage.pageHeading).toBeVisible();
      }
    );

    test(
      "TC_NAV_008: Dashboard navigation",
      {
        tag: ["@medium"]
      },
      async ({ loginPage, dashboardPage }) => {
        await dashboardPage.clickMenu("PIM");
        await expect(loginPage.page).toHaveURL(/pim/, { timeout: 10000 });

        await dashboardPage.page.getByText("Dashboard").click();
        await expect(loginPage.page).toHaveURL(/dashboard/, { timeout: 10000 });
        await expect(dashboardPage.dashboardHeading).toBeVisible();
      }
    );

    test(
      "TC_NAV_009: Directory module navigation",
      {
        tag: ["@low"]
      },
      async ({ loginPage, dashboardPage, directoryPage }) => {
        await dashboardPage.clickMenu("Directory");
        await expect(loginPage.page).toHaveURL(/directory/, { timeout: 10000 });
        await expect(directoryPage.pageHeading).toBeVisible();
      }
    );

    test(
      "TC_NAV_010: Maintenance module navigation",
      {
        tag: ["@low"]
      },
      async ({ loginPage, dashboardPage, maintenancePage }) => {
        await dashboardPage.clickMenu("Maintenance");
        await expect(loginPage.page).toHaveURL(/maintenance/, { timeout: 10000 });
        await expect(maintenancePage.pageHeading).toBeVisible();
      }
    );

    test(
      "TC_NAV_011: Claim module navigation",
      {
        tag: ["@low"]
      },
      async ({ loginPage, dashboardPage, claimPage }) => {
        await dashboardPage.clickMenu("Claim");
        await expect(loginPage.page).toHaveURL(/claim/, { timeout: 10000 });
        await expect(claimPage.pageHeading).toBeVisible();
      }
    );

    test(
      "TC_NAV_012: Buzz module navigation",
      {
        tag: ["@low"]
      },
      async ({ loginPage, dashboardPage, buzzPage }) => {
        await dashboardPage.clickMenu("Buzz");
        await expect(loginPage.page).toHaveURL(/buzz/, { timeout: 10000 });
        await expect(buzzPage.pageHeading).toBeVisible();
      }
    );
  }
);
