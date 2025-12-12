import AddReportForm from '@/components/report/AddReportForm';
import authOptions from '@/lib/authOptions';
import { SessionWithRole } from '@/lib/dbActions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Project, Role } from '@prisma/client';
import { getServerSession, NextAuthOptions } from 'next-auth';
import { notFound } from 'next/navigation';
import { Container } from 'react-bootstrap';

const CreateReportPage = async ({ params }: { params: { project: string | string[]; } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession<NextAuthOptions, SessionWithRole>(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const projectId = Number(Array.isArray(params?.project) ? params?.project[0] : params?.project);
  // console.log(id);
  const project: Project | null = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) notFound();

  if (session?.user?.randomKey !== Role.VENDOR || session.user.id !== project.creatorId.toString()) {
    return (
      <Container className="my-auto">
        <h2 className="text-center">You do not have permission to create reports</h2>
      </Container>
    );
  }

  return (
    <main>
      <AddReportForm project={project} />
    </main>
  );
};

export default CreateReportPage;
