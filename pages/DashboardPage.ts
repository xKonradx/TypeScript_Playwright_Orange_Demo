import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  readonly dashboardHeading: Locator;
  readonly userDropdown: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardHeading = this.getHeading("Dashboard");
    this.userDropdown = this.page.locator(".oxd-userdropdown");
    this.logoutButton = this.getText("Logout");
  }

  async goto(): Promise<void> {
    await this.navigateToPath(this.PATHS.DASHBOARD);
  }

  async waitForDashboard(): Promise<void> {
    await this.dashboardHeading.waitFor({ state: "visible" });
  }

  async clickMenu(menuName: string): Promise<void> {
    const specialMenus = ["Leave", "Time", "My Info", "Buzz"];

    if (specialMenus.includes(menuName)) {
      await this.getMainMenuItem(menuName).click();
    } else {
      await this.getText(menuName).click();
    }
  }

  async clickAdminMenu(): Promise<void> {
    await this.clickMenu("Admin");
  }

  async clickPimMenu(): Promise<void> {
    await this.clickMenu("PIM");
  }

  async clickLeaveMenu(): Promise<void> {
    await this.clickMenu("Leave");
  }

  async logout(): Promise<void> {
    await this.userDropdown.click();
    await this.logoutButton.click();
  }
}
