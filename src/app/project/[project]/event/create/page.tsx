import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { Project } from '@prisma/client';
import { notFound } from 'next/navigation';
import AddEventForm from '@/components/event/AddEventForm';

const AddEvent = async ({ params }: { params: { project: string | string[] } }) => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
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

  return (
    <main>
      <AddEventForm project={project} />
    </main>
  );
};

export default AddEvent;
