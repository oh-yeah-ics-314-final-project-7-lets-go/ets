import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import AddIssueForm from '@/components/issue/AddIssueForm';
import { prisma } from '@/lib/prisma';
import { Project, ProjectStatus } from '@prisma/client';
import { notFound } from 'next/navigation';
import { Container, Card, CardHeader, CardBody } from 'react-bootstrap';

const AddIssue = async ({ params }: { params: { project: string | string[] } }) => {
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
  const { status } = project;

  return (
    <main>
      {status !== ProjectStatus.APPROVED ? <AddIssueForm project={project} /> : (
        <Container fluid>
          <Card className="w-50 mx-auto mt-5">
            <CardHeader>
              This project is approved.
            </CardHeader>
            <CardBody>
              Issues cannot be created. Ask an admin for more information.
            </CardBody>
          </Card>
        </Container>
      )}
    </main>
  );
};

export default AddIssue;
