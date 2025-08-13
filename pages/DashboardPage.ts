import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
    readonly dashboardHeading: Locator;
    readonly adminMenu: Locator;
    readonly pimMenu: Locator;
    readonly leaveMenu: Locator;
    readonly timeMenu: Locator;
    readonly recruitmentMenu: Locator;
    readonly myInfoMenu: Locator;
    readonly performanceMenu: Locator;
    readonly directoryMenu: Locator;
    readonly maintenanceMenu: Locator;
    readonly buzzMenu: Locator;
    readonly userDropdown: Locator;
    readonly logoutButton: Locator;

    constructor(page: Page) {
        super(page);
        this.dashboardHeading = this.getHeading('Dashboard');
        this.adminMenu = page.getByRole('menuitem', { name: 'Admin' });
        this.pimMenu = page.getByRole('menuitem', { name: 'PIM' });
        this.leaveMenu = page.getByRole('menuitem', { name: 'Leave' });
        this.timeMenu = page.getByRole('menuitem', { name: 'Time' });
        this.recruitmentMenu = page.getByRole('menuitem', { name: 'Recruitment' });
        this.myInfoMenu = page.getByRole('menuitem', { name: 'My Info' });
        this.performanceMenu = page.getByRole('menuitem', { name: 'Performance' });
        this.directoryMenu = page.getByRole('menuitem', { name: 'Directory' });
        this.maintenanceMenu = page.getByRole('menuitem', { name: 'Maintenance' });
        this.buzzMenu = page.getByRole('menuitem', { name: 'Buzz' });
        this.userDropdown = page.locator('.oxd-userdropdown');
        this.logoutButton = page.getByText('Logout');
    }

    async goto(): Promise<void> {
        await this.navigateToPath(BasePage.PATHS.DASHBOARD);
    }

    async waitForDashboard(): Promise<void> {
        await this.dashboardHeading.waitFor({ state: 'visible' });
    }

    async clickAdminMenu(): Promise<void> {
        await this.adminMenu.click();
    }

    async clickPimMenu(): Promise<void> {
        await this.pimMenu.click();
    }

    async clickLeaveMenu(): Promise<void> {
        await this.leaveMenu.click();
    }

    async logout(): Promise<void> {
        await this.userDropdown.click();
        await this.logoutButton.click();
    }
}