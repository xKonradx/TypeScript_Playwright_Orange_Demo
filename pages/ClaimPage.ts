import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ClaimPage extends BasePage {
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = this.getBreadcrumbText("Claim");
  }
}
