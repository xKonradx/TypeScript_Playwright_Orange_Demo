import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
    readonly username: Locator;
    readonly password: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly forgotPasswordLink: Locator;

    constructor(page: Page) {
        super(page);
        this.username = page.getByPlaceholder('Username');
        this.password = page.getByPlaceholder('Password');
        this.loginButton = this.getButton('Login');
        this.errorMessage = page.locator('text=/invalid.*credentials/i');
        this.forgotPasswordLink = page.getByText('Forgot your password?');
    }

    async goto(): Promise<void> {
        await this.navigateToPath(BasePage.PATHS.LOGIN);
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