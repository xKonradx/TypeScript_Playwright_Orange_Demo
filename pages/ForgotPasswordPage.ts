import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ForgotPasswordPage extends BasePage {
  readonly pageHeading: Locator;
  readonly usernameField: Locator;
  readonly cancelButton: Locator;
  readonly resetPasswordButton: Locator;
  readonly instructionText: Locator;
  readonly successMessage: Locator;

  /**
   * Creates new ForgotPasswordPage instance
   * param page - Playwright Page object representing browser tab
   */
  constructor(page: Page) {
    super(page);

    // Locate main heading using semantic role - most stable approach
    this.pageHeading = page.getByRole("heading", { name: /reset password/i });

    // Locate instruction text using partial text match with regex for flexibility
    this.instructionText = page.getByText(/please enter your username to identify/i);

    // Locate username field using multiple fallback strategies for maximum reliability
    this.usernameField = page
      .getByRole("textbox", { name: /username/i })
      .or(page.getByPlaceholder(/username/i))
      .or(page.locator('input[type="text"]'));

    // Locate cancel button using semantic role with case-insensitive text matching
    this.cancelButton = page.getByRole("button", { name: /cancel/i });

    // Locate reset password button using semantic role with regex pattern
    this.resetPasswordButton = page.getByRole("button", { name: /reset password/i });
  }

  async goto(): Promise<void> {
    await this.navigateToPath(this.PATHS.FORGOT_PASSWORD);
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameField.fill(username);
  }

  /**
   * Clicks the reset password button and waits for network requests to complete
   * Handles form submission and potential page transitions
   */
  async clickResetPassword(): Promise<void> {
    await this.resetPasswordButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Clicks the cancel button and waits for modal to close or page navigation
   * Returns user to the previous state (usually login page)
   */
  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForNetworkIdle();
  }
}
