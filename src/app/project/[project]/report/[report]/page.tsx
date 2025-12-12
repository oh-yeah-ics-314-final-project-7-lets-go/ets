import Banner from '@/components/Banner';
import ApproveReportBtn from '@/components/report/ApproveReportBtn';
import DenyReportBtn from '@/components/report/DenyReportBtn';
import PendingReportBtn from '@/components/report/PendingReportBtn';
import ReportPage from '@/components/report/ReportPage';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Project, ProjectStatus, Report } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { Container } from 'react-bootstrap';

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

  let statusBanner = null;

  const isApproved = report.status === ProjectStatus.APPROVED;
  const isETS = (session?.user as { randomKey: string; }).randomKey === 'ETS';

  if (report.status === ProjectStatus.PENDING) {
    if (isETS) {
      statusBanner = (
        <Banner className="mt-3 border-start-0 border-end-0" variant="warning" dismissible={false}>
          This report is being revised and is pending approval.
          <br />
          <ApproveReportBtn report={report} id={report.id} />
          <DenyReportBtn report={report} id={report.id} />
        </Banner>
      );
    } else {
      statusBanner = (
        <Banner className="mt-3 border-start-0 border-end-0" variant="warning">
          This report is in a provisional state
        </Banner>
      );
    }
  } else if (report.status === ProjectStatus.DENIED) {
    if (isETS) {
      statusBanner = (
        <Banner className="mt-3 border-start-0 border-end-0" variant="danger">
          This report was rejected.
          <br />
          <PendingReportBtn report={report} id={report.id} isETS={isETS} />
        </Banner>
      );
    } else {
      statusBanner = (
        <Banner className="mt-3 border-start-0 border-end-0" variant="danger">
          This report was rejected. Please see the comments for more information.
          <br />
          <PendingReportBtn report={report} id={report.id} isETS={isETS} />
        </Banner>
      );
    }
  }

  return (
    <main>
      {statusBanner}
      <ReportPage report={report} project={project} />
      {isETS && isApproved && (
        <Container className="text-center mt-3">
          <PendingReportBtn report={report} id={report.id} isETS={isETS} />
        </Container>
      )}
    </main>
  );
};

export default EditReportPage;
