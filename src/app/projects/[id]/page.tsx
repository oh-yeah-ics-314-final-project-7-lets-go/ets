'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EventTimeline from '@/components/EventTimeline';

interface ProjectOverviewPageProps {
  params: {
    id: string;
  };
}

const ProjectOverviewPage = ({ params }: ProjectOverviewPageProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = params.id;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchProject();
    }
  }, [status, projectId, router]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Project not found');
        } else {
          setError('Failed to load project');
        }
        return;
      }

      const projectData = await response.json();
      setProject(projectData);
    } catch (err) {
      setError('Failed to load project');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container py-3">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading project...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error || !project) {
    return (
      <div className="container py-3">
        <div className="text-center">
          <h3>Project Not Found</h3>
          <p className="text-muted">{error || 'The requested project could not be found.'}</p>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/list')}
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <main>
      <div className="container py-3">
        <h1>{project.name} - Overview</h1>
        
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
                      <td>${project.originalContractAward?.toLocaleString()}</td>
                      <td>${project.totalPaidOut?.toLocaleString()}</td>
                      <td>{project.progress?.toFixed(1)}%</td>
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
                <EventTimeline events={project.schedule || []} issues={project.issues || []} projectId={projectId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProjectOverviewPage;