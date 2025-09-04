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
      "Invalid Tests",
      {
        tag: ["@negative"]
      },
      () => {
        for (const { testId, description, fixture, expectedError } of [
          ...NEGATIVE_LOGIN_SCENARIOS,
          ...SECURITY_SCENARIOS
        ]) {
          test(
            `${testId}: ${description}, "${expectedError}" is displayed`,
            {
              tag: ["@negative"]
            },
            async ({ loginPage, users }) => {
              let user;
              switch (fixture) {
                case "invalidUser":
                  user = users.invalidUser;
                  break;
                case "invalidPasswordUser":
                  user = users.invalidPasswordUser;
                  break;
                case "sqlInjectionUser":
                  user = users.sqlInjectionUser;
                  break;
                case "xssAttackUser":
                  user = users.xssAttackUser;
                  break;
                default:
                  throw Error("No such user defined in the fixture");
              }
              await loginPage.goto();
              await loginPage.login(user.username, user.password);

              await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
            }
          );
        }
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
            test(
              `${testId}: ${description}, "Required" validation message appears`,
              {
                tag: ["@validation"]
              },
              async ({ loginPage, users }) => {
                let user;
                switch (fixture) {
                  case "emptyUsernameUser":
                    user = users.emptyUsernameUser;
                    break;
                  case "emptyPasswordUser":
                    user = users.emptyPasswordUser;
                    break;
                  case "emptyBothUser":
                    user = users.emptyBothUser;
                    break;
                  default:
                    throw Error("No such user defined in the fixture");
                }
                await loginPage.goto();
                await loginPage.login(user.username, user.password);

                if (user.username && user.password)
                  throw new Error(
                    "Wrong test data, at least one property should be empty."
                  );
                if (!user.username)
                  await expect(loginPage.usernameRequiredMessage).toBeVisible({
                    timeout: 5000
                  });
                if (!user.password)
                  await expect(loginPage.passwordRequiredMessage).toBeVisible({
                    timeout: 5000
                  });
              }
            );
          }
        );
      }
    );
  }
);
