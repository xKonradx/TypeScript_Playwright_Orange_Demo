import { test, expect, TEST_USERS, TestHelpers } from "./fixtures";

/**
 * Test scenarios for negative login attempts
 */
const NEGATIVE_LOGIN_SCENARIOS = [
  {
    testId: "TC_LOGIN_002",
    description: "Login with invalid username should display error message",
    userType: "INVALID" as const,
    expectedError: "Invalid credentials"
  },
  {
    testId: "TC_LOGIN_004",
    description: "Login with invalid password should display error message",
    userType: "INVALID_PASSWORD" as const,
    expectedError: "Invalid credentials"
  }
];

/**
 * Test scenarios for field validation
 */
const VALIDATION_SCENARIOS = [
  {
    testId: "TC_LOGIN_005",
    description: "Empty username field should show required validation message",
    userType: "EMPTY_USERNAME" as const,
    expectedField: "username" as const
  },
  {
    testId: "TC_LOGIN_006",
    description: "Empty password field should show required validation message",
    userType: "EMPTY_PASSWORD" as const,
    expectedField: "password" as const
  }
];

/**
 * Test scenarios for security testing
 */
const SECURITY_SCENARIOS = [
  {
    testId: "TC_LOGIN_008",
    description: "SQL injection attempt should be handled securely",
    userType: "SQL_INJECTION" as const,
    expectedError: "Invalid credentials"
  },
  {
    testId: "TC_LOGIN_009",
    description: "XSS attack attempt should be handled securely",
    userType: "XSS_ATTACK" as const,
    expectedError: "Invalid credentials"
  }
];

