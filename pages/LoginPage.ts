import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Login page object implementing best practices for OrangeHRM login functionality
 * Uses role-based locators and accessibility-first approach
 */
export class LoginPage extends BasePage {
  // Form elements using role-based locators
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  // Error and validation messages
  readonly errorMessage: Locator;
  readonly usernameRequiredMessage: Locator;
  readonly passwordRequiredMessage: Locator;
  readonly singleRequiredMessage: Locator;

  // Navigation elements
  readonly forgotPasswordLink: Locator;

  // Page elements for verification
  readonly loginForm: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Form elements using role-based approach
    this.username = this.getTextInput("Username");
    this.password = this.getPasswordInput("Password");
    this.loginButton = this.getButton("Login");

    // Error messages using multiple strategies
    this.errorMessage = this.getErrorMessageFor(/invalid.*credentials/i);
    this.usernameRequiredMessage = this.page
      .locator(".oxd-input-group")
      .filter({ hasText: "Username" })
      .locator(".oxd-text--danger");
    this.passwordRequiredMessage = this.page
      .locator(".oxd-input-group")
      .filter({ hasText: "Password" })
      .locator(".oxd-text--danger");
    this.singleRequiredMessage = this.getText("Required");

    // Navigation elements
    this.forgotPasswordLink = this.getText("Forgot your password?");

