import { getServerSession, NextAuthOptions } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Event, Project, Role } from '@prisma/client';
import { notFound } from 'next/navigation';
import EditEventForm from '@/components/event/EditEventForm';
import { SessionWithRole } from '@/lib/dbActions';
import { Container } from 'react-bootstrap';

const EditEvent = async ({ params }: { params: { project: string | string[]; event: string | string[] } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession<NextAuthOptions, SessionWithRole>(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const projectId = Number(Array.isArray(params?.project) ? params?.project[0] : params?.project);
  const eventId = Number(Array.isArray(params?.event) ? params?.event[0] : params?.event);
  // console.log(id);
  const project: Project | null = await prisma.project.findUnique({
    where: { id: projectId },
  });

  const event: Event | null = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!project || !event) notFound();

  if (session?.user?.randomKey !== Role.VENDOR || session.user.id !== project.creatorId.toString()) {
    return (
      <Container className="my-auto">
        <h2 className="text-center">You do not have permission to edit events</h2>
      </Container>
    );
  }

  return (
    <main>
      <EditEventForm project={project} event={event} />
    </main>
  );
};

export default EditEvent;
