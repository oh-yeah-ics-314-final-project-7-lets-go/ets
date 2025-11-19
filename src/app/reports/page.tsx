import { getServerSession } from 'next-auth';
import { Col, Container, Row, Table, Badge } from 'react-bootstrap';
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
    include: { creator: true }, // optional: include creator info
  });

  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1>IV&V Project Reports</h1>
              <Badge bg="primary" className="fs-6">
                {projects.length}
                {' '}
                Report
                {projects.length === 1 ? '' : 's'}
              </Badge>
            </div>
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Project Name</th>
                  <th>Contract Award</th>
                  <th>Total Paid Out</th>
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
                    <td colSpan={7} className="text-center text-muted py-4">
                      No project reports submitted yet.
                      <a href="/add" className="text-decoration-none ms-1">Submit Report</a>
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <ProjectItem key={project.id} {...project} creatorEmail={project.creator.email} />
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
