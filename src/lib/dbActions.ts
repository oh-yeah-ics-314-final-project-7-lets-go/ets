'use server';

import { getServerSession, NextAuthOptions, Session } from 'next-auth';
import { Project,
  Event, Issue, Severity, Likelihood, Status, Comment, Role, User, ProjectStatus,
  Month,
  Report,
} from '@prisma/client';
import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import authOptions from './authOptions';
import { prisma } from './prisma';

export type SessionWithRole = Session & { user?: { randomKey?: Role; id: string; } };

async function getUserOrThrow(): Promise<User> {
  const session = await getServerSession<NextAuthOptions, SessionWithRole>(authOptions);
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  // Find the user in the database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

async function isAuthorOrETS(id: string) {
  // Get the currently logged-in user
  const user = await getUserOrThrow();
  const session = await getServerSession<NextAuthOptions, SessionWithRole>(authOptions);
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  if (session.user.randomKey === Role.ETS) return true;
  if (
    session.user.randomKey === Role.VENDOR
    && user.id.toString() === id
  ) return true;

  throw new Error('Insufficient permissions');
}

async function forceRole(...roles: Role[]) {
  // Get the currently logged-in user
  const session = await getServerSession<NextAuthOptions, SessionWithRole>(authOptions);
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  for (const role of roles) {
    if (session.user.randomKey === role) return true;
  }
  throw new Error('Insufficient permissions');
}

/**
 * Adds a new project to the database for IV&V reporting.
 * @param project, an object with project details: name, originalContractAward, totalPaidOut, progress.
 */
export async function addProject(project: {
  name: string;
  description: string;
  originalContractAward: number;
}) {
  const user = await getUserOrThrow();
  await forceRole(Role.VENDOR);

  // Create the project and assign the current user as creator
  await prisma.project.create({
    data: {
      name: project.name,
      description: project.description,
      originalContractAward: project.originalContractAward,
      status: ProjectStatus.PENDING,
      creatorId: user.id, // <-- records the logged-in user
    },
  });

  redirect('/projects');
}

/**
 * Edits an existing project in the database.
 * @param project, an object with the project data to update.
 */
export async function editProject(project: Project) {
  const user = await getUserOrThrow();
  await forceRole(Role.VENDOR);
  if (user.id !== project.creatorId) {
    throw new Error('You are not the author');
  }
  if (project.status === ProjectStatus.APPROVED) {
    throw new Error("Project can't be edited after approval");
  }

  // console.log(`editProject data: ${JSON.stringify(project, null, 2)}`);
  await prisma.project.update({
    where: { id: project.id },
    data: {
      name: project.name,
      description: project.description,
      originalContractAward: project.originalContractAward,
    },
  });
  // After updating, redirect to the list page
  redirect(`/project/${project.id}`);
}

/**
 * Deletes an existing project from the database.
 * ALSO DELETES ASSOCIATED ISSUES AND EVENTS
 * @param id, the id of the project to delete.
 */
export async function deleteProject(id: number) {
  await forceRole(Role.ETS);
  // Delete associated events and issues first due to foreign key constraints
  await prisma.event.deleteMany({
    where: { projectId: id },
  });
  await prisma.issue.deleteMany({
    where: { projectId: id },
  });
  await prisma.comment.deleteMany({
    where: { projectId: id },
  });
  await prisma.report.deleteMany({
    where: { projectId: id },
  });
  await prisma.project.delete({
    where: { id },
  });
  // After deleting, redirect to the projects page
  redirect('/projects');
}

export async function changeProjectStatus(id: number, status: ProjectStatus) {
  if (status === ProjectStatus.PENDING) {
    await forceRole(Role.ETS, Role.VENDOR);
  } else {
    await forceRole(Role.ETS);
  }
  await prisma.project.update({
    where: { id },
    data: {
      status,
    },
  });

  redirect(`/project/${id}`);
}

const monthOrder: Record<Month, number> = {
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  APRIL: 4,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  SEPTEMBER: 9,
  OCTOBER: 10,
  NOVEMBER: 11,
  DECEMBER: 12,
} as const;

export type ReportWithProject = Report & { project: Project; };

export async function countReports(query: {
  term: string;
  fromDate?: Date;
  endDate?: Date;
}) {
  if (query.term.length < 3) return 0;

  const { fromDate = new Date(0), endDate = new Date() } = query;

  const count = await prisma.report.count({
    where: {
      project: {
        name: { contains: query.term, mode: 'insensitive' },
      },
      OR: [
        {
          yearCreate: {
            lte: endDate.getUTCFullYear(),
            gte: fromDate.getUTCFullYear(),
          },
        },
        {
          monthCreate: {
            in: (Object.keys(monthOrder) as Month[]).filter(
              m => fromDate.getUTCMonth() + 1 <= monthOrder[m]
              && monthOrder[m] <= endDate.getUTCMonth() + 1,
            ),
          },
        },
      ],
    },
  });

  return count;
}

export async function findReports(query: {
  term: string;
  page: number;
  fromDate?: Date;
  endDate?: Date;
}) {
  if (query.term.length < 3) return undefined;

  const { fromDate = new Date(0), endDate = new Date() } = query;
  const reports: ReportWithProject[] = await prisma.report.findMany({
    where: {
      project: {
        name: { contains: query.term, mode: 'insensitive' },
      },
      OR: [
        { yearCreate: { lte: endDate.getUTCFullYear(), gte: fromDate.getUTCFullYear() } },
        { monthCreate: { in: (Object.keys(monthOrder) as Month[]).filter(
          m => fromDate.getUTCMonth() + 1 <= monthOrder[m]
             && monthOrder[m] <= endDate.getUTCMonth() + 1,
        ) } },
      ],
    },
    orderBy: [
      { projectId: 'desc' },
      { yearCreate: 'desc' },
      { monthCreate: 'desc' },
    ],
    take: 9,
    skip: 9 * (query.page - 1),
    include: {
      project: true,
    },
  });

  return reports;
}

/**
 * Adds a new project to the database for IV&V reporting.
 * @param project, an object with project details: name, originalContractAward, totalPaidOut, progress.
 */
export async function addReport(report: {
  yearCreate: number,
  monthCreate: Month,
  paidUpToNow: number,
  progress: number,
  projectId: number,
}) {
  const user = await getUserOrThrow();
  await forceRole(Role.VENDOR);
  const project = await prisma.project.findUnique({
    where: { id: report.projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  if (user.id !== project?.creatorId) {
    throw new Error('You are not the author');
  }

  // Create the project and assign the current user as creator
  await prisma.report.create({
    data: {
      ...report,
      status: ProjectStatus.PENDING,
      creatorId: user.id, // <-- records the logged-in user
    },
  });

  redirect(`/project/${report.projectId}/`);
}

export async function editReport(report: {
  id: number,
  yearCreate: number,
  monthCreate: Month,
  paidUpToNow: number,
  progress: number,
}) {
  const user = await getUserOrThrow();
  await forceRole(Role.VENDOR);
  const foundReport = await prisma.report.findUnique({
    where: { id: report.id },
    include: {
      project: true,
    },
  });
  if (user.id !== foundReport?.project.creatorId) {
    throw new Error('You are not the author');
  }
  if (!foundReport) {
    throw new Error('Report not found');
  }
  if (foundReport.status === ProjectStatus.APPROVED) {
    throw new Error("Report can't be edited after approval");
  }

  // Create the project and assign the current user as creator
  const updReport = await prisma.report.update({
    where: { id: report.id },
    data: {
      ...report,
    },
  });

  redirect(`/project/${updReport.projectId}/`);
}

export async function changeReportStatus(id: number, status: ProjectStatus) {
  if (status === ProjectStatus.PENDING) {
    await forceRole(Role.ETS, Role.VENDOR);
  } else {
    await forceRole(Role.ETS);
  }

  const report = await prisma.report.update({
    where: { id },
    data: {
      status,
    },
  });

  redirect(`/project/${report.projectId}/report/${id}`);
}

export async function deleteReport(id: number) {
  await forceRole(Role.ETS, Role.VENDOR);
  const report = await prisma.report.delete({
    where: { id },
  });
  // After deleting, redirect to the projects page
  redirect(`/project/${report.projectId}`);
}

/**
 * Use the report and check to see if:
 * - Editing: compare IDs, make sure the one provided is the same.
 * - Creating: check if a report for the same year and month already exists, reject.
 * @param report
 * @returns the report (if it exists)
 */
export async function reportAlreadyExists(report: {
  yearCreate: number,
  monthCreate: Month,
  paidUpToNow: number,
  progress: number,
  projectId: number,
}) {
  await forceRole(Role.VENDOR);

  const checkForReport = await prisma.report.findFirst({
    where: {
      yearCreate: report.yearCreate,
      monthCreate: report.monthCreate,
      projectId: report.projectId,
    },
  });

  return checkForReport;
}

export async function addComment(comment: {
  content: string;
  projectId: number;
}) {
  const user = await getUserOrThrow();

  await prisma.comment.create({
    data: {
      authorId: user.id,
      projectId: comment.projectId,
      content: comment.content,
    },
  });
}

export async function editComment(comment: Comment) {
  const user = await getUserOrThrow();
  if (user.id !== comment.authorId) {
    throw new Error('User ID doesn\'t match');
  }

  await prisma.comment.update({
    where: { id: comment.id },
    data: {
      content: comment.content,
    },
  });
}

export async function deleteComment(id: number) {
  const cmt = await prisma.comment.findUnique({
    where: { id },
  });

  if (!cmt) {
    throw new Error('Comment not found');
  }

  await isAuthorOrETS(cmt.authorId.toString());

  await prisma.comment.delete({
    where: { id },
  });

  redirect(`/project/${cmt.projectId}`);
}

/**
 * Adds a new event to the database
 */
export async function addEvent(event: {
  name: string;
  description: string;
  projectId: number;

  plannedStart: Date;
  plannedEnd: Date;

  completed: boolean;
  actualStart?: Date | null;
  actualEnd?: Date | null;
}) {
  await forceRole(Role.VENDOR);
  await prisma.event.create({
    data: {
      projectId: event.projectId,

      name: event.name,
      description: event.description,

      plannedStart: event.plannedStart,
      plannedEnd: event.plannedEnd,

      completed: event.completed,
      actualStart: event.actualStart,
      actualEnd: event.actualEnd,
    },
  });
  // After adding, redirect to the projects page
  redirect(`/project/${event.projectId}`);
}

/**
 * Edits an existing event in the database.
 */
export async function editEvent(event: Event) {
  await forceRole(Role.VENDOR);
  await prisma.event.update({
    where: { id: event.id },
    data: {
      name: event.name,
      description: event.description,

      plannedStart: event.plannedStart,
      plannedEnd: event.plannedEnd,

      completed: event.completed,
      actualStart: event.actualStart,
      actualEnd: event.actualEnd,
    },
  });
  // After updating, redirect to the projects page
  redirect(`/project/${event.projectId}`);
}

/**
 * Deletes an existing event from the database.
 * @param id, the id of the event to delete.
 */
export async function deleteEvent(id: number) {
  await forceRole(Role.ETS, Role.VENDOR);
  const event = await prisma.event.delete({
    where: { id },
  });
  // After deleting, redirect to the projects page
  redirect(`/project/${event.projectId}`);
}

/**
 * Adds a new issue to the database
 */
export async function addIssue(issue: {
  projectId: number;
  creatorId: number;
  title: string;
  description: string;
  remedy: string;
  severity: string;
  likelihood: string;
  status: string;
}) {
  await forceRole(Role.VENDOR);
  let severity: Severity = 'HIGH';
  switch (issue.severity) {
    case 'medium':
      severity = 'MEDIUM';
      break;
    case 'low':
      severity = 'LOW';
      break;
    default:
      severity = 'HIGH';
      break;
  }

  let likelihood: Likelihood = 'HIGH';
  switch (issue.likelihood) {
    case 'medium':
      likelihood = 'MEDIUM';
      break;
    case 'low':
      likelihood = 'LOW';
      break;
    default:
      likelihood = 'HIGH';
      break;
  }

  let status: Status = 'OPEN';
  switch (issue.status) {
    case 'OPEN':
      status = 'OPEN';
      break;
    case 'CLOSED':
      status = 'CLOSED';
      break;
    default:
      status = 'OPEN';
      break;
  }
  await prisma.issue.create({
    data: {
      projectId: issue.projectId,
      creatorId: issue.creatorId,
      title: issue.title,
      description: issue.description,
      remedy: issue.remedy,
      severity,
      likelihood,
      status,
    },
  });
  // After adding, redirect to the projects page
  redirect(`/project/${issue.projectId}`);
}

/**
 * Edits an existing event in the database.
 */
export async function editIssue(issue: Issue) {
  await forceRole(Role.VENDOR);
  await prisma.issue.update({
    where: { id: issue.id },
    data: {
      title: issue.title,
      description: issue.description,
      remedy: issue.remedy,
      severity: issue.severity,
      likelihood: issue.likelihood,
      status: issue.status,
    },
  });
  // After updating, redirect to the projects page
  redirect(`/project/${issue.projectId}`);
}

/**
 * Deletes an existing issue from the database.
 * @param id, the id of the issue to delete.
 */
export async function deleteIssue(id: number) {
  await forceRole(Role.ETS, Role.VENDOR);
  const issue = await prisma.issue.delete({
    where: { id },
  });
  // After deleting, redirect to the projects page
  redirect(`/project/${issue.projectId}`);
}

/**
 * Creates a new user in the database.
 * @param credentials, an object with the following properties: email, role.
 */
export async function createUser(credentials: {
  firstName: string; lastName: string; email: string; role: Role;
}) {
  await forceRole(Role.ETS);
  // console.log(`createUser data: ${JSON.stringify(credentials, null, 2)}`);
  const password = crypto.getRandomValues(new BigUint64Array(1))[0].toString(36);
  const hashed = await hash(password, 10);
  await prisma.user.create({
    data: {
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      email: credentials.email,
      role: credentials.role,
      password: hashed,
    },
  });

  return password;
}

export async function resetPassword(id: number) {
  await forceRole(Role.ETS);
  const password = crypto.getRandomValues(new BigUint64Array(1))[0].toString(36);
  const hashed = await hash(password, 10);
  await prisma.user.update({
    where: { id },
    data: {
      password: hashed,
    },
  });

  return password;
}

export async function getUserById(userId: number): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function updateUser(userId: number, data: {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}) {
  await forceRole(Role.ETS);
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  // revalidate admin page if needed
  revalidatePath('/admin');

  return updatedUser; // <-- return updated user
}

const DELETED_USER_ID = 0;

export async function deleteUser(userId: number) {
  await forceRole(Role.ETS);
  // Reassign comments
  await prisma.comment.updateMany({
    where: { authorId: userId },
    data: { authorId: DELETED_USER_ID },
  });

  // Reassign issues
  await prisma.issue.updateMany({
    where: { creatorId: userId },
    data: { creatorId: DELETED_USER_ID },
  });

  // Reassign projects
  await prisma.project.updateMany({
    where: { creatorId: userId },
    data: { creatorId: DELETED_USER_ID },
  });

  // Now delete the user
  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath('/admin');
}

/**
 * Changes the password of an existing user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function changePassword(credentials: { email: string; password: string }) {
  const user = await getUserOrThrow();
  if (user.email !== credentials.email) {
    throw new Error('Users don\'t match');
  }

  // console.log(`changePassword data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.update({
    where: { email: credentials.email },
    data: {
      password,
    },
  });
}
