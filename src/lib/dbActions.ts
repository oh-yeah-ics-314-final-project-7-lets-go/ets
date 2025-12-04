'use server';

import { getServerSession } from 'next-auth';
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

/**
 * Adds a new project to the database for IV&V reporting.
 * @param project, an object with project details: name, originalContractAward, totalPaidOut, progress.
 */
export async function addProject(project: {
  name: string;
  description: string;
  originalContractAward: number;
}) {
  // Get the currently logged-in user
  const session = await getServerSession(authOptions);
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

export type ProjectWithReports = Project & { reports: Report[]; };

export async function findReports(query: {
  term: string;
  fromDate?: Date;
  endDate?: Date;
}) {
  if (query.term.length < 3) return undefined;

  const { fromDate = new Date(0), endDate = new Date() } = query;

  const projects: ProjectWithReports[] = await prisma.project.findMany({
    where: { name: { contains: query.term, mode: 'insensitive' } },
    orderBy: {
      id: 'desc',
    },
    include: {
      reports: {
        where: {
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
        orderBy: [
          { yearCreate: 'desc' },
          { monthCreate: 'desc' },
        ],
      },
    },
  });

  return projects;
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
  // Get the currently logged-in user
  const session = await getServerSession(authOptions);
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

  const project = await prisma.project.findUnique({
    where: { id: report.projectId },
  });

  if (!project) {
    throw new Error('Project not found');
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
  // Get the currently logged-in user
  const session = await getServerSession(authOptions);
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
  const report = await prisma.report.update({
    where: { id },
    data: {
      status,
    },
  });

  redirect(`/project/${report.projectId}/report/${id}`);
}

export async function deleteReport(id: number) {
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
  authorId: number;
  content: string;
  projectId: number;
}) {
  await prisma.comment.create({
    data: {
      authorId: comment.authorId,
      projectId: comment.projectId,
      content: comment.content,
    },
  });
}

export async function editComment(comment: Comment) {
  await prisma.comment.update({
    where: { id: comment.id },
    data: {
      content: comment.content,
    },
  });
}

export async function deleteComment(id: number) {
  const cmt = await prisma.comment.delete({
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
  // console.log(`changePassword data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.update({
    where: { email: credentials.email },
    data: {
      password,
    },
  });
}
