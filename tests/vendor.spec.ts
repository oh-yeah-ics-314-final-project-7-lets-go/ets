import { test, expect } from './auth-utils';

test.slow();
test('can authenticate a specific user', async ({ getUserPage }) => {
  const vendorPage = await getUserPage('vendor@site.com', 'changeme');
  await vendorPage.goto('http://localhost:3000/');

  await expect(vendorPage.locator('#projects-nav')).toBeVisible();
  await expect(vendorPage.locator('#dashboard-nav')).toBeVisible();
  await expect(vendorPage.locator('#add-nav')).toBeVisible();
  await expect(vendorPage.locator('#about-nav')).toBeVisible();
});

test('test project creation form for errors', async ({ getUserPage }) => {
  const vendorPage = await getUserPage('vendor@site.com', 'changeme');
  await vendorPage.locator('#add-nav').click();

  // verify errors
  await vendorPage.getByRole('button', { name: 'Submit Project' }).click();
  await expect(vendorPage.getByText('Project name is required')).toBeVisible();
  await expect(vendorPage.getByText('originalContractAward must be')).toBeVisible();
  await expect(vendorPage.getByText('Project description is')).toBeVisible();
});
