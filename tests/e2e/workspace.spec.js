import { test, expect } from "@playwright/test";
import ExcelJS from "exceljs";

const openPage = (page, name) =>
  page
    .getByRole("navigation")
    .getByRole("button", { name, exact: true })
    .click();
async function addJob(page, company = "E2E Example") {
  await page
    .getByRole("button", { name: "Add opportunity", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Company *", { exact: true }).fill(company);
  await dialog.getByLabel("Role *", { exact: true }).fill("Product Analyst");
  await dialog
    .getByLabel("Next action", { exact: true })
    .fill("Prepare tailored resume");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).not.toBeVisible();
}

test("complete personal workflow survives reload and exports a valid backup", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await addJob(page);
  await page.getByLabel("Status for E2E Example").selectOption("applied");
  await expect(page.getByLabel("Status for E2E Example")).toHaveValue(
    "applied",
  );
  await page.reload();
  await expect(page.getByLabel("Status for E2E Example")).toHaveValue(
    "applied",
  );
  await openPage(page, "Personal materials");
  await page
    .getByRole("button", { name: "Add material", exact: true })
    .first()
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title *").fill("Research story");
  await dialog
    .getByLabel("Experience / story *")
    .fill("A fictional project with measurable results.");
  await dialog
    .getByLabel("Resume phrasing", { exact: true })
    .fill("Analyzed 120 fictional survey responses.");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).not.toBeVisible();
  await openPage(page, "Applications");
  await page
    .getByRole("button", { name: "E2E Example Product Analyst" })
    .click();
  await page
    .getByRole("button", { name: "Save & create resume workspace" })
    .click();
  dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Workspace name *")).toHaveValue(
    "E2E Example - Product Analyst",
  );
  await dialog
    .getByLabel("Job description", { exact: true })
    .fill("Fictional analyst role requiring research skills.");
  await dialog.getByLabel("Research story").check();
  await dialog.getByRole("button", { name: "Add to draft" }).click();
  await expect(dialog.getByLabel("Resume draft", { exact: true })).toHaveValue(
    "Analyzed 120 fictional survey responses.",
  );
  await dialog.getByLabel("Final version", { exact: true }).check();
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await openPage(page, "Resume workspaces");
  await expect(page.getByText("Final version", { exact: true })).toBeVisible();
  await openPage(page, "Weekly review");
  await page
    .getByRole("button", { name: "Review this week", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Jobs Applied", { exact: true })).toHaveValue(
    "1",
  );
  await dialog
    .getByLabel("Next week priorities")
    .fill("Prepare a second resume.");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Prepare a second resume.")).toBeVisible();
  await page
    .getByRole("button", { name: "Settings & data", exact: true })
    .click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export full backup" }).click();
  const file = await downloaded;
  const stream = await file.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const backup = JSON.parse(Buffer.concat(chunks).toString());
  expect(backup.data.jobs).toHaveLength(1);
  expect(backup.data.materials).toHaveLength(1);
  expect(backup.data.resumes).toHaveLength(1);
  expect(backup.data.reviews).toHaveLength(1);
  await page
    .getByRole("button", { name: "Clear workspace", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete all local data", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByLabel("Restore backup", { exact: true }).setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.getByRole("button", { name: "Replace & restore" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await openPage(page, "Applications");
  await expect(page.getByLabel("Status for E2E Example")).toHaveValue(
    "applied",
  );
  expect(errors).toEqual([]);
});

test("CSV, Excel and pasted imports use preview, mapping, and duplicate warnings", async ({
  page,
}) => {
  await page.goto("/");
  await openPage(page, "Import jobs");
  await page.getByLabel("Upload job file").setInputFiles({
    name: "fictional.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "Company,Role,Location\nCSV Example,Researcher,Shanghai",
    ),
  });
  await expect(
    page.getByRole("cell", { name: "CSV Example", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Import 1 opportunities" }).click();
  await expect(
    page.getByText("1 opportunities added", { exact: true }).first(),
  ).toBeVisible();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Jobs");
  ws.addRow(["Company", "Role", "Deadline"]);
  ws.addRow(["Excel Example", "Analyst", new Date("2099-12-01T00:00:00Z")]);
  await page.getByLabel("Upload job file").setInputFiles({
    name: "fictional.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(await wb.xlsx.writeBuffer()),
  });
  await expect(
    page.getByRole("cell", { name: "Excel Example", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Import 1 opportunities" }).click();
  await page.getByRole("tab", { name: "Paste table" }).click();
  await page
    .getByLabel("Job source content")
    .fill(
      "Employer\tPosition\tLocation\nCSV Example\tResearcher\tShanghai\nPaste Example\tDesigner\tBeijing",
    );
  await page.getByRole("button", { name: "Preview rows" }).click();
  await page.getByLabel("Map Company", { exact: true }).selectOption("0");
  await expect(
    page.getByText("Possible duplicate", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Select recommended" }).click();
  await expect(
    page.getByLabel("Select row 1", { exact: true }),
  ).not.toBeChecked();
  await expect(page.getByLabel("Select row 2", { exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Import 1 opportunities" }).click();
  await page.getByRole("button", { name: "Open tracker" }).click();
  await expect(page.locator(".tracker-table tbody tr")).toHaveCount(3);
  await page.reload();
  await expect(page.locator(".tracker-table tbody tr")).toHaveCount(3);
});

test("search, archive, delete, and rejected backups preserve the remaining workspace", async ({
  page,
}) => {
  await page.goto("/");
  await addJob(page, "Fictional A");
  await addJob(page, "Fictional B");
  await page
    .getByPlaceholder("Search company, role, or notes...")
    .fill("Fictional A");
  await expect(page.locator(".tracker-table tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Archive Fictional A", exact: true })
    .click();
  await page.getByRole("button", { name: "Archived", exact: true }).click();
  await expect(page.locator(".tracker-table tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Unarchive Fictional A", exact: true })
    .click();
  await page.getByRole("button", { name: "All applications" }).click();
  await page
    .getByRole("button", { name: "Delete Fictional A", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await expect(page.locator(".tracker-table tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Settings & data", exact: true })
    .click();
  await page.getByLabel("Restore backup", { exact: true }).setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"app":"OfferFlow","data":{"version":99}}'),
  });
  await expect(page.getByRole("alert")).toContainText("Invalid");
  await openPage(page, "Applications");
  await expect(page.locator(".tracker-table tbody tr")).toHaveCount(1);
});

test("desktop and mobile layouts stay within viewport and are interactive", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Settings & data", exact: true })
    .click();
  await page.getByRole("button", { name: "Load demo data" }).click();
  await expect(page.getByRole("status")).toContainText("Fictional demo loaded");
  await openPage(page, "Applications");
  await page.screenshot({
    path: testInfo.outputPath("desktop-applications.png"),
    fullPage: true,
  });
  await expect(page.locator(".tracker-table tbody tr")).toHaveCount(5);
  for (const name of [
    "Overview",
    "Personal materials",
    "Resume workspaces",
    "Weekly review",
    "Import jobs",
  ]) {
    await openPage(page, name);
    await expect(page.locator("main h1:visible")).toBeVisible();
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await openPage(page, "Applications");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("mobile-applications.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Add opportunity", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("mobile-editor.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Close dialog" }).click();
});
