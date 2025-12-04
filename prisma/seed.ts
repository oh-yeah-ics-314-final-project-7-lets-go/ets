/* eslint-disable no-await-in-loop */
import { PrismaClient, Role, Severity, Likelihood, Status, ProjectStatus, Month } from '@prisma/client';
import { hash } from 'bcrypt';
import * as config from '../config/settings.development.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database');

  const password = await hash('changeme', 10);

  const usersMap: Record<string, number> = {};

  for (const account of config.defaultAccounts) {
    const role = (account.role as Role) || Role.VENDOR;
    console.log(`  Creating user: ${account.email} with role: ${role}`);

    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        email: account.email,
        password,
        firstName: account.firstName,
        lastName: account.lastName,
        role,
      },
    });

    usersMap[account.email] = user.id;
  }

  for (const project of config.defaultProjects) {
    console.log(`  Adding project: ${project.name}`);

    const pStatus = project.status as ProjectStatus;
    const creatorId = usersMap[project.creatorEmail];
    if (!creatorId) {
      throw new Error(`Creator with email ${project.creatorEmail} does not exist`);
    }

    const prismaProj = await prisma.project.upsert({
      where: { id: project.id },
      update: {},
      create: {
        name: project.name,
        description: project.description,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        originalContractAward: project.originalContractAward,
        status: pStatus,
        creatorId,
      },
    });

    for (const issue of project.issues) {
      const severity = issue.severity as Severity;
      const likelihood = issue.likelihood as Likelihood;
      const status = issue.status as Status;

      const issueCreatorId = usersMap[issue.creatorEmail];
      if (!issueCreatorId) throw new Error(`Issue creator ${issue.creatorEmail} does not exist`);

      await prisma.issue.upsert({
        where: { id: issue.id },
        update: {},
        create: {
          projectId: prismaProj.id,
          creatorId: issueCreatorId,
          title: issue.title,
          description: issue.description,
          remedy: issue.remedy,
          severity,
          likelihood,
          firstRaised: new Date(issue.firstRaised),
          updatedAt: new Date(issue.firstRaised),
          status,
        },
      });
    }

    for (const event of project.schedule) {
      await prisma.event.upsert({
        where: { id: event.id },
        update: {},
        create: {
          projectId: prismaProj.id,
          name: event.name,
          description: event.description,
          completed: event.completed,
          plannedStart: new Date(event.plannedStart),
          plannedEnd: new Date(event.plannedEnd),
          actualStart: event.actualStart ? new Date(event.actualStart) : undefined,
          actualEnd: event.actualEnd ? new Date(event.actualEnd) : undefined,
        },
      });
    }

    for (const comment of project.comments) {
      const authorId = usersMap[comment.authorEmail];
      if (!authorId) throw new Error(`Comment author ${comment.authorEmail} does not exist`);

      await prisma.comment.upsert({
        where: { id: comment.id },
        update: {},
        create: {
          projectId: prismaProj.id,
          authorId,
          content: comment.content,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.createdAt),
        },
      });
    }

    for (const report of project.reports) {
      const reporterId = usersMap[report.creatorEmail];
      if (!reporterId) throw new Error(`Comment author ${report.creatorEmail} does not exist`);
      const repStatus = report.status as ProjectStatus;
      const monthCreate = report.monthCreate as Month;

      await prisma.report.upsert({
        where: { id: report.id },
        update: {},
        create: {
          projectId: prismaProj.id,
          paidUpToNow: report.paidUpToNow,
          progress: report.progress,
          creatorId: reporterId,
          status: repStatus,
          yearCreate: report.yearCreate,
          monthCreate,
          updatedAt: new Date(report.updatedAt),
        },
      });
    }
  }
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
