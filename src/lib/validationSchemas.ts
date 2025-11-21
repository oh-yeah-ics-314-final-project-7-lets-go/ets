import * as Yup from 'yup';

export const AddEventSchema = Yup.object({
  name: Yup.string().required(),
  description: Yup.string().required(),
  projectId: Yup.number().required(),

  completed: Yup.boolean().required(),
  plannedStart: Yup.date().required(),
  plannedEnd: Yup.date().required().min(Yup.ref('plannedStart'), 'End date must be later than start date.'),
  actualStart: Yup.date().transform((v, o) => (o === '' ? undefined : v)).optional().nullable(),
  actualEnd: Yup.date().transform((v, o) => (o === '' ? undefined : v)).optional().nullable()
    .when('actualStart', {
      is: (val: any) => val != null && val !== undefined,
      then: (schema) => schema.min(Yup.ref('actualStart'), 'End date must be later than start date.'),
      otherwise: (schema) => schema,
    }),
});

export const EditEventSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  description: Yup.string().required(),

  completed: Yup.boolean().required(),
  plannedStart: Yup.date().required(),
  plannedEnd: Yup.date().required().min(Yup.ref('plannedStart'), 'End date must be later than start date.'),
  actualStart: Yup.date().transform((v, o) => (o === '' ? undefined : v)).optional().nullable(),
  actualEnd: Yup.date().transform((v, o) => (o === '' ? undefined : v)).optional().nullable()
    .when('actualStart', {
      is: (val: any) => val != null && val !== undefined,
      then: (schema) => schema.min(Yup.ref('actualStart'), 'End date must be later than start date.'),
      otherwise: (schema) => schema,
    }),
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

export const AddCommentSchema = Yup.object({
  authorId: Yup.number().required(),
  content: Yup.string()
    .required('You must enter your comment')
    .min(10, 'Comments must be at least 10 characters long.'),
  projectId: Yup.number().required(),
});

export const EditCommentSchema = Yup.object({
  id: Yup.number().required(),
  content: Yup.string()
    .required('You must enter your comment')
    .min(10, 'Comments must be at least 10 characters long.'),
});

export const AddProjectSchema = Yup.object({
  name: Yup.string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must not exceed 100 characters'),
  description: Yup.string()
    .required('Project description is required')
    .min(10, 'Project description must be at least 10 characters')
    .max(4000, 'Project description must not exceed 4000 characters'),
  originalContractAward: Yup.number()
    .required('Original contract award is required')
    .positive('Contract award must be positive')
    .max(999999999, 'Contract award is too large'),
});

export const EditProjectSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must not exceed 100 characters'),
  description: Yup.string()
    .required('Project description is required')
    .min(10, 'Project description must be at least 10 characters')
    .max(4000, 'Project description must not exceed 4000 characters'),
  originalContractAward: Yup.number()
    .required('Original contract award is required')
    .positive('Contract award must be positive')
    .max(999999999, 'Contract award is too large'),
});

export const AddReportSchema = Yup.object({
  totalPaidOut: Yup.number()
    .required('Total paid out is required')
    .min(0, 'Total paid out cannot be negative')
    .max(999999999, 'Total paid out is too large'),
  progress: Yup.number()
    .required('Progress is required')
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100%'),
});

export const EditReportSchema = Yup.object({
  totalPaidOut: Yup.number()
    .required('Total paid out is required')
    .min(0, 'Total paid out cannot be negative')
    .max(999999999, 'Total paid out is too large'),
  progress: Yup.number()
    .required('Progress is required')
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100%'),
});
