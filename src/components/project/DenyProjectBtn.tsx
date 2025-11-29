'use client';

import { addComment, changeProjectStatus } from '@/lib/dbActions';
import { ProjectStatus } from '@prisma/client';
import { Button } from 'react-bootstrap';

const DenyProjectBtn = ({ id, author }: { id: number; author: number; }) => (
  <Button
    variant="danger"
    className="me-2"
    onClick={async () => {
      await changeProjectStatus(id, ProjectStatus.DENIED);
      await addComment({ projectId: id, authorId: author, content: 'Denied project' });
    }}
  >
    Deny
  </Button>
);

export default DenyProjectBtn;
