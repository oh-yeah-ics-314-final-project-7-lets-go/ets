'use client';

import { Issue, Project } from '@prisma/client';
import { deleteIssue } from '@/lib/dbActions';
import Link from 'next/link';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem, Button, ButtonGroup, Card, CardBody, CardHeader, Col, Container, Row } from 'react-bootstrap';
import { CheckCircle, Pencil, Trash } from 'react-bootstrap-icons';

interface IssueDetailViewProps {
  issue: Issue;
  project: Project;
}

const IssueDetailView = ({ issue, project }: IssueDetailViewProps) => {
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
    <Container className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Breadcrumb>
            <BreadcrumbItem href={`/project/${project.id}`}>
              {project.name}
            </BreadcrumbItem>
            <BreadcrumbItem active aria-current="page">
              Issue #
              {issue.id}
            </BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>

      {/* Issue Details Card */}
      <Row>
        <Col lg={8}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
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
              <ButtonGroup className="gap-1">
                <Link href={`/project/${project.id}/issue/${issue.id}/edit`}>
                  <Button
                    variant="warning"
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
                      if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
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
                  <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{issue.description}</p>
                </Col>
              </Row>

              <Row>
                <Col md={12} className="mb-4">
                  <h6 className="text-muted">Remedy</h6>
                  <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{issue.remedy}</p>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">First Raised</h6>
                  <p className="mb-0">{formatDate(issue.firstRaised)}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">Last Updated</h6>
                  <p className="mb-0">{formatDate(issue.updatedAt)}</p>
                </Col>
              </Row>

              {issue.status === 'CLOSED' && (
                <Alert variant="success" className="mt-3">
                  <CheckCircle />
                  {' '}
                  This issue has been resolved.
                  <div className="mt-1 small">
                    Closed on
                    {' '}
                    {formatDateShort(issue.updatedAt)}
                  </div>
                </Alert>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Sidebar with additional info */}
        <Col lg={4}>
          <Card>
            <CardHeader>
              <h6 className="mb-0">Issue Information</h6>
            </CardHeader>
            <CardBody>
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
            </CardBody>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default IssueDetailView;
