import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Event, Project } from '@prisma/client';
import { notFound } from 'next/navigation';
import EditEventForm from '@/components/event/EditEventForm';

const EditEvent = async ({ params }: { params: { project: string | string[]; event: string | string[] } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
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

  return (
    <main>
      <EditEventForm project={project} event={event} />
    </main>
  );
};

export default EditEvent;
