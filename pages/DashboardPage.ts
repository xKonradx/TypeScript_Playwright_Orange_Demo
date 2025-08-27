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
        this.adminMenu = this.getMenuItem('Admin');
        this.pimMenu = this.getMenuItem('PIM');
        this.leaveMenu = this.getMenuItem('Leave');
        this.timeMenu = this.getMenuItem('Time');
        this.recruitmentMenu = this.getMenuItem('Recruitment');
        this.myInfoMenu = this.getMenuItem('My Info');
        this.performanceMenu = this.getMenuItem('Performance');
        this.directoryMenu = this.getMenuItem('Directory');
        this.maintenanceMenu = this.getMenuItem('Maintenance');
        this.buzzMenu = this.getMenuItem('Buzz');
        this.userDropdown = this.page.locator('.oxd-userdropdown');
        this.logoutButton = this.getText('Logout');
    }

    async goto(): Promise<void> {
        await this.navigateToPath(this.PATHS.DASHBOARD);
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