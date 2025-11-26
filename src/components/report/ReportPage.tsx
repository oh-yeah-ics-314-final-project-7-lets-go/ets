'use client';

import { Project, ProjectStatus, Report } from '@prisma/client';
import { deleteReport } from '@/lib/dbActions';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
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
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href={`/project/${project.id}`}>
                  {project.name}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {reportName(report)}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Issue Details Card */}
      <div className="row">
        <div className="col">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0 align-items-center d-flex">
                  <StatusTooltip status={report.status} type="report" />
                  {reportName(report)}
                </h4>
              </div>
              <div className="btn-group gap-1">
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
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 mb-4">
                  <h6 className="text-muted">Cumulative Invoiced Total</h6>
                  <p className="mb-0">{formatCurrency(report.paidUpToNow)}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-4">
                  <h6 className="text-muted">Cumulative Progress</h6>
                  <p className="mb-0">
                    {report.progress.toFixed(1)}
                    %
                  </p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted">Created?</h6>
                  <p className="mb-0">...</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted">Last Updated</h6>
                  <p className="mb-0">{formatDate(report.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReportPage;
