'use client';

import { Issue, Project } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { deleteIssue } from '@/lib/dbActions';

interface IssueDetailViewProps {
  issue: Issue;
  project: Project;
}

const IssueDetailView = ({ issue, project }: IssueDetailViewProps) => {
  const router = useRouter();

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatDateShort = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDeleteSubmit = async () => {
    await deleteIssue(issue.id);
  };

  const handleEdit = () => {
    router.push(`/project/${project.id}/issue/${issue.id}/edit`);
  };

  const handleBackToProject = () => {
    router.push(`/project/${project.id}`);
  };

  const getStatusBadge = () => {
    switch (issue.status) {
      case 'CLOSED':
        return <span className="badge bg-success">Closed</span>;
      case 'OPEN':
        return <span className="badge bg-warning">Open</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getSeverityBadge = () => {
    switch (issue.severity) {
      case 'HIGH':
        return <span className="badge bg-danger">High</span>;
      case 'MEDIUM':
        return <span className="badge bg-warning">Medium</span>;
      case 'LOW':
        return <span className="badge bg-success">Low</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getLikelihoodBadge = () => {
    switch (issue.likelihood) {
      case 'HIGH':
        return <span className="badge bg-danger">High</span>;
      case 'MEDIUM':
        return <span className="badge bg-warning">Medium</span>;
      case 'LOW':
        return <span className="badge bg-success">Low</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={handleBackToProject}
                >
                  {project.name}
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Issue #
                {issue.id}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Issue Details Card */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">
                  Issue #
                  {issue.id}
                </h4>
                <div className="mt-2">
                  {getStatusBadge()}
                  {' '}
                  {getSeverityBadge()}
                  {' '}
                  {getLikelihoodBadge()}
                </div>
              </div>
              <div className="btn-group">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleEdit}
                >
                  <i className="bi bi-pencil" />
                  {' '}
                  Edit
                </button>
                <form action={handleDeleteSubmit} className="d-inline">
                  <button
                    type="submit"
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      // eslint-disable-next-line no-restricted-globals, no-alert
                      if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <i className="bi bi-trash" />
                    {' '}
                    Delete
                  </button>
                </form>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 mb-4">
                  <h6 className="text-muted">Description</h6>
                  <p className="mb-0">{issue.description}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-4">
                  <h6 className="text-muted">Remedy</h6>
                  <p className="mb-0">{issue.remedy}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted">First Raised</h6>
                  <p className="mb-0">{formatDate(issue.firstRaised)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted">Last Updated</h6>
                  <p className="mb-0">{formatDate(issue.updatedAt)}</p>
                </div>
              </div>

              {issue.status === 'CLOSED' && (
                <div className="alert alert-success mt-3">
                  <i className="bi bi-check-circle" />
                  {' '}
                  This issue has been resolved.
                  <div className="mt-1 small">
                    Closed on
                    {' '}
                    {formatDateShort(issue.updatedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar with additional info */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Issue Information</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">Project</small>
                <div>{project.name}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Status</small>
                <div>{getStatusBadge()}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Severity</small>
                <div>{getSeverityBadge()}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Likelihood</small>
                <div>{getLikelihoodBadge()}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Days Open</small>
                <div>
                  {Math.ceil(
                    (new Date().getTime() - new Date(issue.firstRaised).getTime())
                    / (1000 * 60 * 60 * 24),
                  )}
                  {' '}
                  days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default IssueDetailView;
