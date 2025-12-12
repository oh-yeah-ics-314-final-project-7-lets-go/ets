import { getServerSession, NextAuthOptions } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Issue, Project, Role } from '@prisma/client';
import { notFound } from 'next/navigation';
import EditIssueForm from '@/components/issue/EditIssueForm';
import { Container } from 'react-bootstrap';
import { SessionWithRole } from '@/lib/dbActions';

const EditIssue = async ({ params }: { params: { project: string | string[]; issue: string | string[] } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession<NextAuthOptions, SessionWithRole>(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const projectId = Number(Array.isArray(params?.project) ? params?.project[0] : params?.project);
  const issueId = Number(Array.isArray(params?.issue) ? params?.issue[0] : params?.issue);
  // console.log(id);
  const project: Project | null = await prisma.project.findUnique({
    where: { id: projectId },
  });

  const issue: Issue | null = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!project || !issue) notFound();

  if (session?.user?.randomKey !== Role.VENDOR || session.user.id !== project.creatorId.toString()) {
    return (
      <Container className="my-auto">
        <h2 className="text-center">You do not have permission to edit this issue</h2>
      </Container>
    );
  }

  return (
    <main>
      <EditIssueForm project={project} issue={issue} />
    </main>
  );
};

export default EditIssue;
