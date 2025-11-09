import * as Yup from 'yup';

export const AddEventSchema = Yup.object({
  name: Yup.string().required(),
  description: Yup.string().required(),
  projectId: Yup.number().required(),

  completed: Yup.boolean().required(),
  plannedStart: Yup.date().required(),
  plannedEnd: Yup.date().required().min(Yup.ref('plannedStart'), 'End date must be later than start date.'),
  actualStart: Yup.date().transform((v, o) => (o === '' ? undefined : v)).optional(),
  actualEnd: Yup.date().transform((v, o) => (o === '' ? undefined : v)).optional()
    .when('actualStart', (startDate, schema) => (startDate
      ? schema.min(startDate, 'End date must be later than start date.')
      : schema)),
});

export const EditEventSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  description: Yup.string().required(),

  completed: Yup.boolean().required(),
  plannedStart: Yup.date().required(),
  plannedEnd: Yup.date().required().min(Yup.ref('plannedStart'), 'End date must be later than start date.'),
  actualStart: Yup.date().transform((v, o) => (o === '' ? undefined : v)).optional(),
  actualEnd: Yup.date().transform((v, o) => (o === '' ? undefined : v)).optional()
    .when('actualStart', (startDate, schema) => (startDate
      ? schema.min(startDate, 'End date must be later than start date.')
      : schema)),
});

export const AddIssueSchema = Yup.object({
  projectId: Yup.number().required(),
  creatorId: Yup.number().required(),
  description: Yup.string().required(),
  remedy: Yup.string().required(),
  severity: Yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH']).required(),
  likelihood: Yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH']).required(),
  status: Yup.string().oneOf(['OPEN', 'CLOSED']).required(),
});

export const EditIssueSchema = Yup.object({
  id: Yup.number().required(),
  description: Yup.string().required(),
  remedy: Yup.string().required(),
  severity: Yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH']).required(),
  likelihood: Yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH']).required(),
  status: Yup.string().oneOf(['OPEN', 'CLOSED']).required(),
});

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
