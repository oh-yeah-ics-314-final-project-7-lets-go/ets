import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Issue, Project } from '@prisma/client';
import { notFound } from 'next/navigation';
import EditIssueForm from '@/components/issue/EditIssueForm';

const EditIssue = async ({ params }: { params: { project: string | string[]; issue: string | string[] } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
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

  return (
    <main>
      <EditIssueForm project={project} issue={issue} />
    </main>
  );
};

export default EditIssue;
