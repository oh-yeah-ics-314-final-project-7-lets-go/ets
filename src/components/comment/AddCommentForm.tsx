'use client';

import { useSession } from 'next-auth/react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { addComment } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AddCommentSchema } from '@/lib/validationSchemas';
import { Project } from '@prisma/client';
import { InferType } from 'yup';
import FormButton from '../FormButton';

type AddCommentFormData = InferType<typeof AddCommentSchema>;

const AddCommentForm = ({ project }: { project: Project }) => {
  const { status, data } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddCommentFormData>({
    resolver: yupResolver(AddCommentSchema),
    mode: 'onChange',
  });

  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated' || !data?.user) {
    redirect('/auth/signin');
  }

  const onSubmit = async (formData: AddCommentFormData) => {
    await addComment(formData);
    swal('Success', 'Added your comment', 'success', {
      timer: 2000,
    });
  };

  return (
    <Container className="py-3">
      <Col className="text-center mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <FormButton
            href={`/project/${project.id}`}
            variant="cancel"
            size="sm"
          >
            ← Back To Overview
          </FormButton>
          <div>
            <h2 className="mb-0">Add Comment</h2>
            <p className="text-muted mb-0">{`Add a comment for ${project.name}`}</p>
          </div>
          <div style={{ width: '140px' }} />
        </div>
      </Col>

      <Card className="form-Card">
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register('projectId')} value={project.id} />
            <input
              type="hidden"
              {...register('authorId')}
              value={(data.user as { id: string }).id}
            />
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
                  <FormButton type="submit" size="lg" variant="primary">
                    Create Comment
                  </FormButton>
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
