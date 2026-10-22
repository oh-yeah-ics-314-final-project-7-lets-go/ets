import { test, expect } from './auth-utils';

test.slow();

/* eslint-disable no-await-in-loop */
async function openPendingProject(page: any) {
  await page.locator('#projects-nav').click();
  await page.getByRole('link', {
    name: 'Playwright Testing Project',
    exact: true,
  }).click();
}

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

test('test issue creation', async ({ getUserPage }) => {
  const page = await getUserPage('cookie_rep@site.com', 'changeme');
  await openPendingProject(page);
  await page.getByRole('button', { name: 'Add Issue' }).click();
  await page.getByRole('button', { name: 'Create Issue' }).click();
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
  await openPendingProject(page);
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
  await page.getByRole('button', { name: 'Create Report' }).click();
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

  await page.getByRole('button', { name: 'Create Report' }).click();
  await expect(page.getByText('A report with this year and').nth(1)).toBeVisible();
  await expect(page.getByText('yearCreate must be a `number')).not.toBeVisible();
  await expect(page.getByText('Please choose one of the 12')).not.toBeVisible();
  await expect(page.getByText('paidUpToNow must be a `number')).not.toBeVisible();
  await expect(page.getByText('progress must be a `number`')).not.toBeVisible();
});

test('test malicious XSS input in issue form', async ({ getUserPage }) => {
  const page = await getUserPage('cookie_rep@site.com', 'changeme');

  await openPendingProject(page);

  await page.getByRole('button', { name: 'Add Issue' }).click();

  const maliciousInput = '<script>alert("XSS")</script>';
  let xssExecuted = false;

  page.on('dialog', async (dialog) => {
    xssExecuted = true;
    await dialog.dismiss();
  });

  // Fill in required fields
  await page.getByRole('textbox', {
    name: 'Enter title of issue',
  }).fill('XSS Security Test');

  await page.getByRole('textbox', {
    name: 'Enter description of issue',
  }).fill(maliciousInput);

  await page.getByRole('textbox', {
    name: 'Enter remedy for issue',
  }).fill('Test remedy');

  // Submit the form
  await page.getByRole('button', { name: 'Create Issue' }).click();

  // Verify the form closes after submission
  await expect(page.getByRole('button', {
    name: 'Create Issue',
  })).not.toBeVisible({ timeout: 10000 });

  // Verify no JavaScript alert was triggered
  expect(xssExecuted).toBe(false);

  // Return to the project page
  await openPendingProject(page);

  // Verify the newly created issue is listed
  await expect(
    page.getByText('XSS Security Test', { exact: true }).first(),
  ).toBeVisible();

  // Open the saved issue
  await page.getByRole('link', {
    name: 'XSS Security Test',
    exact: true,
  }).first().click();

  // Verify the saved description is displayed
  await expect(
    page.getByText('<script>alert("XSS")</script>', { exact: true }).first(),
  ).toBeVisible();

  // Verify the malicious JavaScript did not execute
  expect(xssExecuted).toBe(false);
});

test('test malicious XSS input in event form', async ({ getUserPage }) => {
  const page = await getUserPage('cookie_rep@site.com', 'changeme');

  await openPendingProject(page);

  await page.getByRole('button', { name: 'Add Event' }).click();

  const maliciousInput = '<script>alert("XSS")</script>';
  const eventName = `XSS Event Test ${Date.now()}`;
  let xssExecuted = false;

  page.on('dialog', async (dialog) => {
    if (dialog.message() === 'XSS') {
      xssExecuted = true;
    }
    await dialog.dismiss();
  });

  // Fill in required fields
  await page.getByRole('textbox', {
    name: 'Enter name of event',
  }).fill(eventName);

  await page.getByRole('textbox', {
    name: 'Enter description of event',
  }).fill(maliciousInput);

  await page.getByPlaceholder('Set planned start date for')
    .fill('2026-11-01');

  await page.getByPlaceholder('Set planned end date for event')
    .fill('2026-11-02');

  // Submit the form
  await page.getByRole('button', { name: 'Create Event' }).click();

  // Verify the form closes
  await expect(page.getByRole('button', {
    name: 'Create Event',
  })).not.toBeVisible({ timeout: 10000 });

  // Return to the project
  await openPendingProject(page);

  // Verify the event was created
  await expect(
    page.getByText(eventName, { exact: true }).first(),
  ).toBeVisible();

  // Open the saved event
  await page.getByRole('link', {
    name: eventName,
    exact: true,
  }).first().click();

  // Verify malicious input is displayed as text
  await expect(
    page.getByText(maliciousInput, { exact: true }).first(),
  ).toBeVisible();

  // Fail if the XSS alert executed
  expect(xssExecuted).toBe(false);
});

test('test issue submission success message', async ({ getUserPage }) => {
  const page = await getUserPage('cookie_rep@site.com', 'changeme');

  await openPendingProject(page);

  await page.getByRole('button', { name: 'Add Issue' }).click();

  const issueTitle = `Library Integration Test ${Date.now()}`;

  await page.getByRole('textbox', {
    name: 'Enter title of issue',
  }).fill(issueTitle);

  await page.getByRole('textbox', {
    name: 'Enter description of issue',
  }).fill('Testing library integration');

  await page.getByRole('textbox', {
    name: 'Enter remedy for issue',
  }).fill('No remedy required');

  await page.getByRole('button', { name: 'Create Issue' }).click();

  // Verify SweetAlert success message
  await expect(
    page.getByText('Issue has been submitted'),
  ).toBeVisible({ timeout: 10000 });
});

test('vendor cannot access administrator page directly', async ({ getUserPage }) => {
  const page = await getUserPage('cookie_rep@site.com', 'changeme');

  // Attempt to bypass navigation restrictions
  await page.goto('http://localhost:3000/admin');

  // Verify the vendor is not allowed to remain on the admin page
  await expect(page).not.toHaveURL(/\/admin\/?$/);
});
