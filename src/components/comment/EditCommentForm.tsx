'use client';

import { useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { editComment } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { EditCommentSchema } from '@/lib/validationSchemas';
import { Comment } from '@prisma/client';
import { InferType } from 'yup';
import { Dispatch, SetStateAction } from 'react';

type EditCommentFormData = InferType<typeof EditCommentSchema>;

const EditCommentForm = ({ comment, setEdit }: { comment: Comment; setEdit: Dispatch<SetStateAction<boolean>> }) => {
  const { status, data } = useSession();

  const onSubmit = async (editData: EditCommentFormData) => {
    await editComment({ ...comment, ...editData });
    await swal('Success', 'Comment has been edited', 'success', {
      timer: 2000,
    });
    setEdit(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(EditCommentSchema),
    mode: 'onChange',
  });

  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }
  if ((data?.user as { id: string; }).id !== comment.id.toString()) {
    redirect('/not-authorized');
  }

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={8}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('id')} value={comment.id} />
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Comment</Form.Label>
                      <input
                        type="text"
                        {...register('content')}
                        className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                        placeholder="Enter your comment..."
                        defaultValue={comment.content}
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
        </Col>
      </Row>
    </Container>
  );
};

export default EditCommentForm;
