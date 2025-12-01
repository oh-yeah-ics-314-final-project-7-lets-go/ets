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

test('test comment creation', async ({ getUserPage }) => {
  const vendorPage = await getUserPage('cookie_rep@site.com', 'changeme');
  await vendorPage.locator('#projects-nav').click();
  await vendorPage.getByRole('link', { name: 'Give Keiki Cookies' }).click();
  await vendorPage.getByRole('button', { name: 'Add Comment' }).click();
  await vendorPage.getByRole('button', { name: 'Create Comment' }).click();
  await vendorPage.getByRole('textbox', { name: 'Enter your comment...' }).click();
  await vendorPage.getByRole('textbox', { name: 'Enter your comment...' }).fill('hello');
  await expect(vendorPage.getByText('Comments must be at least 10')).toBeVisible();
  await vendorPage.getByRole('textbox', { name: 'Enter your comment...' }).click();
  await vendorPage.getByRole('textbox', { name: 'Enter your comment...' }).fill('hello world');
  await expect(vendorPage.getByText('Comments must be at least 10')).not.toBeVisible();
});

test('test issue creation', async ({ getUserPage }) => {
  const page = await getUserPage('cookie_rep@site.com', 'changeme');
  await page.locator('#projects-nav').click();
  await page.getByRole('link', { name: 'Give Keiki Cookies' }).click();
  await page.getByRole('button', { name: 'Add Issue' }).click();
  await page.getByRole('button', { name: 'Submit Issue' }).click();
  await expect(page.getByText('description is a required')).toBeVisible();
  await expect(page.getByText('remedy is a required field')).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter description of issue' }).click();
  await page.getByRole('textbox', { name: 'Enter description of issue' }).fill('test desc');
  await page.getByRole('textbox', { name: 'Enter remedy for issue' }).click();
  await page.getByRole('textbox', { name: 'Enter remedy for issue' }).fill('this is a remedy');
  await expect(page.getByText('description is a required')).not.toBeVisible();
  await expect(page.getByText('remedy is a required field')).not.toBeVisible();
});

test('test event creation', async ({ getUserPage }) => {
  const page = await getUserPage('cookie_rep@site.com', 'changeme');
  await page.locator('#projects-nav').click();
  await page.getByRole('link', { name: 'Give Keiki Cookies' }).click();
  await page.getByRole('button', { name: 'Add Event' }).click();
  await page.getByRole('button', { name: 'Create Event' }).click();
  await expect(page.getByText('name is a required field')).toBeVisible();
  await expect(page.getByText('description is a required')).toBeVisible();
  await expect(page.getByText('plannedStart must be a `date')).toBeVisible();
  await expect(page.getByText('plannedEnd must be a `date`')).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter name of event' }).click();
  await page.getByRole('textbox', { name: 'Enter name of event' }).fill('event name');
  await page.getByRole('textbox', { name: 'Enter description of event' }).click();
  await page.getByRole('textbox', { name: 'Enter description of event' }).fill('description');
  await page.getByPlaceholder('Set planned start date for').fill('2025-11-01');
  await page.getByPlaceholder('Set planned end date for event').fill('2025-10-31');
  await expect(page.getByText('End date must be later than')).toBeVisible();
  await page.getByPlaceholder('Set planned end date for event').fill('2025-11-02');
  await expect(page.getByText('name is a required field')).not.toBeVisible();
  await expect(page.getByText('description is a required')).not.toBeVisible();
  await expect(page.getByText('plannedStart must be a `date')).not.toBeVisible();
  await expect(page.getByText('plannedEnd must be a `date`')).not.toBeVisible();
  await expect(page.getByText('End date must be later than')).not.toBeVisible();
});

test('test report creation', async ({ getUserPage }) => {
  const page = await getUserPage('cookie_rep@site.com', 'changeme');
  await page.locator('#projects-nav').click();
  await page.getByRole('link', { name: 'Give Keiki Cookies' }).click();
  await page.getByRole('button', { name: 'Add Report' }).click();
  await page.getByRole('button', { name: 'Submit Report' }).click();
  await expect(page.getByText('yearCreate must be a `number')).toBeVisible();
  await expect(page.getByText('Please choose one of the 12')).toBeVisible();
  await expect(page.getByText('paidUpToNow must be a `number')).toBeVisible();
  await expect(page.getByText('progress must be a `number`')).toBeVisible();
  await page.getByPlaceholder('Enter year covered').click();
  await page.getByPlaceholder('Enter year covered').fill('2025');
  await page.getByRole('combobox').selectOption('APRIL');
  await page.getByPlaceholder('Cumulative amount invoiced').click();
  await page.getByPlaceholder('Cumulative amount invoiced').fill('-10');
  await expect(page.getByText('Total paid must be positive')).toBeVisible();
  await page.getByPlaceholder('Cumulative amount invoiced').click();
  await page.getByPlaceholder('Cumulative amount invoiced').fill('100');

  await page.getByPlaceholder('Cumulative Progress').click();
  await page.getByPlaceholder('Cumulative Progress').fill('1000');
  await expect(page.getByText('Percentage must be 0-')).toBeVisible();
  await page.getByPlaceholder('Cumulative Progress').click();
  await page.getByPlaceholder('Cumulative Progress').click();
  await page.getByPlaceholder('Cumulative Progress').fill('99');

  await page.locator('div').filter({ hasText: 'Submit IV&V Project' }).nth(1).click();
  await page.locator('div').filter({ hasText: 'Submit IV&V Project' }).nth(1).click();
  await page.getByRole('button', { name: 'Submit Report' }).click();
  await expect(page.getByText('A report with this year and').nth(1)).toBeVisible();
  await expect(page.getByText('yearCreate must be a `number')).not.toBeVisible();
  await expect(page.getByText('Please choose one of the 12')).not.toBeVisible();
  await expect(page.getByText('paidUpToNow must be a `number')).not.toBeVisible();
  await expect(page.getByText('progress must be a `number`')).not.toBeVisible();
});
