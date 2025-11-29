import AddReportForm from '@/components/report/AddReportForm';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Project } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

const CreateReportPage = async ({ params }: { params: { project: string | string[]; } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
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

  return (
    <main>
      <AddReportForm projectId={project.id} />
    </main>
  );
};

export default CreateReportPage;
