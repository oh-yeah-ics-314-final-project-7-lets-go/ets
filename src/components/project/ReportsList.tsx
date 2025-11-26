'use client';

import { formatCurrency, getProgressVariant, reportName } from '@/lib/util';
import { ProjectStatus, Report } from '@prisma/client';
import Link from 'next/link';
import { Button, Card, CardBody, CardHeader, Col, ProgressBar, Row } from 'react-bootstrap';
import { Pencil } from 'react-bootstrap-icons';

interface ReportsListProps {
  reports: Report[];
  projectId: string;
}

const Status = ({ status }: { status: ProjectStatus }) => {
  if (status === 'APPROVED') return <span className="text-success fw-bold fst-italic">Approved</span>;
  if (status === 'PENDING') return <span className="text-secondary fst-italic">Pending</span>;
  return <span className="text-danger fw-bold fst-italic">Denied</span>;
};

const ReportsList = ({ reports, projectId }: ReportsListProps) => (
  <Row className="mt-4">
    <Col>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Monthly Reports</h3>
          <Button
            variant="outline-primary"
            size="sm"
            href={`/project/${projectId}/report/create`}
          >
            Add Report
          </Button>
        </CardHeader>
        <CardBody>
          <Row>
            {reports.map((r, repInd) => (
              <>
                <Col key={`report ${r.id}`} className="my-2" xs={4}>
                  <Card>
                    <CardHeader className="d-flex align-items-center">
                      <Link
                        href={`/project/${projectId}/report/${r.id}`}
                        className="text-black"
                      >
                        {/* makes every char except the first one lowercase. month enums are all caps. */}
                        {reportName(r)}
                      </Link>
                      <Button
                        href={`/project/${projectId}/report/${r.id}/edit`}
                        size="sm"
                        variant="outline-warning"
                        className="ms-auto"
                      >
                        <Pencil />
                      </Button>
                    </CardHeader>
                    <CardBody>
                      <b>Cumulative Progress</b>
                      <ProgressBar
                        now={r.progress}
                        className="mb-2"
                        label={`${r.progress.toFixed(1)}%`}
                        variant={getProgressVariant(r.progress)}
                        style={{ height: '20px' }}
                      />
                      <b>Total Invoiced</b>
                      <br />
                      {formatCurrency(r.paidUpToNow)}
                      <br />
                      <Status status={r.status} />
                    </CardBody>
                  </Card>
                </Col>
                {repInd % 4 === 3 ? null : null}
              </>
            ))}
          </Row>
        </CardBody>
      </Card>
    </Col>
  </Row>
);

export default ReportsList;
