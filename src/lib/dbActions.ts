'use server';

import { Stuff, Condition } from '@prisma/client';
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
