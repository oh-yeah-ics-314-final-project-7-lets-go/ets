import { getServerSession } from 'next-auth';
import { Col, Container, Row, Table, Badge, Button } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import ProjectItem from '@/components/ProjectItem';
import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';

const ListPage = async () => {
  // Get session
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Fetch the user record from the database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Determine filter: admins see all, vendors see only their projects
  const projects = await prisma.project.findMany({
    where: user.role === 'ETS' ? {} : { creatorId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      creator: true,
      reports: {
        orderBy: [
          { yearCreate: 'desc' },
          { monthCreate: 'desc' },
        ],
        select: { progress: true, paidUpToNow: true },
        take: 1,
      },
    }, // optional: include creator info
  });

  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1>
                {user.role === 'ETS' ? 'All' : 'Your'}
                {' '}
                Projects
              </h1>
              <Badge bg="primary" className="fs-6">
                {projects.length}
                {' '}
                Report
                {projects.length === 1 ? '' : 's'}
              </Badge>
            </div>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Contract Award</th>
                  <th>Total Invoiced</th>
                  <th>Progress</th>
                  <th>Budget Status</th>
                  <th>Last Updated</th>
                  <th>Creator Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4 w-100">
                      <Container className="align-items-center d-flex gap-2 justify-content-center">
                        <span>No projects submitted yet.</span>
                        <Button
                          variant="primary"
                          href="/project/create"
                        >
                          Create Project
                        </Button>
                      </Container>
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      {...project}
                      report={project.reports[0] ?? { paidUpToNow: 0, progress: 0 }}
                      creatorEmail={project.creator.email}
                    />
                  ))
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ListPage;
