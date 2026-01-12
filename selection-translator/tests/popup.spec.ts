import { expect, test } from "./fixtures";

test.beforeEach(async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.waitForLoadState("networkidle");
});

test("popup page", async ({ page }, testInfo) => {
  await page.screenshot({ path: testInfo.outputPath("popup.png") });
});

test("popup page dark mode", async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.evaluate(() => matchMedia("(prefers-color-scheme: dark)").matches);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: testInfo.outputPath("popup_dark.png") });
});

test("enable switch toggle", async ({ page }, testInfo) => {
  await page.screenshot({ path: testInfo.outputPath("popup_enable.png") });

  const enableSwitch = page.getByRole("switch", { name: "Enable" });
  await enableSwitch.click();
  await page.waitForLoadState("networkidle");
  await expect(enableSwitch).not.toBeChecked();
  await page.screenshot({ path: testInfo.outputPath("popup_disable.png") });

  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: testInfo.outputPath("popup_after_reload.png"),
  });
});

test("translate to English selection", async ({ page }, testInfo) => {
  await page.screenshot({ path: testInfo.outputPath("before_selection.png") });

  const translateToCombobox = page.getByText("日本語");
  await translateToCombobox.click();
  await page.screenshot({ path: testInfo.outputPath("options_open.png") });

  await page.getByRole("option", { name: "English" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: testInfo.outputPath("after_selection.png") });

  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: testInfo.outputPath("after_reload.png") });
});
