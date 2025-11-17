'use client';

import { Issue } from '@prisma/client';

interface IssueTableProps {
  issues: Issue[];
}

const IssueTable = ({ issues }: IssueTableProps) => {
  // Sort issues by first raised date
  const sortedIssues = issues.sort((a, b) => new Date(a.firstRaised).getTime() - new Date(b.firstRaised).getTime());

  // Format date for display
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="row mt-4">
      <div className="col">
        <h6>Issue Details</h6>
        <div className="list-group">
          {sortedIssues.map((issue) => (
            <div key={issue.id} className="list-group-item">
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1">
                    {issue.remedy}
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
  );
};

export default IssueTable;
