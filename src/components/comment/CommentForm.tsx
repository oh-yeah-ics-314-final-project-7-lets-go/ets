import { Prisma } from '@prisma/client';
import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button } from 'react-bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';
import { useSession } from 'next-auth/react';
import { deleteComment } from '@/lib/dbActions';
import EditCommentForm from './EditCommentForm';

export type CommentWithUser = Prisma.CommentGetPayload<{ include: { author: true } }>;

export default function CommentForm({ id, author, projectId, content, createdAt, updatedAt }: CommentWithUser) {
  const [edit, setEdit] = useState(false);
  const { data } = useSession();

  const isOP = (data?.user as { id: string; })?.id === author.id.toString();
  const isETS = (data?.user as { randomKey: string; })?.randomKey === 'ETS';
  return (edit
    ? (
      <EditCommentForm
        comment={{ id, authorId: author.id, projectId, content, createdAt, updatedAt }}
        setEdit={setEdit}
      />
    )
    : (
      <Card key={`cmt-${id}`}>
        <CardHeader>
          {`${author.firstName} ${author.lastName}`}
          {isOP && (
            <Button variant="warning" onClick={() => setEdit(true)}>
              <Pencil />
            </Button>
          )}
          {(isETS || isOP) && (
          <Button variant="outline-danger" onClick={() => deleteComment(id)}>
            <Trash />
          </Button>
          )}
        </CardHeader>
        <CardBody>
          {content}
        </CardBody>
        <CardFooter>
          <sub>
            Posted at
            {' '}
            {createdAt.toString()}
          </sub>
          {updatedAt.getTime() !== createdAt.getTime() && (
          <sub>
            <br />
            Updated at
            {' '}
            {updatedAt.toString()}
          </sub>
          )}
        </CardFooter>
      </Card>
    )
  );
}
