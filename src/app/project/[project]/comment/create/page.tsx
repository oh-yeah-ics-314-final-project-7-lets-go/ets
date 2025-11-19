import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AddCommentForm from '@/components/comment/AddCommentForm';

const AddComment = async ({ params }: { params: { project: string | string[] } }) => {
  // Protect the page — only logged-in users allowed
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  // Extract projectId from route
  const projectId = Number(
    Array.isArray(params?.project) ? params.project[0] : params.project,
  );

  // Ensure project exists before commenting
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) notFound();

  return (
    <main>
      <AddCommentForm project={project} />
    </main>
  );
};

export default AddComment;
