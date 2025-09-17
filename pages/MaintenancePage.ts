import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class MaintenancePage extends BasePage {
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = this.getHeading("Administrator Access");
  }
}
