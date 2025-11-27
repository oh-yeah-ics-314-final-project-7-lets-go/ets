'use client';

import { Project, ProjectStatus, Report } from '@prisma/client';
import { deleteReport } from '@/lib/dbActions';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button, ButtonGroup, Card, CardBody, CardHeader, Col, Container, Row } from 'react-bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';
import { formatCurrency, formatDate, reportName } from '@/lib/util';
import StatusTooltip from '../StatusTooltip';

interface ReportProjectProps {
  report: Report;
  project: Project;
}

const ReportPage = ({ report, project }: ReportProjectProps) => {
  const isApproved = report.status === ProjectStatus.APPROVED;

  const handleDeleteSubmit = async () => {
    await deleteReport(report.id);
  };

  return (
    <Container className="mt-4">
      {/* Header */}
      <Row className="row mb-4">
        <Col className="col">
          <Breadcrumb>
            <BreadcrumbItem>
              <Link href={`/project/${project.id}`}>
                {project.name}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem active aria-current="page">
              {reportName(report)}
            </BreadcrumbItem>
          </Breadcrumb>
        </Col>

        {/* Issue Details Card */}
        <Row>
          <Col>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0 align-items-center d-flex">
                    <StatusTooltip status={report.status} type="report" />
                    {reportName(report)}
                  </h4>
                </div>
                <ButtonGroup className="gap-1">
                  {!isApproved && (
                  <Link href={`/project/${project.id}/report/${report.id}/edit`}>
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
                  )}
                  <form action={handleDeleteSubmit} className="d-inline">
                    <Button
                      variant="danger"
                      size="sm"
                      type="submit"
                      onClick={(e) => {
                      // eslint-disable-next-line no-restricted-globals, no-alert
                        if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
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
                    <h6 className="text-muted">Cumulative Invoiced Total</h6>
                    <p className="mb-0">{formatCurrency(report.paidUpToNow)}</p>
                  </Col>
                </Row>

                <Row>
                  <Col md={12} className="mb-4">
                    <h6 className="text-muted">Cumulative Progress</h6>
                    <p className="mb-0">
                      {report.progress.toFixed(1)}
                      %
                    </p>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Created?</h6>
                    <p className="mb-0">...</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted">Last Updated</h6>
                    <p className="mb-0">{formatDate(report.updatedAt)}</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Row>
    </Container>
  );
};

export default ReportPage;
