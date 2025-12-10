'use client';

import { ReportWithProject } from '@/lib/dbActions';
import { formatCurrency, getProgressVariant, reportName } from '@/lib/util';
import { ProjectStatus } from '@prisma/client';
import Link from 'next/link';
import { Card, CardBody, CardHeader, Col, ProgressBar, Row } from 'react-bootstrap';

interface ReportsSearchProps {
  reports?: ReportWithProject[];
}

const Status = ({ status }: { status: ProjectStatus }) => {
  if (status === ProjectStatus.APPROVED) return <span className="text-success fw-bold fst-italic">Approved</span>;
  if (status === ProjectStatus.PENDING) return <span className="text-secondary fst-italic">Pending</span>;
  return <span className="text-danger fw-bold fst-italic">Denied</span>;
};

const ReportsSearch = ({ reports }: ReportsSearchProps) => {
  if (!Array.isArray(reports)) { return null; }
  if (!reports.length) {
    return (
      <Row>
        <Col className="text-center">
          <i>No reports found</i>
        </Col>
      </Row>
    );
  } return (
    <Row>
      {reports.map(r => (
        <Col key={`report ${r.id}`} className="my-2" xs={4}>
          <Card>
            <CardHeader>
              <Link
                className="text-body"
                href={`/dashboard/${r.id}`}
              >
                <b>{r.project.name}</b>
                <br />
                <i style={{ fontSize: '0.8em' }}>{reportName(r)}</i>
              </Link>
            </CardHeader>
            <CardBody>
              <b>Cumulative Progress</b>
              <ProgressBar style={{ height: '20px' }}>
                <ProgressBar
                  now={r.progress}
                  className={`mb-2 ${getProgressVariant(r.progress) === 'warning' && 'text-dark'}`}
                  label={r.progress >= 20 ? `${r.progress.toFixed(1)}%` : ' '}
                  variant={getProgressVariant(r.progress)}
                  style={{ height: '20px' }}
                />
                {r.progress < 20 && (
                  <div
                    className="position-absolute start-50"
                    style={{ transform: 'translate(-50%, 5%)' }}
                  >
                    {r.progress.toFixed(1)}
                    %
                  </div>
                )}
              </ProgressBar>
              <b>Total Invoiced</b>
              <br />
              {formatCurrency(r.paidUpToNow)}
              <br />
              <Status status={r.status} />
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

ReportsSearch.defaultProps = {
  reports: undefined,
};

export default ReportsSearch;
