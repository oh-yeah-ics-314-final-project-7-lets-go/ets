import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EventTimeline from '@/components/EventTimeline';
import IssueTable from '@/components/IssueTable';
import EventTable from '@/components/EventTable';
import CommentTable from '@/components/CommentTable';
import { Card, CardBody, CardHeader, Col, Container, Row, Table } from 'react-bootstrap';
import StatusTooltip from '@/components/StatusTooltip';
import Banner from '@/components/Banner';
import { ProjectStatus } from '@prisma/client';
import ApproveProjectBtn from '@/components/project/ApproveProjectBtn';
import DenyProjectBtn from '@/components/project/DenyProjectBtn';
import PendingProjectBtn from '@/components/project/PendingProjectBtn';
import ReportsList from '@/components/project/ReportsList';

interface ProjectOverviewPageProps {
  params: {
    project: string;
  };
}

const ProjectOverviewPage = async ({ params }: ProjectOverviewPageProps) => {
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const projectId = parseInt(params.project, 10);

  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
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
  });

  if (!project) {
    notFound();
  }

  const isApproved = project.status === ProjectStatus.APPROVED;
  const isETS = (session?.user as { randomKey: string; }).randomKey === 'ETS';

  let statusBanner = null;
  const userId = parseInt((session?.user as { id: string; }).id ?? '0', 10) ?? 0;
  if (project.status === ProjectStatus.PENDING) {
    if (isETS) {
      statusBanner = (
        <Banner className="mt-3" variant="warning" dismissible={false}>
          This project is in a provisional state and is pending approval.
          {' '}
          <i>
            Submitted by
            {' '}
            {project.creator.firstName}
            {' '}
            {project.creator.lastName}
            {' '}
            (
            {project.creator.email}
            )
          </i>
          <br />
          <ApproveProjectBtn author={userId} id={project.id} />
          <DenyProjectBtn author={userId} id={project.id} />
        </Banner>
      );
    } else {
      statusBanner = (
        <Banner className="mt-3" variant="warning">
          This project is in a provisional state
        </Banner>
      );
    }
  } else if (project.status === ProjectStatus.DENIED) {
    if (isETS) {
      statusBanner = (
        <Banner className="mt-3" variant="danger">
          This project was rejected.
          <br />
          <PendingProjectBtn author={userId} id={project.id} isETS={isETS} />
        </Banner>
      );
    } else {
      statusBanner = (
        <Banner className="mt-3" variant="danger">
          This project was rejected. Please see the comments for more information.
          <br />
          <PendingProjectBtn author={userId} id={project.id} isETS={isETS} />
        </Banner>
      );
    }
  }

  return (
    <main>
      {statusBanner}
      <Container className="py-3">
        <h1 className="align-items-center d-flex">
          <StatusTooltip status={project.status} type="project" />
          {project.name}
          {' '}
          Overview
        </h1>
        <Row className="mt-4">
          <Col>
            <Card>
              <CardHeader>
                <h3 className="mb-0">Project Details</h3>
              </CardHeader>
              <CardBody>
                <Table striped>
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Contract Award</th>
                      <th>Total Paid Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>{project.name}</strong></td>
                      <td>
                        $
                        {project.originalContractAward?.toLocaleString()}
                      </td>
                      <td>{new Date(project.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <ReportsList
          reports={project.reports || []}
          projectId={projectId.toString()}
        />
        <Row className="mt-4">
          <Col>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Events Timeline</h3>
              </CardHeader>
              <CardBody>
                <EventTimeline
                  events={project.schedule || []}
                  issues={project.issues || []}
                  projectId={projectId.toString()}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <IssueTable isApproved={isApproved} projectId={projectId.toString()} issues={project.issues || []} />
        <EventTable isApproved={isApproved} projectId={projectId.toString()} events={project.schedule || []} />
        <CommentTable project={project} comments={project.comments || []} />
        {isETS && isApproved && (
        <Container className="text-center mt-3">
          <PendingProjectBtn author={userId} id={project.id} isETS={isETS} />
        </Container>
        )}
      </Container>
    </main>
  );
};

export default ProjectOverviewPage;
