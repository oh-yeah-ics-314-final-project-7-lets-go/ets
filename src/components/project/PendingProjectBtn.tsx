'use client';

import { changeProjectStatus, addComment } from '@/lib/dbActions';
import { ProjectStatus } from '@prisma/client';
import { Button } from 'react-bootstrap';

const PendingProjectBtn = ({ id, isETS }: { id: number; isETS: boolean; }) => (
  <Button
    variant="secondary"
    className="me-2"
    onClick={async () => {
      await changeProjectStatus(id, ProjectStatus.PENDING);
      await addComment({
        projectId: id,
        content: isETS ? 'Moved project back to pending status' : 'Requesting re-review',
      });
    }}
  >
    {isETS ? 'Change to pending' : 'Request re-review'}
  </Button>
);

export default PendingProjectBtn;
