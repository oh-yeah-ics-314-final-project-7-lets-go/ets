import { getServerSession } from 'next-auth';
import { Col, Container, Row, Table } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { adminProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import { deleteUser } from '@/lib/dbActions';

const AdminPage = async () => {
  const session = await getServerSession(authOptions);

  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const users = await prisma.user.findMany({});

  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Row>
          <Col>
            <h1>Admin User Control</h1>

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users
                  .filter((user) => user.id !== 0) // <-- hide the system user
                  .map((user) => (
                    <tr key={user.id}>
                      <td>{`${user.lastName}, ${user.firstName}`}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>

                      <td>
                        <div className="d-flex gap-1">
                          {/* Edit button */}
                          {(session?.user?.email === user.email || user.role !== 'ETS') && (
                            <a
                              href={`/admin/edit-user/${user.id}`}
                              className="btn btn-secondary btn-sm"
                            >
                              Edit
                            </a>
                          )}

                          {/* Delete button (only non-admin users) */}
                          {user.role !== 'ETS' && session?.user?.email !== user.email && (
                            <form
                              action={async () => {
                                'use server';

                                await deleteUser(user.id);
                              }}
                            >
                              <button type="submit" className="btn btn-danger btn-sm">
                                Delete
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default AdminPage;
