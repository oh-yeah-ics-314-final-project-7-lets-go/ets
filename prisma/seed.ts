import { PrismaClient, Role, Severity, Likelihood, Status } from '@prisma/client';
import { hash } from 'bcrypt';
import * as config from '../config/settings.development.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database');
  const password = await hash('changeme', 10);
  config.defaultAccounts.forEach(async (account) => {
    const role = account.role as Role || Role.VENDOR;
    console.log(`  Creating user: ${account.email} with role: ${role}`);
    await prisma.user.upsert({
      where: { id: account.id },
      update: {},
      create: {
        email: account.email,
        password,
        firstName: account.firstName,
        lastName: account.lastName,
        role,
      },
    });
    // console.log(`  Created user: ${user.email} with role: ${user.role}`);
  });

  for (const project of config.defaultProjects) {
    console.log(`  Adding project, comments, issues and events: ${JSON.stringify(project)}`);
    // eslint-disable-next-line no-await-in-loop
    const prismaProj = await prisma.project.upsert({
      where: { id: project.id },
      update: {},
      create: {
        name: project.name,
        firstRaised: new Date(project.firstRaised),
        originalContractAward: project.originalContractAward,
        totalPaidOut: project.totalPaidOut,
        progress: project.progress,
        creatorId: project.creatorId,
      },
    });

    for (const issue of project.issues) {
      const severity = issue.severity as Severity;
      const likelihood = issue.likelihood as Likelihood;
      const status = issue.status as Status;

      // eslint-disable-next-line no-await-in-loop
      await prisma.issue.upsert({
        where: { id: issue.id },
        update: {},
        create: {
          projectId: prismaProj.id,
          creatorId: issue.creatorId,
          description: issue.description,
          remedy: issue.remedy,
          severity,
          likelihood,
          firstRaised: new Date(issue.firstRaised),
          status,
        },
      });
    }

    for (const event of project.schedule) {
      // eslint-disable-next-line no-await-in-loop
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
      // eslint-disable-next-line no-await-in-loop
      await prisma.comment.upsert({
        where: { id: comment.id },
        update: {},
        create: {
          projectId: prismaProj.id,
          authorId: comment.authorId,
          content: comment.content,
          createdAt: new Date(comment.createdAt),
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
