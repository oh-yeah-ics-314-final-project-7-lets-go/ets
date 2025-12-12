import { getServerSession, NextAuthOptions } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Project, ProjectStatus, Role } from '@prisma/client';
import { notFound } from 'next/navigation';
import AddEventForm from '@/components/event/AddEventForm';
import { Container, Card, CardHeader, CardBody } from 'react-bootstrap';
import { SessionWithRole } from '@/lib/dbActions';

const AddEvent = async ({ params }: { params: { project: string | string[] } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession<NextAuthOptions, SessionWithRole>(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const id = Number(Array.isArray(params?.project) ? params?.project[0] : params?.project);
  // console.log(id);
  const project: Project | null = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) notFound();
  const { status } = project;
  if (session?.user?.randomKey !== Role.VENDOR || session.user.id !== project.creatorId.toString()) {
    return (
      <Container className="my-auto">
        <h2 className="text-center">You do not have permission to create events</h2>
      </Container>
    );
  }

  return (
    <main>
      {status !== ProjectStatus.APPROVED ? <AddEventForm project={project} /> : (
        <Container fluid>
          <Card className="w-50 mx-auto mt-5">
            <CardHeader>
              This project is approved.
            </CardHeader>
            <CardBody>
              Events cannot be created. Ask an admin for more information.
            </CardBody>
          </Card>
        </Container>
      )}
    </main>
  );
};

export default AddEvent;
