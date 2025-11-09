import { getServerSession } from 'next-auth';
import { Col, Container, Row, Table, Badge } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import ProjectItem from '@/components/ProjectItem';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';

/** Render a list of IV&V project reports. */
const ListPage = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
      // eslint-disable-next-line @typescript-eslint/comma-dangle
    } | null,
  );

  const projects = await prisma.project.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
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
                Reports
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
                    <ProjectItem key={project.id} {...project} />
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
