import EditReportForm from '@/components/report/EditReportForm';
import authOptions from '@/lib/authOptions';
import { SessionWithRole } from '@/lib/dbActions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Project, Report, ProjectStatus, Role } from '@prisma/client';
import { getServerSession, NextAuthOptions } from 'next-auth';
import { notFound } from 'next/navigation';
import { Container, Card, CardHeader, CardBody } from 'react-bootstrap';

const EditReportPage = async ({ params }: { params: { project: string | string[]; report: string | string[] } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession<NextAuthOptions, SessionWithRole>(authOptions);
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
  const { status } = project;

  if (session?.user?.randomKey !== Role.VENDOR || session.user.id !== project.creatorId.toString()) {
    return (
      <Container className="my-auto">
        <h2 className="text-center">You do not have permission to edit this report</h2>
      </Container>
    );
  }

  return (
    <main>
      {status !== ProjectStatus.APPROVED ? (
        <EditReportForm project={project} report={report} />
      ) : (
        <Container fluid>
          <Card className="w-50 mx-auto mt-5">
            <CardHeader>
              This project is currently approved
            </CardHeader>
            <CardBody>
              Reports cannot be edited.
            </CardBody>
          </Card>
        </Container>
      )}
    </main>
  );
};

export default EditReportPage;
