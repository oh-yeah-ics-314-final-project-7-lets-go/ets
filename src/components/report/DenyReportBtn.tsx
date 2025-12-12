'use client';

import { addComment, changeReportStatus } from '@/lib/dbActions';
import { reportName } from '@/lib/util';
import { ProjectStatus, Report } from '@prisma/client';
import { Button } from 'react-bootstrap';

const DenyReportBtn = ({ id, report }: { id: number; report: Report; }) => (
  <Button
    variant="danger"
    className="me-2"
    onClick={async () => {
      await addComment({ projectId: report.projectId, content: `Denied ${reportName(report)}` });
      await changeReportStatus(id, ProjectStatus.DENIED);
    }}
  >
    Deny
  </Button>
);

export default DenyReportBtn;
