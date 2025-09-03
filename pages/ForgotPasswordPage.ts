import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ForgotPasswordPage extends BasePage {
  readonly pageHeading: Locator;
  readonly usernameField: Locator;
  readonly cancelButton: Locator;
  readonly resetPasswordButton: Locator;
  readonly instructionText: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = this.getHeading(/reset password/i);
    this.instructionText = this.getText(/please enter your username to identify/i);
    this.usernameField = this.getTextInput(/username/i);
    this.cancelButton = this.getButton(/cancel/i);
    this.resetPasswordButton = this.getButton(/reset password/i);
    this.successMessage = this.successMessage = this.getHeading(
      /reset password link sent/i
    );
  }

  async goto(): Promise<void> {
    await this.navigateToPath(this.PATHS.FORGOT_PASSWORD);
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameField.fill(username);
  }

  async clickResetPassword(): Promise<void> {
    await this.resetPasswordButton.click();
    await this.waitForNetworkIdle();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForNetworkIdle();
  }
}
