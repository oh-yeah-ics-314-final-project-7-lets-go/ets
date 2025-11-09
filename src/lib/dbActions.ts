'use server';

import { Stuff, Condition, Project, Event, Issue, Severity, Likelihood, Status } from '@prisma/client';
import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

/**
 * Adds a new stuff to the database.
 * @param stuff, an object with the following properties: name, quantity, owner, condition.
 */
export async function addStuff(stuff: { name: string; quantity: number; owner: string; condition: string }) {
  // console.log(`addStuff data: ${JSON.stringify(stuff, null, 2)}`);
  let condition: Condition = 'good';
  if (stuff.condition === 'poor') {
    condition = 'poor';
  } else if (stuff.condition === 'excellent') {
    condition = 'excellent';
  } else {
    condition = 'fair';
  }
  await prisma.stuff.create({
    data: {
      name: stuff.name,
      quantity: stuff.quantity,
      owner: stuff.owner,
      condition,
    },
  });
  // After adding, redirect to the list page
  redirect('/list');
}

/**
 * Deletes an existing project from the database.
 * ALSO DELETED ASSOCIATED ISSUES AND EVENTS
 * @param id, the id of the project to delete.
 */
// export async function deleteProject(id: number) {
//   await prisma.project.delete({
//     where: { id },
//   });
//   await prisma.event.deleteMany({
//     where: { projectId: id },
//   });
//   await prisma.issue.deleteMany({
//     where: { projectId: id },
//   });
//   // After deleting, redirect to the projects page
//   redirect('/projects');
// }

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
  actualStart?: Date;
  actualEnd?: Date;
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
  redirect('/projects');
}

/**
 * Deletes an existing event from the database.
 * @param id, the id of the event to delete.
 */
export async function deleteEvent(id: number) {
  await prisma.event.delete({
    where: { id },
  });
  // After deleting, redirect to the projects page
  redirect('/projects');
}

/**
 * Adds a new issue to the database
 */
export async function addIssue(issue: {
  projectId: number;
  creatorId: number;
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

  let status: Status = 'CLOS';
  switch (issue.likelihood) {
    case 'open':
      status = 'OPEN';
      break;
    default:
      status = 'CLOS';
      break;
  }
  await prisma.issue.create({
    data: {
      projectId: issue.projectId,
      creatorId: issue.creatorId,
      description: issue.description,
      remedy: issue.remedy,
      severity,
      likelihood,
      status,
    },
  });
  // After adding, redirect to the projects page
  redirect('/projects');
}

/**
 * Edits an existing event in the database.
 */
export async function editIssue(issue: Issue) {
  await prisma.issue.update({
    where: { id: issue.id },
    data: {
      description: issue.description,
      remedy: issue.remedy,
      severity: issue.severity,
      likelihood: issue.likelihood,
      status: issue.status,
    },
  });
  // After updating, redirect to the projects page
  redirect('/projects');
}

/**
 * Deletes an existing issue from the database.
 * @param id, the id of the issue to delete.
 */
export async function deleteIssue(id: number) {
  await prisma.issue.delete({
    where: { id },
  });
  // After deleting, redirect to the projects page
  redirect('/projects');
}

/**
 * Edits an existing stuff in the database.
 * @param stuff, an object with the following properties: id, name, quantity, owner, condition.
 */
export async function editStuff(stuff: Stuff) {
  // console.log(`editStuff data: ${JSON.stringify(stuff, null, 2)}`);
  await prisma.stuff.update({
    where: { id: stuff.id },
    data: {
      name: stuff.name,
      quantity: stuff.quantity,
      owner: stuff.owner,
      condition: stuff.condition,
    },
  });
  // After updating, redirect to the list page
  redirect('/list');
}

/**
 * Deletes an existing stuff from the database.
 * @param id, the id of the stuff to delete.
 */
export async function deleteStuff(id: number) {
  // console.log(`deleteStuff id: ${id}`);
  await prisma.stuff.delete({
    where: { id },
  });
  // After deleting, redirect to the list page
  redirect('/list');
}

/**
 * Creates a new user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function createUser(credentials: {
  firstName: string; lastName: string; email: string; password: string
}) {
  // console.log(`createUser data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.create({
    data: {
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      email: credentials.email,
      password,
    },
  });
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

/**
 * Adds a new project to the database for IV&V reporting.
 * @param project, an object with project details: name, originalContractAward, totalPaidOut, progress.
 */
export async function addProject(project: {
  name: string;
  originalContractAward: number;
  totalPaidOut: number;
  progress: number;
}) {
  // console.log(`addProject data: ${JSON.stringify(project, null, 2)}`);
  await prisma.project.create({
    data: {
      name: project.name,
      originalContractAward: project.originalContractAward,
      totalPaidOut: project.totalPaidOut,
      progress: project.progress,
    },
  });
  // After adding, redirect to the list page
  redirect('/list');
}

/**
 * Deletes an existing project from the database.
 * @param id, the id of the project to delete.
 */
export async function deleteProject(id: number) {
  // console.log(`deleteProject id: ${id}`);
  await prisma.project.delete({
    where: { id },
  });
  // After deleting, redirect to the list page
  redirect('/list');
}

/**
 * Edits an existing project in the database.
 * @param project, an object with the project data to update.
 */
export async function editProject(project: {
  id: number;
  name: string;
  originalContractAward: number;
  totalPaidOut: number;
  progress: number;
}) {
  // console.log(`editProject data: ${JSON.stringify(project, null, 2)}`);
  await prisma.project.update({
    where: { id: project.id },
    data: {
      name: project.name,
      originalContractAward: project.originalContractAward,
      totalPaidOut: project.totalPaidOut,
      progress: project.progress,
    },
  });
  // After updating, redirect to the list page
  redirect('/list');
}
