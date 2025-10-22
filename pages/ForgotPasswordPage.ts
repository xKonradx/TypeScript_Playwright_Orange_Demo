import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Forgot password page object implementing best practices for OrangeHRM password reset functionality
 * Uses role-based locators and accessibility-first approach with enhanced error handling
 */
export class ForgotPasswordPage extends BasePage {
  // Page elements using role-based locators
  readonly pageHeading: Locator;
  readonly instructionText: Locator;
  readonly usernameField: Locator;
  readonly cancelButton: Locator;
  readonly resetPasswordButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly usernameRequiredMessage: Locator;
  readonly form: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements using role-based approach
    this.pageHeading = this.getHeading(/reset password/i);
    this.instructionText = this.getText(/please enter your username to identify/i);
    this.usernameField = this.getTextInput(/username/i);
    this.cancelButton = this.getButton(/cancel/i);
    this.resetPasswordButton = this.getButton(/reset password/i);
    this.successMessage = this.getSuccessMessageFor(/reset password link sent/i);
    this.errorMessage = this.getErrorMessage();
    this.usernameRequiredMessage = this.page
      .locator(".oxd-input-group")
      .filter({ hasText: "Username" })
      .locator(".oxd-text--danger");
    this.form = this.page.getByRole("form");
  }

  /**
   * Navigate to forgot password page with enhanced error handling
   */
  async goto(): Promise<void> {
    await this.navigateToPath(this.PATHS.FORGOT_PASSWORD);
    await this.waitForPageLoad();
    await this.verifyPageLoaded();
  }

  /**
   * Fill username field with enhanced error handling and validation
   * @param username - Username to fill
   * @param options - Fill options
   */
  async fillUsername(
    username: string,
    options: {
      retries?: number;
      validate?: boolean;
      takeScreenshot?: boolean;
    } = {}
  ): Promise<void> {
    const { retries = 3, validate = true, takeScreenshot = false } = options;

    try {
      await this.fillWithRetry(this.usernameField, username, {
        timeout: this.TIMEOUTS.ACTION,
        retries,
        validate
      });

      if (takeScreenshot) {
        await this.takeScreenshotEnhanced("username-filled");
      }
    } catch (error) {
      console.error(`Failed to fill username "${username}":`, error);
      if (takeScreenshot) {
        await this.takeScreenshotEnhanced("username-fill-failed");
      }
      throw error;
    }
  }

  /**
   * Click reset password button with enhanced error handling
   * @param options - Click options
   */
  async clickResetPassword(
    options: {
      retries?: number;
      takeScreenshot?: boolean;
      waitForResponse?: boolean;
    } = {}
  ): Promise<void> {
    const { retries = 3, takeScreenshot = false, waitForResponse = true } = options;

    try {
      await this.clickWithRetry(this.resetPasswordButton, {
        timeout: this.TIMEOUTS.ACTION,
        retries
      });

      if (waitForResponse) {
        await this.waitForNetworkIdle();
        await this.waitForLoadingToComplete();
      }

      if (takeScreenshot) {
        await this.takeScreenshotEnhanced("reset-password-clicked");
      }
    } catch (error) {
      console.error("Failed to click reset password button:", error);
      if (takeScreenshot) {
        await this.takeScreenshotEnhanced("reset-password-click-failed");
      }
      throw error;
    }
  }

  /**
   * Click cancel button with enhanced error handling
   * @param options - Click options
   */
  async clickCancel(
    options: {
      retries?: number;
      takeScreenshot?: boolean;
      waitForNavigation?: boolean;
    } = {}
  ): Promise<void> {
    const { retries = 3, takeScreenshot = false, waitForNavigation = true } = options;

    try {
      await this.clickWithRetry(this.cancelButton, {
        timeout: this.TIMEOUTS.ACTION,
        retries
      });

      if (waitForNavigation) {
        await this.waitForNetworkIdle();
        await this.waitForUrlChange(/login/);
      }

      if (takeScreenshot) {
        await this.takeScreenshotEnhanced("cancel-clicked");
      }
    } catch (error) {
      console.error("Failed to click cancel button:", error);
      if (takeScreenshot) {
        await this.takeScreenshotEnhanced("cancel-click-failed");
      }
      throw error;
    }
  }

  /**
   * Verify forgot password page is loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    try {
      await this.assertElementVisible(this.pageHeading);
      await this.assertElementVisible(this.instructionText);
      await this.assertElementVisible(this.usernameField);
      await this.assertElementVisible(this.cancelButton);
      await this.assertElementVisible(this.resetPasswordButton);
    } catch (error) {
      console.error("Forgot password page verification failed:", error);
      throw error;
    }
  }

  /**
   * Verify success message is displayed
   * @param expectedMessage - Expected success message
   */
  async verifySuccessMessage(expectedMessage?: string): Promise<void> {
    try {
      if (expectedMessage) {
        await this.assertElementVisible(this.getSuccessMessageFor(expectedMessage));
      } else {
        await this.assertElementVisible(this.successMessage);
      }
    } catch (error) {
      console.error("Success message verification failed:", error);
      throw error;
    }
  }

  /**
   * Verify error message is displayed
   * @param expectedMessage - Expected error message
   */
  async verifyErrorMessage(expectedMessage?: string): Promise<void> {
    try {
      if (expectedMessage) {
        await this.assertElementVisible(this.getErrorMessageFor(expectedMessage));
      } else {
        await this.assertElementVisible(this.errorMessage);
      }
    } catch (error) {
      console.error("Error message verification failed:", error);
      throw error;
    }
  }

  /**
   * Verify required field validation message
   */
  async verifyRequiredFieldValidation(): Promise<void> {
    try {
      await this.assertElementVisible(this.usernameRequiredMessage);
    } catch (error) {
      console.error("Required field validation verification failed:", error);
      throw error;
    }
  }

  /**
   * Get form validation state
   * @returns Form validation state
   */
  async getFormValidationState(): Promise<{
    hasUsernameError: boolean;
    hasGeneralError: boolean;
    hasSuccessMessage: boolean;
    formIsValid: boolean;
  }> {
    try {
      const [hasUsernameError, hasGeneralError, hasSuccessMessage] = await Promise.all([
        this.usernameRequiredMessage.isVisible(),
        this.errorMessage.isVisible(),
        this.successMessage.isVisible()
      ]);

      return {
        hasUsernameError,
        hasGeneralError,
        hasSuccessMessage,
        formIsValid: !hasUsernameError && !hasGeneralError
      };
    } catch (error) {
      console.error("Failed to get form validation state:", error);
      return {
        hasUsernameError: false,
        hasGeneralError: false,
        hasSuccessMessage: false,
        formIsValid: false
      };
    }
  }

  /**
   * Clear form with enhanced error handling
   */
  async clearForm(): Promise<void> {
    try {
      await this.usernameField.clear();

      // Verify form is cleared
      const usernameValue = await this.usernameField.inputValue();
      if (usernameValue !== "") {
        console.warn("Form clearing may not have completed successfully");
      }
    } catch (error) {
      console.error("Failed to clear form:", error);
      throw error;
    }
  }

  /**
   * Check if form is ready for interaction
   * @returns True if form is ready
   */
  async isFormReady(): Promise<boolean> {
    try {
      const [usernameReady, buttonReady] = await Promise.all([
        this.usernameField.isEnabled(),
        this.resetPasswordButton.isEnabled()
      ]);

      return usernameReady && buttonReady;
    } catch (error) {
      console.error("Failed to check form readiness:", error);
      return false;
    }
  }

  /**
   * Wait for form to be ready
   * @param timeout - Optional timeout override
   */
  async waitForFormReady(timeout?: number): Promise<void> {
    const startTime = Date.now();
    const maxWait = timeout || this.TIMEOUTS.DEFAULT;

    while (Date.now() - startTime < maxWait) {
      if (await this.isFormReady()) {
        return;
      }
      await this.page.waitForTimeout(100);
    }

    throw new Error(`Form not ready within ${maxWait}ms`);
  }
}
