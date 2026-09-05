import { test, expect } from "@playwright/test";

const overview = (page) =>
  page
    .getByRole("navigation")
    .getByRole("button", { name: "Overview", exact: true })
    .click();

test("Overview creates, edits, cancels and persists jobs entirely in table cells", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await overview(page);
  const table = page.getByRole("table", { name: "Editable opportunities" });
  const company = page.getByRole("textbox", {
    name: "Company for new opportunity",
    exact: true,
  });
  const role = page.getByRole("textbox", {
    name: "Role for new opportunity",
    exact: true,
  });
  await expect(table).toBeVisible();
  await page.getByRole("button", { name: "Add row", exact: true }).click();
  await expect(company).toBeFocused();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Save new opportunity", exact: true })
    .click();
  await expect(company).toBeFocused();
  await expect(table.locator("tbody tr")).toHaveCount(1);

  await company.fill("Fictional Table Studio");
  await role.fill("Analyst");
  await page
    .getByLabel("Open date for new opportunity", { exact: true })
    .fill("2026-09-01");
  await page
    .getByLabel("Deadline for new opportunity", { exact: true })
    .fill("2099-12-31");
  await page
    .getByLabel("Job link for new opportunity", { exact: true })
    .fill("https://example.com/table-job");
  await page
    .getByLabel("Notes for new opportunity", { exact: true })
    .fill("Fictional inline entry.");
  // Internal navigation preserves an in-progress row instead of discarding it.
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Applications", exact: true })
    .click();
  await overview(page);
  await expect(company).toHaveValue("Fictional Table Studio");
  await page
    .getByRole("button", { name: "Save new opportunity", exact: true })
    .click();
  await expect(company).toHaveValue("");
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await expect(
    page.getByLabel("Status for Fictional Table Studio", { exact: true }),
  ).toHaveValue("to_apply");

  const notes = page.getByLabel("Notes for Fictional Table Studio", {
    exact: true,
  });
  await notes.fill("Discard this edit");
  await page
    .getByRole("button", { name: "Cancel Fictional Table Studio", exact: true })
    .click();
  await expect(notes).toHaveValue("Fictional inline entry.");
  await notes.fill("Saved updated note");
  await page
    .getByLabel("Status for Fictional Table Studio", { exact: true })
    .selectOption("applied");
  await page
    .getByRole("button", { name: "Save Fictional Table Studio", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Save Fictional Table Studio",
      exact: true,
    }),
  ).toBeDisabled();
  await company.fill("Canceled draft");
  await page
    .getByRole("button", { name: "Cancel new opportunity", exact: true })
    .click();
  await expect(company).toHaveValue("");
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await page.reload();
  await overview(page);
  await expect(
    page.getByLabel("Notes for Fictional Table Studio", { exact: true }),
  ).toHaveValue("Saved updated note");
  await expect(
    page.getByLabel("Status for Fictional Table Studio", { exact: true }),
  ).toHaveValue("applied");
  await page.getByRole("button", { name: "Add row", exact: true }).click();
  await page.screenshot({
    path: testInfo.outputPath("overview-table-desktop.png"),
    fullPage: true,
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(table).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await company.fill("Mobile Table Example");
  await role.fill("Designer");
  await page
    .getByRole("button", { name: "Save new opportunity", exact: true })
    .click();
  await expect(table.locator("tbody tr")).toHaveCount(3);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Add row", exact: true }).click();
  await page.screenshot({
    path: testInfo.outputPath("overview-table-mobile.png"),
    fullPage: true,
  });
});
