import { Container } from 'react-bootstrap';
import Dashboard from '@/components/dashboard/Dashboard';
import { getServerSession } from 'next-auth';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';
import { Project, Report } from '@prisma/client';
import { notFound } from 'next/navigation';
import { reportName } from '@/lib/util';

type ReportWithProject = Report & { project: Project; };

/** Render a list of stuff for the logged in user. */
const DashboardPage = async ({ params }: { params: { report: string | string[] } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const reportId = Number(Array.isArray(params?.report) ? params?.report[0] : params?.report);

  const report: ReportWithProject | null = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      project: true,
    },
  });

  if (!report) notFound();

  return (
    <main>
      <Container id="list" fluid className="py-3">
        {reportName(report)}
        <Dashboard />
      </Container>
    </main>
  );
};

export default DashboardPage;
