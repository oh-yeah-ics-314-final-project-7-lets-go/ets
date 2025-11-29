'use client';

import { addComment, changeReportStatus } from '@/lib/dbActions';
import { reportName } from '@/lib/util';
import { ProjectStatus, Report } from '@prisma/client';
import { Button } from 'react-bootstrap';

const ApproveReportBtn = ({ id, report, author }: { id: number; report: Report; author: number; }) => (
  <Button
    variant="success"
    className="me-2"
    onClick={async () => {
      await addComment({ projectId: report.projectId, authorId: author, content: `Approved ${reportName(report)}` });
      await changeReportStatus(id, ProjectStatus.APPROVED);
    }}
  >
    Approve
  </Button>
);

export default ApproveReportBtn;
