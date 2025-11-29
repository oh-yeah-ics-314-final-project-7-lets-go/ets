'use client';

import { addComment, changeReportStatus } from '@/lib/dbActions';
import { reportName } from '@/lib/util';
import { ProjectStatus, Report } from '@prisma/client';
import { Button } from 'react-bootstrap';

const PendingReportBtn = ({ id, report, author, isETS }:
{ id: number; report: Report; author: number; isETS: boolean; }) => (
  <Button
    variant="secondary"
    className="me-2"
    onClick={async () => {
      await addComment({
        projectId: report.projectId,
        authorId: author,
        content: isETS
          ? `Moved ${reportName(report)} back to pending`
          : `Requested a re-review of ${reportName(report)}`,
      });
      await changeReportStatus(id, ProjectStatus.PENDING);
    }}
  >
    {isETS ? 'Change to pending' : 'Request re-review'}
  </Button>
);

export default PendingReportBtn;
