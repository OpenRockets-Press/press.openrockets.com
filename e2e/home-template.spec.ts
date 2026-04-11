import { expect, test } from "@playwright/test";

test("renders mandatory home template sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("home-header")).toBeVisible();
  await expect(page.getByTestId("home-search-input")).toBeVisible();
  await expect(page.getByTestId("home-categories-rail")).toBeVisible();
  await expect(page.getByTestId("home-shelf-new-releases")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Empowering Youth Voices" })).toBeVisible();
  await expect(page.getByTestId("home-shelf-featured")).toBeVisible();
  await expect(page.getByTestId("home-footer")).toBeVisible();
});
