import { test, expect, TEST_USERS, TestHelpers } from "./fixtures";

/**
 * Reset password test scenarios covering various user inputs and edge cases
 */
const RESET_PASSWORD_SCENARIOS = [
  {
    testId: "TC_RESET_PASSWORD_001",
    description: "Valid username should trigger password reset email",
    userType: "VALID" as const,
    expectedResult: "success"
  },
  {
    testId: "TC_RESET_PASSWORD_002",
    description: "Invalid username should show appropriate error message",
    userType: "INVALID" as const,
    expectedResult: "error"
  },
  {
    testId: "TC_RESET_PASSWORD_003",
    description: "Empty username should show validation error",
    userType: "EMPTY_USERNAME" as const,
    expectedResult: "validation_error"
  },
  {
    testId: "TC_RESET_PASSWORD_004",
    description: "SQL injection attempt should be handled securely",
    userType: "SQL_INJECTION" as const,
    expectedResult: "error"
  },
  {
    testId: "TC_RESET_PASSWORD_005",
    description: "XSS attack attempt should be handled securely",
    userType: "XSS_ATTACK" as const,
    expectedResult: "error"
  }
];

test.describe(
  "Reset Password Functionality",
  {
    tag: ["@reset-password", "@critical"]
  },
  () => {
    test.describe(
      "Positive Reset Password Scenarios",
      {
        tag: ["@smoke", "@positive"]
      },
      () => {
        test(
          "TC_RESET_PASSWORD_001: Valid username should successfully trigger password reset process",
          {
            tag: ["@smoke", "@critical"]
          },
          async ({ loginPage, forgotPasswordPage, users }) => {
            // Arrange
            const validUser = users.VALID;

            // Act
            await loginPage.goto();
            await loginPage.waitForFormReady();
            await loginPage.clickForgotPassword();

            // Wait for forgot password page to load
            await forgotPasswordPage.waitForFormReady();
            await forgotPasswordPage.verifyPageLoaded();

            await forgotPasswordPage.fillUsername(validUser.username, {
              retries: 3,
              validate: true,
              takeScreenshot: true
            });

            await forgotPasswordPage.clickResetPassword({
              retries: 3,
              takeScreenshot: true,
              waitForResponse: true
            });

            // Assert
            await expect(forgotPasswordPage.successMessage).toBeVisible({
              timeout: 10000
            });

            // Verify success message content
            const successText = await forgotPasswordPage.getElementText(
              forgotPasswordPage.successMessage
            );
            expect(successText).toContain("reset");
          }
        );

        test(
          "TC_RESET_PASSWORD_006: Reset password page should load correctly with all required elements",
          {
            tag: ["@smoke"]
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
          "TC_RESET_PASSWORD_007: User should be able to navigate back to login page from reset password page",
          {
            tag: ["@navigation"]
          },
          async ({ loginPage, forgotPasswordPage }) => {
            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.clickCancel();

            // Assert
            await expect(loginPage.page).toHaveURL(/login/);
            await loginPage.verifyLoginPageLoaded();
          }
        );
      }
    );

    test.describe(
      "Negative Reset Password Scenarios",
      {
        tag: ["@negative", "@security"]
      },
      () => {
        for (const scenario of RESET_PASSWORD_SCENARIOS.filter(
          (s) => s.expectedResult === "error"
        )) {
          test(
            `TC_RESET_PASSWORD_${scenario.testId}: ${scenario.description}`,
            {
              tag: ["@negative", "@security"]
            },
            async ({ loginPage, forgotPasswordPage, users }) => {
              // Arrange
              const user = users[scenario.userType];

              // Act
              await loginPage.goto();
              await loginPage.clickForgotPassword();
              await forgotPasswordPage.fillUsername(user.username);
              await forgotPasswordPage.clickResetPassword();

              // Assert
              await expect(forgotPasswordPage.errorMessage).toBeVisible({
                timeout: 10000
              });
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
        test(
          "TC_RESET_PASSWORD_003: Empty username field should show required validation message",
          {
            tag: ["@validation", "@critical"]
          },
          async ({ loginPage, forgotPasswordPage }) => {
            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.fillUsername("");
            await forgotPasswordPage.clickResetPassword();

            // Assert
            await expect(forgotPasswordPage.usernameRequiredMessage).toBeVisible({
              timeout: 5000
            });
          }
        );

        test(
          "TC_RESET_PASSWORD_008: Username field should accept and display entered text correctly",
          {
            tag: ["@form"]
          },
          async ({ loginPage, forgotPasswordPage, users }) => {
            // Arrange
            const user = users.VALID;

            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.fillUsername(user.username);

            // Assert
            const usernameValue = await forgotPasswordPage.usernameField.inputValue();
            expect(usernameValue).toBe(user.username);
          }
        );

        test(
          "TC_RESET_PASSWORD_009: Username field should clear properly when user navigates back and forth",
          {
            tag: ["@form"]
          },
          async ({ loginPage, forgotPasswordPage, users }) => {
            // Arrange
            const user = users.VALID;

            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.fillUsername(user.username);
            await forgotPasswordPage.clickCancel();
            await loginPage.clickForgotPassword();

            // Assert
            const usernameValue = await forgotPasswordPage.usernameField.inputValue();
            expect(usernameValue).toBe("");
          }
        );
      }
    );

    test.describe(
      "Security Testing Scenarios",
      {
        tag: ["@security", "@penetration"]
      },
      () => {
        test(
          "TC_RESET_PASSWORD_010: System should handle SQL injection attempts securely",
          {
            tag: ["@security", "@sql-injection"]
          },
          async ({ loginPage, forgotPasswordPage, users }) => {
            // Arrange
            const sqlInjectionUser = users.SQL_INJECTION;

            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.fillUsername(sqlInjectionUser.username);
            await forgotPasswordPage.clickResetPassword();

            // Assert
            await expect(forgotPasswordPage.errorMessage).toBeVisible({
              timeout: 10000
            });
            // Verify no sensitive information is exposed
            const pageContent = await loginPage.page.content();
            expect(pageContent).not.toContain("error");
            expect(pageContent).not.toContain("database");
          }
        );

        test(
          "TC_RESET_PASSWORD_011: System should handle XSS attack attempts securely",
          {
            tag: ["@security", "@xss"]
          },
          async ({ loginPage, forgotPasswordPage, users }) => {
            // Arrange
            const xssUser = users.XSS_ATTACK;

            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.fillUsername(xssUser.username);
            await forgotPasswordPage.clickResetPassword();

            // Assert
            await expect(forgotPasswordPage.errorMessage).toBeVisible({
              timeout: 10000
            });
            // Verify no script execution occurred
            const alerts = await loginPage.page.evaluate(() => window.alert);
            expect(alerts).toBeUndefined();
          }
        );

        test(
          "TC_RESET_PASSWORD_012: System should handle special characters in username appropriately",
          {
            tag: ["@security", "@special-chars"]
          },
          async ({ loginPage, forgotPasswordPage, users }) => {
            // Arrange
            const specialCharUser = users.SPECIAL_CHARS;

            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.fillUsername(specialCharUser.username);
            await forgotPasswordPage.clickResetPassword();

            // Assert
            await expect(forgotPasswordPage.errorMessage).toBeVisible({
              timeout: 10000
            });
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
          "TC_RESET_PASSWORD_013: System should handle extremely long username input",
          {
            tag: ["@edge-cases", "@performance"]
          },
          async ({ loginPage, forgotPasswordPage, users }) => {
            // Arrange
            const longUsernameUser = users.LONG_CREDENTIALS;

            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.fillUsername(longUsernameUser.username);
            await forgotPasswordPage.clickResetPassword();

            // Assert
            await expect(forgotPasswordPage.errorMessage).toBeVisible({
              timeout: 10000
            });
          }
        );

        test(
          "TC_RESET_PASSWORD_014: Multiple rapid reset password attempts should be handled gracefully",
          {
            tag: ["@performance", "@rate-limiting"]
          },
          async ({ loginPage, forgotPasswordPage, users }) => {
            // Arrange
            const user = users.VALID;

            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();

            // Perform multiple rapid attempts
            for (let i = 0; i < 3; i++) {
              await forgotPasswordPage.fillUsername(user.username);
              await forgotPasswordPage.clickResetPassword();
              await forgotPasswordPage.page.waitForTimeout(1000); // Brief pause
            }

            // Assert
            await expect(forgotPasswordPage.successMessage).toBeVisible({
              timeout: 15000
            });
          }
        );

        test(
          "TC_RESET_PASSWORD_015: Network interruption during reset password should be handled gracefully",
          {
            tag: ["@network", "@error-handling"]
          },
          async ({ loginPage, forgotPasswordPage, users }) => {
            // Arrange
            const user = users.VALID;

            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.fillUsername(user.username);

            // Simulate network interruption by navigating away and back
            await loginPage.page.goto("about:blank");
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.fillUsername(user.username);
            await forgotPasswordPage.clickResetPassword();

            // Assert
            await expect(forgotPasswordPage.successMessage).toBeVisible({
              timeout: 10000
            });
          }
        );
      }
    );

    test.describe(
      "User Experience Scenarios",
      {
        tag: ["@ux", "@accessibility"]
      },
      () => {
        test(
          "TC_RESET_PASSWORD_016: Reset password form should be accessible and user-friendly",
          {
            tag: ["@accessibility", "@ux"]
          },
          async ({ loginPage, forgotPasswordPage }) => {
            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();

            // Assert accessibility and UX elements
            await expect(forgotPasswordPage.pageHeading).toBeVisible();
            await expect(forgotPasswordPage.instructionText).toBeVisible();
            await expect(forgotPasswordPage.usernameField).toBeVisible();
            await expect(forgotPasswordPage.cancelButton).toBeVisible();
            await expect(forgotPasswordPage.resetPasswordButton).toBeVisible();

            // Verify form elements are properly labeled
            const usernameLabel =
              await forgotPasswordPage.usernameField.getAttribute("aria-label");
            expect(usernameLabel).toBeTruthy();
          }
        );

        test(
          "TC_RESET_PASSWORD_017: Reset password process should provide clear feedback to user",
          {
            tag: ["@ux", "@feedback"]
          },
          async ({ loginPage, forgotPasswordPage, users }) => {
            // Arrange
            const user = users.VALID;

            // Act
            await loginPage.goto();
            await loginPage.clickForgotPassword();
            await forgotPasswordPage.fillUsername(user.username);
            await forgotPasswordPage.clickResetPassword();

            // Assert feedback is provided
            await expect(forgotPasswordPage.successMessage).toBeVisible({
              timeout: 10000
            });

            // Verify success message is informative
            const successText = await forgotPasswordPage.successMessage.textContent();
            expect(successText).toContain("reset");
          }
        );
      }
    );
  }
);
