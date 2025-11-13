import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EventTimeline from '@/components/EventTimeline';

interface ProjectOverviewPageProps {
  params: {
    id: string;
  };
}

const ProjectOverviewPage = async ({ params }: ProjectOverviewPageProps) => {
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const projectId = parseInt(params.id, 10);

  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      issues: {
        orderBy: { firstRaised: 'desc' },
      },
      schedule: {
        orderBy: { plannedStart: 'asc' },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <main>
      <div className="container py-3">
        <h1>
          {project.name}
          {' '}
          - Overview
        </h1>

        <div className="row mt-4">
          <div className="col">
            <div className="card">
              <div className="card-header">
                <h3>Project Details</h3>
              </div>
              <div className="card-body">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Contract Award</th>
                      <th>Total Paid Out</th>
                      <th>Progress</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>{project.name}</strong></td>
                      <td>
                        $
                        {project.originalContractAward?.toLocaleString()}
                      </td>
                      <td>
                        $
                        {project.totalPaidOut?.toLocaleString()}
                      </td>
                      <td>
                        {project.progress?.toFixed(1)}
                        %
                      </td>
                      <td>{new Date(project.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Events Timeline</h3>
                <div className="d-flex gap-2">
                  <a
                    href={`/project/${projectId}/event/create`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Add Event
                  </a>
                </div>
              </div>
              <div className="card-body">
                <EventTimeline
                  events={project.schedule || []}
                  issues={project.issues || []}
                  projectId={projectId.toString()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProjectOverviewPage;
