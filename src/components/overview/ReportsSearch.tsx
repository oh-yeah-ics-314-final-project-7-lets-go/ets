'use client';

import { ProjectWithReports } from '@/lib/dbActions';
import { formatCurrency, getProgressVariant, reportName } from '@/lib/util';
import { ProjectStatus } from '@prisma/client';
import Link from 'next/link';
import { Card, CardBody, CardHeader, Col, ProgressBar, Row } from 'react-bootstrap';

interface ReportsSearchProps {
  reports?: ProjectWithReports[];
}

const Status = ({ status }: { status: ProjectStatus }) => {
  if (status === ProjectStatus.APPROVED) return <span className="text-success fw-bold fst-italic">Approved</span>;
  if (status === ProjectStatus.PENDING) return <span className="text-secondary fst-italic">Pending</span>;
  return <span className="text-danger fw-bold fst-italic">Denied</span>;
};

const ReportsSearch = ({ reports: projects }: ReportsSearchProps) => {
  if (!Array.isArray(projects)) { return null; }
  if (!projects.length || projects.every(p => !p.reports.length)) {
    return (
      <Row>
        <Col className="text-center">
          <i>No reports found</i>
        </Col>
      </Row>
    );
  } return (
    <Row>
      {projects.map(p => p.reports.map(r => (
        <Col key={`report ${r.id}`} className="my-2" xs={4}>
          <Card>
            <CardHeader>
              <Link
                className="text-black"
                href={`/dashboard/${r.id}`}
              >
                <b>{p.name}</b>
                <br />
                <i style={{ fontSize: '0.8em' }}>{reportName(r)}</i>
              </Link>
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
      )))}
    </Row>
  );
};

ReportsSearch.defaultProps = {
  reports: undefined,
};

export default ReportsSearch;
