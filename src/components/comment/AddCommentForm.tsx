'use client';

import { useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { addComment } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AddCommentSchema } from '@/lib/validationSchemas';
import { Project } from '@prisma/client';
import { InferType } from 'yup';

type AddCommentFormData = InferType<typeof AddCommentSchema>;

const onSubmit = async (data: AddCommentFormData) => {
  await addComment(data);
  swal('Success', 'Added your comment', 'success', {
    timer: 2000,
  });
};

const AddCommentForm = ({ project }: { project: Project; }) => {
  const { status, data } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AddCommentSchema),
    mode: 'onChange',
  });

  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated' || !data?.user) {
    redirect('/auth/signin');
  }

  return (
    <Container className="py-3">
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register('projectId')} value={project.id} />
            <input type="hidden" {...register('authorId')} value={(data.user as { id: string; }).id} />
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Comment</Form.Label>
                  <input
                    type="text"
                    {...register('content')}
                    className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                    placeholder="Enter your comment..."
                  />
                  <div className="invalid-feedback">{errors.content?.message}</div>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="form-group">
              <Row className="pt-3">
                <Col>
                  <Button type="submit" variant="primary" size="lg">
                    Create Comment
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddCommentForm;
