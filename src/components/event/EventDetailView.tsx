'use client';

import { Event, Project } from '@prisma/client';
import { deleteEvent } from '@/lib/dbActions';
import {
  Container,
  Row,
  Col, Breadcrumb, BreadcrumbItem, Card, CardHeader, CardBody, Button, ButtonGroup, Alert } from 'react-bootstrap';
import { CheckCircle, Pencil, Trash } from 'react-bootstrap-icons';
import Link from 'next/link';
import { formatDate, formatDateShort } from '@/lib/util';

interface EventDetailViewProps {
  event: Event;
  project: Project;
}

const EventDetailView = ({ event, project }: EventDetailViewProps) => {
  const handleDeleteSubmit = async () => {
    await deleteEvent(event.id);
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
    } if (now >= startDate && now <= endDate) {
      return <span className="badge bg-primary">In Progress</span>;
    }
    return <span className="badge bg-warning">Overdue</span>;
  };

  return (
    <Container className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Breadcrumb>
            <BreadcrumbItem href={`/project/${project.id}`}>
              {project.name}
            </BreadcrumbItem>
            <BreadcrumbItem active aria-current="page">
              {event.name}
            </BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>

      {/* Event Details Card */}
      <Row>
        <Col lg={8}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{event.name}</h4>
                <div className="mt-2">
                  {getStatusBadge()}
                </div>
              </div>
              <ButtonGroup className="gap-1">
                <Link href={`/project/${project.id}/event/${event.id}/edit`}>
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                  >
                    <Pencil />
                    {' '}
                    Edit
                  </Button>
                </Link>
                <form action={handleDeleteSubmit} className="d-inline">
                  <Button
                    variant="danger"
                    size="sm"
                    type="submit"
                    onClick={(e) => {
                      // eslint-disable-next-line no-restricted-globals, no-alert
                      if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Trash />
                    {' '}
                    Delete
                  </Button>
                </form>
              </ButtonGroup>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={12} className="mb-4">
                  <h6 className="text-muted">Description</h6>
                  <p className="mb-0">{event.description}</p>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">Planned Timeline</h6>
                  <div className="d-flex flex-column">
                    <div className="mb-2">
                      <strong>Start:</strong>
                      {' '}
                      {formatDate(event.plannedStart)}
                    </div>
                    <div>
                      <strong>End:</strong>
                      {' '}
                      {formatDate(event.plannedEnd)}
                    </div>
                  </div>
                </Col>

                {(event.actualStart || event.actualEnd) && (
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Actual Timeline</h6>
                    <div className="d-flex flex-column">
                      {event.actualStart && (
                        <div className="mb-2">
                          <strong>Start:</strong>
                          {' '}
                          {formatDate(event.actualStart)}
                        </div>
                      )}
                      {event.actualEnd && (
                        <div>
                          <strong>End:</strong>
                          {' '}
                          {formatDate(event.actualEnd)}
                        </div>
                      )}
                    </div>
                  </Col>
                )}
              </Row>

              {event.completed && (
                <Alert variant="success" className="mt-3">
                  <CheckCircle />
                  {' '}
                  This event has been completed.
                  {event.actualEnd && (
                  <div className="mt-1 small">
                    Completed on
                    {' '}
                    {formatDateShort(event.actualEnd)}
                  </div>
                  )}
                </Alert>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Sidebar with additional info */}
        <Col lg={4}>
          <Card>
            <CardHeader>
              <h6 className="mb-0">Event Information</h6>
            </CardHeader>
            <CardBody>
              <div className="mb-3">
                <small className="text-muted">Project</small>
                <div>{project.name}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Duration</small>
                <div>
                  {Math.ceil(
                    (new Date(event.plannedEnd).getTime() - new Date(event.plannedStart).getTime())
                    / (1000 * 60 * 60 * 24),
                  )}
                  {' '}
                  days
                </div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Status</small>
                <div>{getStatusBadge()}</div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default EventDetailView;
