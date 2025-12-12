import { getServerSession, NextAuthOptions } from 'next-auth';
import { notFound } from 'next/navigation';
import { Project, Role } from '@prisma/client';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import EditProjectForm from '@/components/project/EditProjectForm';
import { SessionWithRole } from '@/lib/dbActions';
import { Container } from 'react-bootstrap';

export default async function EditProjectPage({ params }: { params: { project: string | string[] } }) {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession<NextAuthOptions, SessionWithRole>(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
      // eslint-disable-next-line @typescript-eslint/comma-dangle
    } | null,
  );
  const id = Number(Array.isArray(params?.project) ? params?.project[0] : params?.project);
  // console.log(id);
  const project: Project | null = await prisma.project.findUnique({
    where: { id },
  });
  // console.log(project);
  if (!project) {
    return notFound();
  }

  if (session?.user?.randomKey !== Role.VENDOR || session.user.id !== project.creatorId.toString()) {
    return (
      <Container className="my-auto">
        <h2 className="text-center">You do not have permission to edit this project</h2>
      </Container>
    );
  }

  return (
    <main>
      <EditProjectForm project={project} />
    </main>
  );
}
