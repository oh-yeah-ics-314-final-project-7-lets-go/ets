import { test, expect } from './auth-utils';

test.slow();

test('test user creation form', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@hawaii.gov', 'changeme');

  await adminPage.locator('#basic-navbar-nav').getByRole('link', { name: 'User Management' }).click();

  console.log('Current URL:', adminPage.url());

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
