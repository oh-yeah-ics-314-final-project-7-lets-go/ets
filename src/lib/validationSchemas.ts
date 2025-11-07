import * as Yup from 'yup';

export const AddStuffSchema = Yup.object({
  name: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  condition: Yup.string().oneOf(['excellent', 'good', 'fair', 'poor']).required(),
  owner: Yup.string().required(),
});

export const EditStuffSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  condition: Yup.string().oneOf(['excellent', 'good', 'fair', 'poor']).required(),
  owner: Yup.string().required(),
});

export const AddProjectSchema = Yup.object({
  name: Yup.string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must not exceed 100 characters'),
  originalContractAward: Yup.number()
    .required('Original contract award is required')
    .positive('Contract award must be positive')
    .max(999999999, 'Contract award is too large'),
  totalPaidOut: Yup.number()
    .required('Total paid out is required')
    .min(0, 'Total paid out cannot be negative')
    .max(999999999, 'Total paid out is too large'),
  progress: Yup.number()
    .required('Progress is required')
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100%'),
});

export const EditProjectSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must not exceed 100 characters'),
  originalContractAward: Yup.number()
    .required('Original contract award is required')
    .positive('Contract award must be positive')
    .max(999999999, 'Contract award is too large'),
  totalPaidOut: Yup.number()
    .required('Total paid out is required')
    .min(0, 'Total paid out cannot be negative')
    .max(999999999, 'Total paid out is too large'),
  progress: Yup.number()
    .required('Progress is required')
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100%'),
});