    // Page verification elements
    this.loginForm = this.page.getByRole("form");
    this.pageTitle = this.getHeading(/login/i);
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.navigateToPath(this.PATHS.LOGIN);
    await this.waitForElement(this.loginForm);
  }

  /**
   * Perform login with username and password using enhanced methods
   * @param username - Username to login with
   * @param password - Password to login with
   * @param options - Login options
   */
  async login(
    username: string,
    password: string,
    options: {
      retries?: number;
      validate?: boolean;
      takeScreenshot?: boolean;
    } = {}
  ): Promise<void> {
    const { retries = 3, validate = true, takeScreenshot = false } = options;

    try {
      // Fill username with retry mechanism
      await this.fillWithRetry(this.username, username, {
        timeout: this.TIMEOUTS.ACTION,
        retries,
        validate
      });

      // Fill password with retry mechanism
      await this.fillWithRetry(this.password, password, {
        timeout: this.TIMEOUTS.ACTION,
        retries,
        validate
      });

      // Click login button with retry mechanism
      await this.clickWithRetry(this.loginButton, {
        timeout: this.TIMEOUTS.ACTION,
        retries
      });

      if (takeScreenshot) {
        await this.takeScreenshotEnhanced("login-attempt");
      }
    } catch (error) {
      console.error(`Login failed for user ${username}:`, error);
      if (takeScreenshot) {
        await this.takeScreenshotEnhanced("login-failed");
      }
      throw error;
    }
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.clickElement(this.forgotPasswordLink);
  }

  /**
   * Verify login page is loaded
   */
  async verifyLoginPageLoaded(): Promise<void> {
    await this.assertElementVisible(this.loginForm);
    await this.assertElementVisible(this.username);
    await this.assertElementVisible(this.password);
    await this.assertElementVisible(this.loginButton);
  }

  /**
   * Verify error message is displayed
   * @param expectedMessage - Expected error message
   */
  async verifyErrorMessage(expectedMessage?: string): Promise<void> {
    if (expectedMessage) {
      await this.assertElementVisible(this.getErrorMessageFor(expectedMessage));
    } else {
      await this.assertElementVisible(this.errorMessage);
    }
  }

  /**
   * Verify validation messages for required fields
   * @param field - Field to check validation for
   */
  async verifyRequiredFieldValidation(
    field: "username" | "password" | "both"
  ): Promise<void> {
    switch (field) {
      case "username":
        await this.assertElementVisible(this.usernameRequiredMessage);
        break;
      case "password":
        await this.assertElementVisible(this.passwordRequiredMessage);
        break;
      case "both":
        await this.assertElementVisible(this.usernameRequiredMessage);
        await this.assertElementVisible(this.passwordRequiredMessage);
        break;
    }
  }

  /**
   * Clear login form
   */
  async clearForm(): Promise<void> {
    await this.username.clear();
    await this.password.clear();
  }

  /**
   * Get login form validation state
   * @returns Object with validation state
   */
  async getFormValidationState(): Promise<{
    hasUsernameError: boolean;
    hasPasswordError: boolean;
    hasGeneralError: boolean;
  }> {
    return {
      hasUsernameError: await this.usernameRequiredMessage.isVisible(),
      hasPasswordError: await this.passwordRequiredMessage.isVisible(),
      hasGeneralError: await this.errorMessage.isVisible()
    };
  }

  /**
   * Wait for login to complete (redirect to dashboard)
   */
  async waitForLoginSuccess(): Promise<void> {
    await this.waitForUrl(/dashboard/);
  }

  /**
   * Wait for error message to appear with enhanced error handling
   */
  async waitForErrorMessage(): Promise<void> {
    await this.waitForElementEnhanced(this.errorMessage, {
      state: "visible",
      timeout: this.TIMEOUTS.ASSERTION,
      retries: 2
    });
  }

  /**
   * Get login form validation state with enhanced error handling
   * @returns Object with validation state
   */
  async getFormValidationState(): Promise<{
    hasUsernameError: boolean;
    hasPasswordError: boolean;
    hasGeneralError: boolean;
    formIsValid: boolean;
  }> {
    try {
      const [hasUsernameError, hasPasswordError, hasGeneralError] = await Promise.all([
        this.usernameRequiredMessage.isVisible(),
        this.passwordRequiredMessage.isVisible(),
        this.errorMessage.isVisible()
      ]);

      return {
        hasUsernameError,
        hasPasswordError,
        hasGeneralError,
        formIsValid: !hasUsernameError && !hasPasswordError && !hasGeneralError
      };
    } catch (error) {
      console.error("Failed to get form validation state:", error);
      return {
        hasUsernameError: false,
        hasPasswordError: false,
        hasGeneralError: false,
        formIsValid: false
      };
    }
  }

  /**
   * Validate login form fields
   * @param username - Username to validate
   * @param password - Password to validate
   * @returns Validation result
   */
  async validateLoginForm(
    username: string,
    password: string
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Check if username field is visible and accessible
      if (!(await this.elementExists(this.username))) {
        errors.push("Username field is not accessible");
      }

      // Check if password field is visible and accessible
      if (!(await this.elementExists(this.password))) {
        errors.push("Password field is not accessible");
      }

      // Check if login button is visible and accessible
      if (!(await this.elementExists(this.loginButton))) {
        errors.push("Login button is not accessible");
      }

      // Validate username input
      if (!username || username.trim() === "") {
        errors.push("Username is required");
      }

      // Validate password input
      if (!password || password.trim() === "") {
        errors.push("Password is required");
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error("Form validation failed:", error);
      return {
        isValid: false,
        errors: ["Form validation failed due to technical error"]
      };
    }
  }

  /**
   * Get login form field values
   * @returns Form field values
   */
  async getFormValues(): Promise<{
    username: string;
    password: string;
  }> {
    try {
      const [username, password] = await Promise.all([
        this.username.inputValue(),
        this.password.inputValue()
      ]);

      return { username, password };
    } catch (error) {
      console.error("Failed to get form values:", error);
      return { username: "", password: "" };
    }
  }

  /**
   * Clear login form with enhanced error handling
   */
  async clearForm(): Promise<void> {
    try {
      await this.username.clear();
      await this.password.clear();

      // Verify form is cleared
      const values = await this.getFormValues();
      if (values.username !== "" || values.password !== "") {
        console.warn("Form clearing may not have completed successfully");
      }
    } catch (error) {
      console.error("Failed to clear form:", error);
      throw error;
    }
  }

  /**
   * Check if login form is ready for interaction
   * @returns True if form is ready
   */
  async isFormReady(): Promise<boolean> {
    try {
      const [usernameReady, passwordReady, buttonReady] = await Promise.all([
        this.username.isEnabled(),
        this.password.isEnabled(),
        this.loginButton.isEnabled()
      ]);

      return usernameReady && passwordReady && buttonReady;
    } catch (error) {
      console.error("Failed to check form readiness:", error);
      return false;
    }
  }

  /**
   * Wait for login form to be ready
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
