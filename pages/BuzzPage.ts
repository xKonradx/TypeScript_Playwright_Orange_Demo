import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class BuzzPage extends BasePage {
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = this.getBreadcrumbText("Buzz");
  }
}
