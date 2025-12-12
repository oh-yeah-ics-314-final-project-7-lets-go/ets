'use client';

import { truncate } from '@/lib/util';
import { Issue, Severity } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Col, FormSelect, ListGroup, ListGroupItem, Row } from 'react-bootstrap';

interface IssueTableProps {
  projectId: string;
  isApproved: boolean;
  issues: Issue[];
}

const IssueTable = ({ projectId, isApproved, issues }: IssueTableProps) => {
  const { data: session } = useSession();
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
    <Row className="mt-4">
      <Col>
        <Card>
          <CardHeader className="d-flex gap-2 align-items-center">
            <h3 className="mb-0">Issues</h3>
            <div className="ms-auto d-flex gap-2">
              <FormSelect
                size="sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="LATEST">Latest 5</option>
                <option value="ALL_OPEN_BY_SEVERITY">All Open (by Severity)</option>
              </FormSelect>
            </div>
            {!isApproved && (session?.user as { randomKey: string })?.randomKey === 'VENDOR' && (
            <Button
              variant="outline-primary"
              size="sm"
              href={`/project/${projectId}/issue/create`}
            >
              Add Issue
            </Button>
            )}
          </CardHeader>
          <CardBody>
            <ListGroup>
              {sortedIssues.map((issue) => (
                <ListGroupItem key={issue.id}>
                  <div className="d-flex w-100 justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        <Link
                          href={`/project/${issue.projectId}/issue/${issue.id}`}
                          className="text-decoration-none text-body"
                        >
                          {issue.title}
                        </Link>
                        {issue.status === 'CLOSED' && (
                          <span className="badge bg-success ms-2">Closed</span>
                        )}
                        {issue.status === 'OPEN' && (
                          <span className="badge bg-warning text-dark ms-2">Open</span>
                        )}
                      </h6>
                      <p className="mb-1">{truncate(issue.description, 150)}</p>
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
                </ListGroupItem>
              ))}
            </ListGroup>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default IssueTable;
