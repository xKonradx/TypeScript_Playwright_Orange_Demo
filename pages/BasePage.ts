import { Page, Locator } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    static readonly PATHS = {
        LOGIN: '/',
        DASHBOARD: '/web/index.php/dashboard/index',
        FORGOT_PASSWORD: '/web/index.php/auth/requestPasswordResetCode',
        ADMIN: '/web/index.php/admin/viewAdminModule',
        PIM: '/web/index.php/pim/viewEmployeeList',
        LEAVE: '/web/index.php/leave/viewLeaveList',
        TIME: '/web/index.php/time/viewEmployeeTimesheet',
        RECRUITMENT: '/web/index.php/recruitment/viewCandidates',
        MY_INFO: '/web/index.php/pim/viewPersonalDetails/empNumber/7',
        PERFORMANCE: '/web/index.php/performance/searchEvaluatePerformanceReview',
        DIRECTORY: '/web/index.php/directory/viewDirectory',
        MAINTENANCE: '/web/index.php/maintenance/purgeEmployee',
        BUZZ: '/web/index.php/buzz/viewBuzz'
    } as const;

    static readonly TIMEOUTS = {
        DEFAULT: 5000,
        NETWORK: 10000,
        NAVIGATION: 15000
    } as const;

    getErrorMessage(): Locator {
        return this.page.getByRole('alert')
            .or(this.page.locator('.error, .alert-danger, [class*="error"]'))
            .first();
    }

    getSuccessMessage(): Locator {
        return this.page.locator('[role="status"]')
            .or(this.page.locator('.success, .alert-success, [class*="success"]'))
            .first();
    }

    getTextInput(identifier: string | RegExp): Locator {
        return this.page.getByRole('textbox', { name: identifier })
            .or(this.page.getByPlaceholder(identifier))
            .or(this.page.locator('input[type="text"]'))
            .first();
    }

    getPasswordInput(identifier: string | RegExp): Locator {
        return this.page.getByRole('textbox', { name: identifier })
            .or(this.page.getByPlaceholder(identifier))
            .or(this.page.locator('input[type="password"]'))
            .first();
    }

    getButton(name: string | RegExp): Locator {
        return this.page.getByRole('button', { name });
    }

    getHeading(name: string | RegExp): Locator {
        return this.page.getByRole('heading', { name });
    }

    getLink(name: string | RegExp): Locator {
        return this.page.getByRole('link', { name });
    }

    getErrorMessageFor(expectedMessage: string | RegExp): Locator {
        return this.page.getByText(expectedMessage)
            .or(this.getErrorMessage());
    }

    getSuccessMessageFor(expectedMessage: string | RegExp): Locator {
        return this.page.getByText(expectedMessage)
            .or(this.getSuccessMessage());
    }

    async waitForNetworkIdle(): Promise<void> {
        await this.page.waitForLoadState('networkidle', { 
            timeout: BasePage.TIMEOUTS.NETWORK 
        });
    }

    async waitForUrl(pattern: string | RegExp): Promise<void> {
        await this.page.waitForURL(pattern, { 
            timeout: BasePage.TIMEOUTS.NAVIGATION 
        });
    }

    async navigateToPath(path: string): Promise<void> {
        await this.page.goto(path, { 
            waitUntil: 'domcontentloaded',
            timeout: BasePage.TIMEOUTS.NAVIGATION 
        });
    }
}