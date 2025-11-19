import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Comment, Project } from '@prisma/client';
import { notFound } from 'next/navigation';
import CommentDetailView from '@/components/comment/CommentDetailView';

const CommentDetail = async ({
  params,
}: {
  params: { project: string | string[]; comment: string | string[] };
}) => {
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const projectId = Number(Array.isArray(params?.project) ? params?.project[0] : params?.project);
  const commentId = Number(Array.isArray(params?.comment) ? params?.comment[0] : params?.comment);

  const project: Project | null = await prisma.project.findUnique({
    where: { id: projectId },
  });

  const comment:
  (Comment & { author: { firstName: string; lastName: string } | null }) | null = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { author: true }, // include author so we can display their name
  });

  // Ensure project and author exist
  if (!project || !comment || !comment.author) notFound();

  return (
    <main>
      <CommentDetailView
        project={project}
        comment={comment as Comment & { author: { firstName: string; lastName: string } }}
      />
    </main>
  );
};

export default CommentDetail;