test.describe(
  "Login Functionality",
  {
    tag: ["@login", "@critical"]
  },
  () => {
    test.describe(
      "Positive Login Scenarios",
      {
        tag: ["@smoke", "@positive"]
      },
      () => {
        test(
          "TC_LOGIN_001: Valid login credentials should successfully authenticate user and redirect to dashboard",
          {
            tag: ["@smoke", "@critical"]
          },
          async ({ loginPage, dashboardPage, users }) => {
            // Arrange
            const validUser = users.VALID;

            // Act
            await TestHelpers.performLogin(loginPage, validUser, {
              retries: 3,
              takeScreenshot: true,
              validateForm: true
            });

            // Assert
            await loginPage.waitForLoginSuccess();
            await dashboardPage.verifyDashboardLoaded();
            await expect(loginPage.page).toHaveURL(/dashboard/);

            // Verify user is properly authenticated
            const userInfo = await dashboardPage.getUserInfo();
            expect(userInfo.isLoggedIn).toBeTruthy();
          }
        );

        test(
          "TC_LOGIN_010: Login page should load correctly with all required elements visible",
          {
            tag: ["@smoke"]
          },
          async ({ loginPage }) => {
            // Act
            await loginPage.goto();

            // Assert
            await loginPage.verifyLoginPageLoaded();
          }
        );
      }
    );

    test.describe(
      "Negative Login Scenarios",
      {
        tag: ["@negative", "@security"]
      },
      () => {
        for (const scenario of NEGATIVE_LOGIN_SCENARIOS) {
          test(
            `TC_LOGIN_${scenario.testId}: ${scenario.description}`,
            {
              tag: ["@negative"]
            },
            async ({ loginPage, users }) => {
              // Arrange
              const user = users[scenario.userType];

              // Act
              await loginPage.goto();
              await loginPage.waitForFormReady();

              // Validate form before attempting login
              const validation = await loginPage.validateLoginForm(
                user.username,
                user.password
              );
              if (!validation.isValid) {
                console.warn(`Form validation failed: ${validation.errors.join(", ")}`);
              }

              await loginPage.login(user.username, user.password, {
                retries: 2,
                takeScreenshot: true,
                validate: false
              });

              // Assert
              await loginPage.waitForErrorMessage();
              await loginPage.verifyErrorMessage(scenario.expectedError);

              // Verify user is not authenticated
              const formState = await loginPage.getFormValidationState();
              expect(formState.hasGeneralError).toBeTruthy();
            }
          );
        }

        for (const scenario of SECURITY_SCENARIOS) {
          test(
            `TC_LOGIN_${scenario.testId}: ${scenario.description}`,
            {
              tag: ["@security", "@negative"]
            },
            async ({ loginPage, users }) => {
              // Arrange
              const user = users[scenario.userType];

              // Act
              await loginPage.goto();
              await loginPage.waitForFormReady();

              // Log security test attempt
              console.log(
                `Security test: Attempting ${scenario.userType} with credentials: ${user.username}`
              );

              await loginPage.login(user.username, user.password, {
                retries: 2,
                takeScreenshot: true,
                validate: false
              });

              // Assert
              await loginPage.waitForErrorMessage();
              await loginPage.verifyErrorMessage(scenario.expectedError);

              // Verify no sensitive information is exposed
              const pageContent = await loginPage.page.content();
              expect(pageContent).not.toContain("error");
              expect(pageContent).not.toContain("database");
              expect(pageContent).not.toContain("sql");

              // Verify form state
              const formState = await loginPage.getFormValidationState();
              expect(formState.hasGeneralError).toBeTruthy();
            }
          );
        }
      }
    );

    test.describe(
      "Field Validation Scenarios",
      {
        tag: ["@validation", "@form"]
      },
      () => {
        for (const scenario of VALIDATION_SCENARIOS) {
          test(
            `TC_LOGIN_${scenario.testId}: ${scenario.description}`,
            {
              tag: ["@validation"]
            },
            async ({ loginPage, users }) => {
              // Arrange
              const user = users[scenario.userType];

              // Act
              await loginPage.goto();
              await loginPage.waitForFormReady();

              // Validate form before attempting login
              const validation = await loginPage.validateLoginForm(
                user.username,
                user.password
              );
              expect(validation.isValid).toBeFalsy();
              expect(validation.errors.length).toBeGreaterThan(0);

              await loginPage.login(user.username, user.password, {
                retries: 2,
                takeScreenshot: true,
                validate: false
              });

              // Assert
              await loginPage.verifyRequiredFieldValidation(scenario.expectedField);

              // Verify form validation state
              const formState = await loginPage.getFormValidationState();
              expect(formState.formIsValid).toBeFalsy();
            }
          );
        }

        test(
          "TC_LOGIN_007: Both username and password fields empty should show required validation messages for both fields",
          {
            tag: ["@validation", "@critical"]
          },
          async ({ loginPage, users }) => {
            // Arrange
            const emptyUser = users.EMPTY_BOTH;

            // Act
            await loginPage.goto();
            await loginPage.login(emptyUser.username, emptyUser.password);

            // Assert
            await loginPage.verifyRequiredFieldValidation("both");
          }
        );

        test(
          "TC_LOGIN_011: Form should clear properly when user navigates back to login page",
          {
            tag: ["@form"]
          },
          async ({ loginPage, users }) => {
            // Arrange
            const user = users.VALID;

            // Act
            await loginPage.goto();
            await loginPage.login(user.username, user.password);
            await loginPage.goto(); // Navigate back to login page

            // Assert
            await loginPage.verifyLoginPageLoaded();
            const formState = await loginPage.getFormValidationState();
            expect(formState.hasUsernameError).toBeFalsy();
            expect(formState.hasPasswordError).toBeFalsy();
            expect(formState.hasGeneralError).toBeFalsy();
          }
        );
      }
    );

    test.describe(
      "Navigation Scenarios",
      {
        tag: ["@navigation", "@ui"]
      },
      () => {
        test(
          "TC_LOGIN_003: Forgot password link should navigate to password reset page with all required elements",
          {
            tag: ["@navigation", "@smoke"]
          },
          async ({ loginPage, forgotPasswordPage }) => {
            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();

            // Assert
            await expect(forgotPasswordPage.pageHeading).toBeVisible();
            await expect(forgotPasswordPage.instructionText).toBeVisible();
            await expect(forgotPasswordPage.usernameField).toBeVisible();
            await expect(forgotPasswordPage.cancelButton).toBeVisible();
            await expect(forgotPasswordPage.resetPasswordButton).toBeVisible();
          }
        );

        test(
          "TC_LOGIN_012: User should be able to navigate back from forgot password page to login page",
          {
            tag: ["@navigation"]
          },
          async ({ loginPage, forgotPasswordPage }) => {
            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.clickCancel();

            // Assert
            await loginPage.verifyLoginPageLoaded();
          }
        );
      }
    );

    test.describe(
      "Edge Cases and Error Handling",
      {
        tag: ["@edge-cases", "@error-handling"]
      },
      () => {
        test(
          "TC_LOGIN_013: Login with special characters in credentials should be handled appropriately",
          {
            tag: ["@edge-cases"]
          },
          async ({ loginPage, users }) => {
            // Arrange
            const specialCharUser = users.SPECIAL_CHARS;

            // Act
            await loginPage.goto();
            await loginPage.login(specialCharUser.username, specialCharUser.password);

            // Assert
            await loginPage.waitForErrorMessage();
            await loginPage.verifyErrorMessage();
          }
        );

        test(
          "TC_LOGIN_014: Login with extremely long credentials should be handled appropriately",
          {
            tag: ["@edge-cases"]
          },
          async ({ loginPage, users }) => {
            // Arrange
            const longCredsUser = users.LONG_CREDENTIALS;

            // Act
            await loginPage.goto();
            await loginPage.login(longCredsUser.username, longCredsUser.password);

            // Assert
            await loginPage.waitForErrorMessage();
            await loginPage.verifyErrorMessage();
          }
        );

        test(
          "TC_LOGIN_015: Multiple rapid login attempts should be handled gracefully",
          {
            tag: ["@performance", "@edge-cases"]
          },
          async ({ loginPage, users }) => {
            // Arrange
            const user = users.INVALID;

            // Act
            await loginPage.goto();

            // Perform multiple rapid login attempts
            for (let i = 0; i < 3; i++) {
              await loginPage.login(user.username, user.password);
              await loginPage.waitForErrorMessage();
              await loginPage.clearForm();
            }

            // Assert
            await loginPage.verifyLoginPageLoaded();
          }
        );
      }
    );
  }
);
