import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class MyInfoPage extends BasePage {
  readonly personalDetailsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.personalDetailsHeading = this.getHeading("Personal Details");
  }
}
