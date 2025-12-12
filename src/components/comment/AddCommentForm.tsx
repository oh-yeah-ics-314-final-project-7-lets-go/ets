'use client';

import { useSession } from 'next-auth/react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect, useRouter } from 'next/navigation';
import { addComment } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AddCommentSchema } from '@/lib/validationSchemas';
import { Project } from '@prisma/client';
import { InferType } from 'yup';
import FormButton from '../FormButton';

type AddCommentFormData = InferType<typeof AddCommentSchema>;

const AddCommentForm = ({ project }: { project: Project }) => {
  const router = useRouter();
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
    router.push(`/project/${project.id}`);
  };

  return (
    <Container>
      <Card className="border-0">
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register('projectId')} value={project.id} />
            <Row>
              <Col>
                <Form.Group>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      {...register('content')}
                      className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                      placeholder="Enter your comment..."
                    />
                    <FormButton className="text-nowrap" type="submit" variant="primary">
                      Post Comment
                    </FormButton>
                  </div>
                  <div className="d-block invalid-feedback">{errors.content?.message}</div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddCommentForm;
