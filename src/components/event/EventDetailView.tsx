'use client';

import { Event, Project } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { deleteEvent } from '@/lib/dbActions';

interface EventDetailViewProps {
  event: Event;
  project: Project;
}

const EventDetailView = ({ event, project }: EventDetailViewProps) => {
  const router = useRouter();

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteSubmit = async () => {
    await deleteEvent(event.id);
  };

  const handleEdit = () => {
    router.push(`/project/${project.id}/event/${event.id}/edit`);
  };

  const handleBackToProject = () => {
    router.push(`/project/${project.id}`);
  };

  const getStatusBadge = () => {
    if (event.completed) {
      return <span className="badge bg-success">Completed</span>;
    }
    
    const now = new Date();
    const startDate = new Date(event.plannedStart);
    const endDate = new Date(event.plannedEnd);
    
    if (now < startDate) {
      return <span className="badge bg-secondary">Upcoming</span>;
    } else if (now >= startDate && now <= endDate) {
      return <span className="badge bg-primary">In Progress</span>;
    } else {
      return <span className="badge bg-warning">Overdue</span>;
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
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={handleBackToProject}
                >
                  {project.name}
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {event.name}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Event Details Card */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{event.name}</h4>
                <div className="mt-2">
                  {getStatusBadge()}
                </div>
              </div>
              <div className="btn-group">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleEdit}
                >
                  <i className="bi bi-pencil"></i> Edit
                </button>
                <form action={handleDeleteSubmit} className="d-inline">
                  <button 
                    type="submit"
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <i className="bi bi-trash"></i> Delete
                  </button>
                </form>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 mb-4">
                  <h6 className="text-muted">Description</h6>
                  <p className="mb-0">{event.description}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted">Planned Timeline</h6>
                  <div className="d-flex flex-column">
                    <div className="mb-2">
                      <strong>Start:</strong> {formatDate(event.plannedStart)}
                    </div>
                    <div>
                      <strong>End:</strong> {formatDate(event.plannedEnd)}
                    </div>
                  </div>
                </div>

                {(event.actualStart || event.actualEnd) && (
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Actual Timeline</h6>
                    <div className="d-flex flex-column">
                      {event.actualStart && (
                        <div className="mb-2">
                          <strong>Start:</strong> {formatDate(event.actualStart)}
                        </div>
                      )}
                      {event.actualEnd && (
                        <div>
                          <strong>End:</strong> {formatDate(event.actualEnd)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {event.completed && (
                <div className="alert alert-success mt-3">
                  <i className="bi bi-check-circle"></i> This event has been completed.
                  {event.actualEnd && (
                    <div className="mt-1 small">
                      Completed on {formatDateShort(event.actualEnd)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar with additional info */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Event Information</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">Project</small>
                <div>{project.name}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Duration</small>
                <div>
                  {Math.ceil(
                    (new Date(event.plannedEnd).getTime() - new Date(event.plannedStart).getTime()) 
                    / (1000 * 60 * 60 * 24)
                  )} days
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Status</small>
                <div>{getStatusBadge()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EventDetailView;