import { test, expect } from './auth-utils';

test.slow();
test('can not see specific items', async ({ browser }) => {
  const publicPage = await (await browser.newContext()).newPage();

  await publicPage.goto('http://localhost:3000/');

  await expect(publicPage.locator('#projects-nav')).not.toBeVisible();
  await expect(publicPage.locator('#dashboard-nav')).toBeVisible();
  await expect(publicPage.locator('#add-nav')).not.toBeVisible();
  await expect(publicPage.locator('#about-nav')).toBeVisible();
});

test('public user cannot access administrator page directly', async ({ page }) => {
  // Attempt to access the admin page without logging in
  await page.goto('http://localhost:3000/admin');

  // Verify the public user cannot access admin functionality
  await expect(page).not.toHaveURL(/\/admin\/?$/);
});
