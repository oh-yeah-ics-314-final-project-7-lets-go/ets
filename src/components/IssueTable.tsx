'use client';

import { Issue, Severity } from '@prisma/client';
import { useState } from 'react';

interface IssueTableProps {
  issues: Issue[];
}

const IssueTable = ({ issues }: IssueTableProps) => {
  const [filter, setFilter] = useState<string>('OPEN');

  const getFilteredIssues = () => {
    let filtered = [...issues];

    switch (filter) {
      case 'OPEN':
        filtered = issues.filter(issue => issue.status === 'OPEN');
        break;
      case 'CLOSED':
        filtered = issues.filter(issue => issue.status === 'CLOSED');
        break;
      case 'LATEST':
        filtered = issues
          .sort((a, b) => new Date(b.firstRaised).getTime() - new Date(a.firstRaised).getTime())
          .slice(0, 5);
        break;
      case 'ALL_OPEN_BY_SEVERITY':
        filtered = issues
          .filter(issue => issue.status === 'OPEN')
          .sort((a, b) => {
            const severityOrder: { [key in Severity]: number } = {
              HIGH: 3,
              MEDIUM: 2,
              LOW: 1,
            };
            return severityOrder[b.severity] - severityOrder[a.severity];
          });
        break;
      default:
        filtered = issues.filter(issue => issue.status === 'OPEN');
    }

    return filtered.sort((a, b) => new Date(a.firstRaised).getTime() - new Date(b.firstRaised).getTime());
  };

  const sortedIssues = getFilteredIssues();

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="row mt-4">
      <div className="col">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Issue Details</h6>
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="OPEN">Open Issues</option>
                <option value="CLOSED">Closed Issues</option>
                <option value="LATEST">Latest 5</option>
                <option value="ALL_OPEN_BY_SEVERITY">All Open (by Severity)</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            <div className="list-group">
              {sortedIssues.map((issue) => (
                <div key={issue.id} className="list-group-item">
                  <div className="d-flex w-100 justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        <a
                          href={`/project/${issue.projectId}/issue/${issue.id}`}
                          className="text-decoration-none text-dark"
                        >
                          {issue.remedy}
                        </a>
                        {issue.status === 'CLOSED' && (
                          <span className="badge bg-success ms-2">Closed</span>
                        )}
                        {issue.status === 'OPEN' && (
                          <span className="badge bg-warning ms-2">Open</span>
                        )}
                      </h6>
                      <p className="mb-1">{issue.description}</p>
                      <small className="text-muted">
                        First Raised:
                        {' '}
                        {formatDate(issue.firstRaised)}
                        {' '}
                        | Status:
                        {' '}
                        {issue.status}
                        {' '}
                        | Last Updated:
                        {' '}
                        {formatDate(issue.updatedAt)}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueTable;
