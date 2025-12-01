import { Container } from 'react-bootstrap';
import Dashboard from '@/components/dashboard/Dashboard';
import { prisma } from '@/lib/prisma';
import { Project, Report } from '@prisma/client';
import { notFound } from 'next/navigation';
import { reportName } from '@/lib/util';

type ReportWithProject = Report & { project: Project; };

/** Render a list of stuff for the logged in user. */
const DashboardPage = async ({ params }: { params: { report: string | string[] } }) => {
  const reportId = Number(Array.isArray(params?.report) ? params?.report[0] : params?.report);

  const report: ReportWithProject | null = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      project: {
        include: {
          issues: {
            orderBy: { firstRaised: 'desc' },
          },
          schedule: {
            orderBy: { plannedStart: 'asc' },
          },
          comments: {
            orderBy: { updatedAt: 'desc' },
            include: {
              author: true,
            },
          },
          creator: true,
          reports: {
            orderBy: [
              { yearCreate: 'desc' },
              { monthCreate: 'desc' },
            ],
          },
        },
      },
    },
  });

  if (!report) notFound();

  return (
    <main>
      <Container id="list" fluid className="py-3">
        {reportName(report)}
        <Dashboard report={report} />
      </Container>
    </main>
  );
};

export default DashboardPage;
