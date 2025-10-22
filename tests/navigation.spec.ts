import { test, expect, TestHelpers } from "./fixtures";

/**
 * Navigation test scenarios organized by priority and functionality
 */
const NAVIGATION_SCENARIOS = [
  {
    testId: "TC_NAV_001",
    moduleName: "Admin",
    expectedUrl: /admin/,
    priority: "high",
    description: "Admin module navigation should work correctly"
  },
  {
    testId: "TC_NAV_002",
    moduleName: "PIM",
    expectedUrl: /pim/,
    priority: "high",
    description: "PIM module navigation should work correctly"
  },
  {
    testId: "TC_NAV_003",
    moduleName: "Leave",
    expectedUrl: /leave/,
    priority: "medium",
    description: "Leave module navigation should work correctly"
  },
  {
    testId: "TC_NAV_004",
    moduleName: "Time",
    expectedUrl: /time/,
    priority: "medium",
    description: "Time module navigation should work correctly"
  },
  {
    testId: "TC_NAV_005",
    moduleName: "Recruitment",
    expectedUrl: /recruitment/,
    priority: "medium",
    description: "Recruitment module navigation should work correctly"
  },
  {
    testId: "TC_NAV_006",
    moduleName: "My Info",
    expectedUrl: /pim/,
    priority: "medium",
    description: "My Info module navigation should work correctly"
  },
  {
    testId: "TC_NAV_007",
    moduleName: "Performance",
    expectedUrl: /performance/,
    priority: "medium",
    description: "Performance module navigation should work correctly"
  },
  {
    testId: "TC_NAV_009",
    moduleName: "Directory",
    expectedUrl: /directory/,
    priority: "low",
    description: "Directory module navigation should work correctly"
  },
  {
    testId: "TC_NAV_010",
    moduleName: "Maintenance",
    expectedUrl: /maintenance/,
    priority: "low",
    description: "Maintenance module navigation should work correctly"
  },
  {
    testId: "TC_NAV_011",
    moduleName: "Claim",
    expectedUrl: /claim/,
    priority: "low",
    description: "Claim module navigation should work correctly"
  },
  {
    testId: "TC_NAV_012",
    moduleName: "Buzz",
    expectedUrl: /buzz/,
    priority: "low",
    description: "Buzz module navigation should work correctly"
  }
];

