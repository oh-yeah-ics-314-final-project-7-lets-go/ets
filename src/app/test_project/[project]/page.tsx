import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { Event, Issue, Project } from '@prisma/client';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import ProjectPage from '@/components/project/ProjectPage';

export default async function ViewProjectPage({ params }: { params: { project: string | string[] } }) {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
      // eslint-disable-next-line @typescript-eslint/comma-dangle
    } | null,
  );
  const id = Number(Array.isArray(params?.project) ? params?.project[0] : params?.project);
  if (!id) {
    return notFound();
  }
  const project: Project | null = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    return notFound();
  }

  const issues: Issue[] = await prisma.issue.findMany({
    where: { projectId: id },
  });

  const events: Event[] = await prisma.event.findMany({
    where: { projectId: id },
  });

  const comments = await prisma.comment.findMany({
    where: { projectId: id },
    include: {
      author: true,
    },
  });

  return (
    <main>
      <ProjectPage {...project} issues={issues} events={events} comments={comments} />
    </main>
  );
}
