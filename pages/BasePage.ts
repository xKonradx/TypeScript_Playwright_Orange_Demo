import { Page, Locator } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  protected readonly PATHS = {
    LOGIN: "/",
    DASHBOARD: "/web/index.php/dashboard/index",
    FORGOT_PASSWORD: "/web/index.php/auth/requestPasswordResetCode"
  } as const;

  protected readonly TIMEOUTS = {
    DEFAULT: 5000,
    NETWORK: 10000,
    NAVIGATION: 15000
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  getErrorMessage(): Locator {
    return this.page
      .getByRole("alert")
      .or(this.page.locator('.error, .alert-danger, [class*="error"]'));
  }

  getSuccessMessage(): Locator {
    return this.page
      .locator('[role="status"]')
      .or(this.page.locator('.success, .alert-success, [class*="success"]'));
  }

  getTextInput(identifier: string | RegExp): Locator {
    return this.page
      .getByRole("textbox", { name: identifier })
      .or(this.page.getByPlaceholder(identifier))
      .or(this.page.locator('input[type="text"]'));
  }

  getPasswordInput(identifier: string | RegExp): Locator {
    return this.page
      .getByRole("textbox", { name: identifier })
      .or(this.page.getByPlaceholder(identifier))
      .or(this.page.locator('input[type="password"]'));
  }

  getButton(name: string | RegExp): Locator {
    return this.page.getByRole("button", { name });
  }

  getHeading(name: string | RegExp): Locator {
    return this.page.getByRole("heading", { name });
  }

  getLink(name: string | RegExp): Locator {
    return this.page.getByRole("link", { name });
  }

  getMenuItem(name: string | RegExp): Locator {
    return this.page.getByRole("menuitem", { name });
  }

  getText(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  getBreadcrumbText(text: string): Locator {
    return this.page.locator(".oxd-topbar-header-breadcrumb-module").getByText(text);
  }

  getMainMenuItem(text: string): Locator {
    return this.page
      .locator(".oxd-main-menu-item--name")
      .getByText(text, { exact: true });
  }

  getErrorMessageFor(expectedMessage: string | RegExp): Locator {
    return this.page.getByText(expectedMessage).or(this.getErrorMessage());
  }

  getSuccessMessageFor(expectedMessage: string | RegExp): Locator {
    return this.page.getByText(expectedMessage).or(this.getSuccessMessage());
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState("networkidle", {
      timeout: this.TIMEOUTS.NETWORK
    });
  }

  async waitForUrl(pattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(pattern, {
      timeout: this.TIMEOUTS.NAVIGATION
    });
  }

  async navigateToPath(path: string): Promise<void> {
    await this.page.goto(path, {
      waitUntil: "domcontentloaded",
      timeout: this.TIMEOUTS.NAVIGATION
    });
  }
}