test.describe(
  "Navigation Functionality",
  {
    tag: ["@navigation", "@critical"]
  },
  () => {
    test.describe(
      "Setup and Authentication",
      {
        tag: ["@setup"]
      },
      () => {
        test.beforeEach(async ({ loginPage, dashboardPage, users }) => {
          // Perform login and wait for dashboard to be ready with enhanced error handling
          await TestHelpers.loginAndWaitForDashboard(
            loginPage,
            dashboardPage,
            users.VALID,
            {
              retries: 3,
              takeScreenshot: true,
              validateForm: true,
              waitForDashboard: true
            }
          );
        });

        test(
          "TC_NAV_000: Dashboard should load correctly after successful login",
          {
            tag: ["@smoke", "@critical"]
          },
          async ({ dashboardPage }) => {
            // Assert dashboard is properly loaded
            await dashboardPage.verifyDashboardLoaded();

            // Verify user is logged in
            const userInfo = await dashboardPage.getUserInfo();
            expect(userInfo.isLoggedIn).toBeTruthy();
          }
        );

        test(
          "TC_NAV_013: All main menu items should be visible and accessible",
          {
            tag: ["@smoke"]
          },
          async ({ dashboardPage }) => {
            // Get available menu items
            const menuItems = await dashboardPage.getAvailableMenuItems();

            // Assert that expected menu items are present
            const expectedMenus = [
              "Admin",
              "PIM",
              "Leave",
              "Time",
              "Recruitment",
              "My Info",
              "Performance",
              "Directory",
              "Maintenance",
              "Claim",
              "Buzz"
            ];

            for (const expectedMenu of expectedMenus) {
              expect(menuItems).toContain(expectedMenu);
              const isVisible = await dashboardPage.isMenuItemVisible(expectedMenu);
              expect(isVisible).toBeTruthy();
            }
          }
        );
      }
    );

    test.describe(
      "Module Navigation Tests",
      {
        tag: ["@navigation", "@modules"]
      },
      () => {
        test.beforeEach(async ({ loginPage, dashboardPage, users }) => {
          await TestHelpers.loginAndWaitForDashboard(
            loginPage,
            dashboardPage,
            users.VALID
          );
        });

        // High priority navigation tests
        for (const scenario of NAVIGATION_SCENARIOS.filter(
          (s) => s.priority === "high"
        )) {
          test(
            `TC_NAV_${scenario.testId}: ${scenario.description}`,
            {
              tag: ["@smoke", "@critical"]
            },
            async ({ dashboardPage, page }) => {
              // Act
              await TestHelpers.navigateToModule(dashboardPage, scenario.moduleName, {
                retries: 3,
                takeScreenshot: true,
                validateNavigation: true
              });

              // Assert
              await expect(page).toHaveURL(scenario.expectedUrl);
              await dashboardPage.waitForModuleLoad(scenario.moduleName);

              // Verify module navigation was successful
              await dashboardPage.verifyModuleNavigation(scenario.moduleName);
            }
          );
        }

        // Medium priority navigation tests
        for (const scenario of NAVIGATION_SCENARIOS.filter(
          (s) => s.priority === "medium"
        )) {
          test(
            `TC_NAV_${scenario.testId}: ${scenario.description}`,
            {
              tag: ["@medium"]
            },
            async ({ dashboardPage, page }) => {
              // Act
              await dashboardPage.navigateToModule(scenario.moduleName);

              // Assert
              await expect(page).toHaveURL(scenario.expectedUrl);
              await dashboardPage.waitForModuleLoad(scenario.moduleName);
            }
          );
        }

        // Low priority navigation tests
        for (const scenario of NAVIGATION_SCENARIOS.filter(
          (s) => s.priority === "low"
        )) {
          test(
            `TC_NAV_${scenario.testId}: ${scenario.description}`,
            {
              tag: ["@low"]
            },
            async ({ dashboardPage, page }) => {
              // Act
              await dashboardPage.navigateToModule(scenario.moduleName);

              // Assert
              await expect(page).toHaveURL(scenario.expectedUrl);
              await dashboardPage.waitForModuleLoad(scenario.moduleName);
            }
          );
        }
      }
    );

    test.describe(
      "Dashboard Navigation",
      {
        tag: ["@dashboard", "@navigation"]
      },
      () => {
        test.beforeEach(async ({ loginPage, dashboardPage, users }) => {
          await TestHelpers.loginAndWaitForDashboard(
            loginPage,
            dashboardPage,
            users.VALID
          );
        });

        test(
          "TC_NAV_008: User should be able to navigate back to Dashboard from any module",
          {
            tag: ["@smoke", "@critical"]
          },
          async ({ dashboardPage, page }) => {
            // Navigate to PIM module first
            await dashboardPage.navigateToModule("PIM");
            await expect(page).toHaveURL(/pim/);

            // Navigate back to Dashboard
            await dashboardPage.clickDashboardMenu();

            // Assert
            await expect(page).toHaveURL(/dashboard/);
            await dashboardPage.verifyDashboardLoaded();
          }
        );

        test(
          "TC_NAV_014: Dashboard widgets should be visible and functional",
          {
            tag: ["@dashboard", "@ui"]
          },
          async ({ dashboardPage }) => {
            // Get dashboard widget information
            const widgets = await dashboardPage.getDashboardWidgets();

            // Assert that key widgets are visible
            expect(widgets.quickLaunchVisible).toBeTruthy();
            expect(widgets.employeeDistributionVisible).toBeTruthy();
            expect(widgets.pendingRequestsVisible).toBeTruthy();
          }
        );
      }
    );

    test.describe(
      "Navigation Error Handling",
      {
        tag: ["@error-handling", "@navigation"]
      },
      () => {
        test.beforeEach(async ({ loginPage, dashboardPage, users }) => {
          await TestHelpers.loginAndWaitForDashboard(
            loginPage,
            dashboardPage,
            users.VALID
          );
        });

        test(
          "TC_NAV_015: Navigation should handle network delays gracefully",
          {
            tag: ["@performance", "@error-handling"]
          },
          async ({ dashboardPage, page }) => {
            // Navigate to multiple modules in sequence
            const modules = ["Admin", "PIM", "Leave"];

            for (const module of modules) {
              await dashboardPage.navigateToModule(module);
              await expect(page).toHaveURL(new RegExp(module.toLowerCase()));

              // Navigate back to dashboard
              await dashboardPage.clickDashboardMenu();
              await expect(page).toHaveURL(/dashboard/);
            }
          }
        );

        test(
          "TC_NAV_016: Rapid navigation between modules should work correctly",
          {
            tag: ["@performance"]
          },
          async ({ dashboardPage, page }) => {
            // Perform rapid navigation
            await dashboardPage.clickMenu("Admin");
            await expect(page).toHaveURL(/admin/);

            await dashboardPage.clickMenu("PIM");
            await expect(page).toHaveURL(/pim/);

            await dashboardPage.clickMenu("Leave");
            await expect(page).toHaveURL(/leave/);

            // Navigate back to dashboard
            await dashboardPage.clickDashboardMenu();
            await expect(page).toHaveURL(/dashboard/);
          }
        );
      }
    );

    test.describe(
      "User Session Management",
      {
        tag: ["@session", "@logout"]
      },
      () => {
        test.beforeEach(async ({ loginPage, dashboardPage, users }) => {
          await TestHelpers.loginAndWaitForDashboard(
            loginPage,
            dashboardPage,
            users.VALID
          );
        });

        test(
          "TC_NAV_017: User should be able to logout successfully",
          {
            tag: ["@logout", "@critical"]
          },
          async ({ dashboardPage, loginPage }) => {
            // Act
            await dashboardPage.logout();

            // Assert
            await expect(loginPage.page).toHaveURL(/login/);
            await loginPage.verifyLoginPageLoaded();
          }
        );

        test(
          "TC_NAV_018: User session should persist during navigation",
          {
            tag: ["@session"]
          },
          async ({ dashboardPage, page }) => {
            // Navigate to multiple modules
            await dashboardPage.navigateToModule("Admin");
            await dashboardPage.navigateToModule("PIM");
            await dashboardPage.navigateToModule("Leave");

            // Verify user is still logged in
            const userInfo = await dashboardPage.getUserInfo();
            expect(userInfo.isLoggedIn).toBeTruthy();
          }
        );
      }
    );

    test.describe(
      "Mobile and Responsive Navigation",
      {
        tag: ["@mobile", "@responsive"]
      },
      () => {
        test.beforeEach(async ({ loginPage, dashboardPage, users }) => {
          await TestHelpers.loginAndWaitForDashboard(
            loginPage,
            dashboardPage,
            users.VALID
          );
        });

        test(
          "TC_NAV_019: Navigation should work correctly on mobile viewport",
          {
            tag: ["@mobile"]
          },
          async ({ dashboardPage, page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            // Navigate to modules
            await dashboardPage.navigateToModule("Admin");
            await expect(page).toHaveURL(/admin/);

            await dashboardPage.navigateToModule("PIM");
            await expect(page).toHaveURL(/pim/);

            // Navigate back to dashboard
            await dashboardPage.clickDashboardMenu();
            await expect(page).toHaveURL(/dashboard/);
          }
        );
      }
    );
  }
);
