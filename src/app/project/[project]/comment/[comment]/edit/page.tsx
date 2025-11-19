'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Container } from 'react-bootstrap';
import { editComment } from '@/lib/dbActions';
import { Comment } from '@prisma/client';

interface EditCommentPageProps {
  comment: Comment; // Type the comment prop
}

const EditCommentPage = ({ comment }: EditCommentPageProps) => {
  const router = useRouter();
  const [content, setContent] = useState(comment.content);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await editComment({
      id: comment.id,
      authorId: comment.authorId,
      projectId: comment.projectId,
      content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });

    router.back();
  };

  return (
    <Container className="py-3">
      <h2>Edit Comment</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </Form.Group>

        <Button type="submit">Save Changes</Button>
      </Form>
    </Container>
  );
};

export default EditCommentPage;
