import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

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
        this.username = this.page.getByPlaceholder('Username');
        this.password = this.page.getByPlaceholder('Password');
        this.loginButton = this.getButton('Login');
        this.errorMessage = this.page.locator('text=/invalid.*credentials/i');
        this.forgotPasswordLink = this.getText('Forgot your password?');
        this.usernameRequiredMessage = this.getText('Required').first();
        this.passwordRequiredMessage = this.getText('Required').nth(1);
        this.singleRequiredMessage = this.getText('Required');
    }

    async goto(): Promise<void> {
        await this.navigateToPath(this.PATHS.LOGIN);
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