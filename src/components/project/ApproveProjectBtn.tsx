'use client';

import { changeProjectStatus, addComment } from '@/lib/dbActions';
import { ProjectStatus } from '@prisma/client';
import { Button } from 'react-bootstrap';

const ApproveProjectBtn = ({ id }: { id: number; }) => (
  <Button
    variant="success"
    className="me-2"
    onClick={async () => {
      await changeProjectStatus(id, ProjectStatus.APPROVED);
      await addComment({ projectId: id, content: 'Approved project' });
    }}
  >
    Approve
  </Button>
);

export default ApproveProjectBtn;
