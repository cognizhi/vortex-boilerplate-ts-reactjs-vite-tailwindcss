import { expect, test } from "@playwright/test";

/**
 * SMOKE TEST
 *
 * The fastest, coarsest check in the suite: does the app boot at all? A
 * real browser hits a real dev server (see playwright.config.ts) and we
 * assert only on the critical path — the page loads, the most important
 * content is visible, and nothing errored. No edge cases, no interaction
 * flows; that's what e2e/home.spec.ts is for. Run this first/most often —
 * it's meant to fail fast on a broken build before anything deeper runs.
 */
test("home page loads with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("the API responds", async ({ request }) => {
  const response = await request.get("/api/hello");
  expect(response.ok()).toBe(true);
});
