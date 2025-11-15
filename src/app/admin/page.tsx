import { getServerSession } from 'next-auth';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { adminProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import { PersonFillAdd, PersonFillGear } from 'react-bootstrap-icons';
import ResetPasswordForm from '@/components/admin/ResetPasswordForm';
import DeleteUserForm from '@/components/admin/DeleteUserForm';

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
            <Container fluid className="d-flex align-items-center pb-3">
              <h1>Admin User Control</h1>
              <Button variant="success" className="ms-auto h-50" href="/auth/create">
                <PersonFillAdd />
                {' '}
                Create User
              </Button>
            </Container>
            <Table striped bordered hover className="mx-auto">
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
                        <div className="d-flex w-auto gap-1">
                          {/* Edit button */}
                          {(session?.user?.email === user.email || user.role !== 'ETS') && (
                            <Button
                              variant="secondary"
                              size="sm"
                              href={`/admin/edit-user/${user.id}`}
                            >
                              <PersonFillGear />
                              {' '}
                              Edit
                            </Button>
                          )}
                          {user.role !== 'ETS' && <ResetPasswordForm id={user.id} />}

                          {/* Delete button (only non-admin users) */}
                          {user.role !== 'ETS'
                          && session?.user?.email !== user.email
                          && <DeleteUserForm id={user.id} />}
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
