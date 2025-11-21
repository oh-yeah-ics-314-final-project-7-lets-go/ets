import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Project, Report } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

const EditReportPage = async ({ params }: { params: { project: string | string[]; report: string | string[] } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const projectId = Number(Array.isArray(params?.project) ? params?.project[0] : params?.project);
  const reportId = Number(Array.isArray(params?.report) ? params?.report[0] : params?.report);
  // console.log(id);
  const project: Project | null = await prisma.project.findUnique({
    where: { id: projectId },
  });

  const report: Report | null = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!project || !report) notFound();

  return (
    <main>
      report view page
    </main>
  );
};

export default EditReportPage;
