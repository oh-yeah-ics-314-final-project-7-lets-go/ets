import { getServerSession, NextAuthOptions } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import AddProjectForm from '@/components/project/AddProjectForm';
import { SessionWithRole } from '@/lib/dbActions';
import { Role } from '@prisma/client';
import { Container } from 'react-bootstrap';

const AddProject = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession<NextAuthOptions, SessionWithRole>(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  if (session?.user?.randomKey !== Role.VENDOR) {
    return (
      <Container className="my-auto">
        <h2 className="text-center">You do not have permission to create projects</h2>
      </Container>
    );
  }

  return (
    <main>
      <AddProjectForm />
    </main>
  );
};

export default AddProject;
