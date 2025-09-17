import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly usernameRequiredMessage: Locator;
  readonly passwordRequiredMessage: Locator;
  readonly singleRequiredMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.username = this.getTextInput("Username");
    this.password = this.getPasswordInput("Password");
    this.loginButton = this.getButton("Login");
    this.errorMessage = this.getText(/invalid.*credentials/i);
    this.forgotPasswordLink = this.getText("Forgot your password?");
    this.usernameRequiredMessage = this.page.locator(
      '//input[@name="username"]/../../span'
    );
    this.passwordRequiredMessage = this.page.locator(
      '//input[@name="password"]/../../span'
    );
    this.singleRequiredMessage = this.getText("Required");
  }

  async goto(): Promise<void> {
    await this.page.goto(this.PATHS.LOGIN);
  }

  async login(user: string, pass: string): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }
}
