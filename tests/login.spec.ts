import { test, expect } from "./fixtures";

const NEGATIVE_LOGIN_SCENARIOS = [
  {
    testId: "TC_LOGIN_002",
    description: "Invalid Username",
    fixture: "invalidUser",
    expectedError: "Invalid credentials"
  },
  {
    testId: "TC_LOGIN_004",
    description: "Invalid Password",
    fixture: "invalidPasswordUser",
    expectedError: "Invalid credentials"
  }
];

const VALIDATION_SCENARIOS = [
  {
    testId: "TC_LOGIN_005",
    description: "Empty Username",
    fixture: "emptyUsernameUser",
    expectedMessage: "singleRequiredMessage"
  },
  {
    testId: "TC_LOGIN_006",
    description: "Empty Password",
    fixture: "emptyPasswordUser",
    expectedMessage: "singleRequiredMessage"
  }
];

const SECURITY_SCENARIOS = [
  {
    testId: "TC_LOGIN_008",
    description: "SQL Injection Test",
    fixture: "sqlInjectionUser",
    expectedError: "Invalid credentials"
  },
  {
    testId: "TC_LOGIN_009",
    description: "XSS Attack Test",
    fixture: "xssAttackUser",
    expectedError: "Invalid credentials"
  }
];

test.describe(
  "Login Functionality",
  {
    tag: ["@login", "@critical"]
  },
  () => {
    test(
      "TC_LOGIN_001: Valid Login redirects to dashboard",
      {
        tag: ["@smoke"]
      },
      async ({ loginPage, dashboardPage, validUser }) => {
        await loginPage.goto();
        await loginPage.login(validUser.username, validUser.password);

        await expect(loginPage.page).toHaveURL(/dashboard/, { timeout: 10000 });
        await expect(dashboardPage.dashboardHeading).toBeVisible();
      }
    );

    test.describe(
      "Invalid Credentials Tests",
      {
        tag: ["@negative"]
      },
      () => {
        NEGATIVE_LOGIN_SCENARIOS.forEach(
          ({ testId, description, fixture, expectedError }) => {
            if (fixture === "invalidUser") {
              test(
                `${testId}: ${description}, "${expectedError}" is displayed`,
                {
                  tag: ["@negative"]
                },
                async ({ loginPage, invalidUser }) => {
                  await loginPage.goto();
                  await loginPage.login(invalidUser.username, invalidUser.password);

                  await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
                }
              );
            } else if (fixture === "invalidPasswordUser") {
              test(
                `${testId}: ${description}, "${expectedError}" is displayed`,
                {
                  tag: ["@negative"]
                },
                async ({ loginPage, invalidPasswordUser }) => {
                  await loginPage.goto();
                  await loginPage.login(
                    invalidPasswordUser.username,
                    invalidPasswordUser.password
                  );

                  await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
                }
              );
            }
          }
        );
      }
    );

    test(
      "TC_LOGIN_003: Forgot Password Link",
      {
        tag: ["@navigation"]
      },
      async ({ loginPage, forgotPasswordPage }) => {
        await loginPage.goto();
        await loginPage.clickForgotPassword();

        await expect(forgotPasswordPage.pageHeading).toBeVisible();
        await expect(forgotPasswordPage.instructionText).toBeVisible();
        await expect(forgotPasswordPage.usernameField).toBeVisible();
        await expect(forgotPasswordPage.cancelButton).toBeVisible();
        await expect(forgotPasswordPage.resetPasswordButton).toBeVisible();
      }
    );

    test.describe(
      "Field Validation Tests",
      {
        tag: ["@validation"]
      },
      () => {
        VALIDATION_SCENARIOS.forEach(
          ({ testId, description, fixture, expectedMessage }) => {
            if (fixture === "emptyUsernameUser") {
              test(
                `${testId}: ${description}, "Required" validation message appears`,
                {
                  tag: ["@validation"]
                },
                async ({ loginPage, emptyUsernameUser }) => {
                  await loginPage.goto();
                  await loginPage.login(
                    emptyUsernameUser.username,
                    emptyUsernameUser.password
                  );

                  await expect(loginPage.singleRequiredMessage).toBeVisible({
                    timeout: 5000
                  });
                }
              );
            } else if (fixture === "emptyPasswordUser") {
              test(
                `${testId}: ${description}, "Required" validation message appears`,
                {
                  tag: ["@validation"]
                },
                async ({ loginPage, emptyPasswordUser }) => {
                  await loginPage.goto();
                  await loginPage.login(
                    emptyPasswordUser.username,
                    emptyPasswordUser.password
                  );

                  await expect(loginPage.singleRequiredMessage).toBeVisible({
                    timeout: 5000
                  });
                }
              );
            }
          }
        );

        test(
          'TC_LOGIN_007: Both Fields Empty, "Required" validation messages appear',
          {
            tag: ["@validation"]
          },
          async ({ loginPage, emptyBothUser }) => {
            await loginPage.goto();
            await loginPage.login(emptyBothUser.username, emptyBothUser.password);

            await expect(loginPage.usernameRequiredMessage).toBeVisible({
              timeout: 5000
            });
            await expect(loginPage.passwordRequiredMessage).toBeVisible({
              timeout: 5000
            });
          }
        );
      }
    );

    test.describe(
      "Security Tests",
      {
        tag: ["@security"]
      },
      () => {
        SECURITY_SCENARIOS.forEach(
          ({ testId, description, fixture, expectedError }) => {
            if (fixture === "sqlInjectionUser") {
              test(
                `${testId}: ${description}, login fails with "${expectedError}"`,
                {
                  tag: ["@security"]
                },
                async ({ loginPage, sqlInjectionUser }) => {
                  await loginPage.goto();
                  await loginPage.login(
                    sqlInjectionUser.username,
                    sqlInjectionUser.password
                  );

                  await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
                }
              );
            } else if (fixture === "xssAttackUser") {
              test(
                `${testId}: ${description}, login fails with "${expectedError}"`,
                {
                  tag: ["@security"]
                },
                async ({ loginPage, xssAttackUser }) => {
                  await loginPage.goto();
                  await loginPage.login(xssAttackUser.username, xssAttackUser.password);

                  await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
                }
              );
            }
          }
        );
      }
    );
  }
);
