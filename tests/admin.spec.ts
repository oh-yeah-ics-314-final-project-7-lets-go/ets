import { test, expect } from './auth-utils';

test.slow();
test('test access to admin page', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@hawaii.gov', 'changeme');
  await adminPage.goto('http://localhost:3000/');

  // Test admin view pages
  await expect(adminPage.locator('#projects-nav')).toBeVisible();
  await expect(adminPage.locator('#dashboard-nav')).toBeVisible();
  await expect(adminPage.locator('#add-nav')).not.toBeVisible();
  await expect(adminPage.locator('#basic-navbar-nav').getByRole('link', { name: 'User Management' })).toBeVisible();
  await expect(adminPage.locator('#about-nav')).toBeVisible();
  await adminPage.locator('#projects-nav').click();
  await expect(adminPage.locator('tbody')).toContainText('Give Keiki Cookies');
  await adminPage.getByRole('link', { name: 'Give Keiki Cookies' }).click();
  await expect(adminPage.getByRole('alert').filter({ hasText: 'This project is in a' })).toBeVisible();
  await expect(adminPage.getByRole('main'))
    .toContainText('This project is in a provisional state and is pending approval.'
    + ' Submitted by cookie man (cookie_rep@site.com)ApproveDeny');
  await expect(adminPage.getByRole('link', { name: 'April 2025 Report' })).toBeVisible();
  await adminPage.getByRole('link', { name: 'April 2025 Report' }).click();
  await expect(adminPage.getByRole('button', { name: 'Change to pending' })).toBeVisible();
  await expect(adminPage.getByRole('button', { name: 'Delete' })).toBeVisible();
  await adminPage.locator('#basic-navbar-nav').getByRole('link', { name: 'User Management' }).click();
  await expect(adminPage.getByRole('button', { name: 'Edit' }).first()).toBeVisible();
  await expect(adminPage.getByRole('button', { name: 'Reset password' }).first()).toBeVisible();
  await expect(adminPage.getByRole('button', { name: 'Delete' }).first()).toBeVisible();
});

test('test user creation form', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@hawaii.gov', 'changeme');
  await adminPage.goto('http://localhost:3000/');

  await adminPage.locator('#basic-navbar-nav').getByRole('link', { name: 'User Management' }).click();
  await expect(adminPage.getByRole('button', { name: 'Create User' })).toBeVisible();
  await adminPage.getByRole('button', { name: 'Create User' }).click();

  // Make an account
  await adminPage.getByRole('button', { name: 'Create Account' }).click();
  await adminPage.getByRole('textbox', { name: 'john.doe@example.com' }).click();
  await adminPage.getByRole('textbox', { name: 'john.doe@example.com' }).fill('invalidEmail');
  await adminPage.getByRole('textbox', { name: 'John', exact: true }).click();
  await adminPage.getByRole('textbox', { name: 'John', exact: true }).fill('test');
  await adminPage.getByRole('textbox', { name: 'Doe', exact: true }).click();
  await adminPage.getByRole('textbox', { name: 'Doe', exact: true }).fill('account');
  await adminPage.getByRole('combobox').selectOption('VENDOR');
  await adminPage.getByRole('textbox', { name: 'john.doe@example.com' }).fill('validEmail@mail.com');
});
