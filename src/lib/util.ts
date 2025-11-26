import { Report } from '@prisma/client';

// Determine progress bar variant
export const getProgressVariant = (progress: number) => {
  if (progress < 25) return 'danger';
  if (progress < 75) return 'warning';
  return 'success';
};

// Format currency
export const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(amount);

// Format date
export const formatDateShort = (date: Date) => new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}).format(new Date(date));

export const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const capitalizeString = (str: string) => str
  .split('')
  .map((c, i) => (i === 0 ? c.toUpperCase() : c.toLowerCase()))
  .join('');

export const reportName = (rep: Report) => `${capitalizeString(rep.monthCreate)} ${rep.yearCreate} Report`;
