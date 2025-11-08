import * as Yup from 'yup';

export const AddProjectSchema = Yup.object({
  name: Yup.string().required(),
  creator: Yup.number().required(),
  originalContractAward: Yup.number().required(),
  totalPaidOut: Yup.number().required(),
});

export const EditProjectSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  creator: Yup.number().required(),
  originalContractAward: Yup.number().required(),
  totalPaidOut: Yup.number().required(),
});

export const AddEventSchema = Yup.object({
  name: Yup.string().required(),
  description: Yup.string().required(),
  projectId: Yup.number().required(),

  completed: Yup.boolean(),
  plannedStart: Yup.date().required(),
  plannedEnd: Yup.date().required(),
  actualStart: Yup.date().optional(),
  actualEnd: Yup.date().optional(),
});

export const EditEventSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  description: Yup.string().required(),

  completed: Yup.boolean(),
  plannedStart: Yup.date().required(),
  plannedEnd: Yup.date().required(),
  actualStart: Yup.date().optional(),
  actualEnd: Yup.date().optional(),
});

export const AddIssueSchema = Yup.object({
  projectId: Yup.number().required(),
  creatorId: Yup.number().required(),
  description: Yup.string().required(),
  remedy: Yup.string().required(),
  severity: Yup.string().oneOf(['low', 'medium', 'high']).required(),
  likelihood: Yup.string().oneOf(['low', 'medium', 'high']).required(),
  status: Yup.string().oneOf(['open', 'closed']).required(),
});

export const EditIssueSchema = Yup.object({
  description: Yup.string().required(),
  remedy: Yup.string().required(),
  severity: Yup.string().oneOf(['low', 'medium', 'high']).required(),
  likelihood: Yup.string().oneOf(['low', 'medium', 'high']).required(),
  status: Yup.string().oneOf(['open', 'closed']).required(),
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
