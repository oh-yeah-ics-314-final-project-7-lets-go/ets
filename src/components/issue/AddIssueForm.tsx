'use client';

import { useSession } from 'next-auth/react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { addIssue } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import FormButton from '@/components/FormButton';
import { AddIssueSchema } from '@/lib/validationSchemas';
import { Likelihood, Project, Severity, Status } from '@prisma/client';
import { InferType } from 'yup';

type AddIssueFormData = InferType<typeof AddIssueSchema>;

const AddIssueForm = ({ project }: { project: Project }) => {
  const { status, data: sessionData } = useSession();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddIssueFormData>({
    resolver: yupResolver(AddIssueSchema),
  });

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  const onSubmit = async (formData: AddIssueFormData) => {
    await addIssue(formData);
    swal('Success', 'Issue has been submitted', 'success', { timer: 2000 });
    reset();
  };

  const userId = (sessionData?.user as { id: string })?.id || '';

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={8}>
          <Col className="text-center">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <FormButton
                type="button"
                variant="cancel"
                size="sm"
                href={`/project/${project.id}`}
              >
                ← Back to Overview
              </FormButton>
              <div>
                <h2 className="mb-0">Submit Issue</h2>
                <p className="text-muted mb-0">{`Add an issue for ${project.name}`}</p>
              </div>
              <div style={{ width: '140px' }} />
              {' '}
              {/* Spacer for centering */}
            </div>
          </Col>

          <Card className="form-Card">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('projectId')} value={project.id} />
                <input type="hidden" {...register('creatorId')} value={userId} />
                <input type="hidden" {...register('status')} value={Status.OPEN} />

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Issue Description</Form.Label>
                      <input
                        type="text"
                        {...register('description')}
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        placeholder="Enter description of issue"
                      />
                      <div className="invalid-feedback">{errors.description?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Remedy for Issue</Form.Label>
                      <input
                        type="text"
                        {...register('remedy')}
                        className={`form-control ${errors.remedy ? 'is-invalid' : ''}`}
                        placeholder="Enter remedy for issue"
                      />
                      <div className="invalid-feedback">{errors.remedy?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Severity</Form.Label>
                      <select
                        {...register('severity')}
                        className={`form-control ${errors.severity ? 'is-invalid' : ''}`}
                      >
                        <option value={Severity.LOW}>Low</option>
                        <option value={Severity.MEDIUM}>Medium</option>
                        <option value={Severity.HIGH}>High</option>
                      </select>
                      <div className="invalid-feedback">{errors.severity?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Likelihood</Form.Label>
                      <select
                        {...register('likelihood')}
                        className={`form-control ${errors.likelihood ? 'is-invalid' : ''}`}
                      >
                        <option value={Likelihood.LOW}>Low</option>
                        <option value={Likelihood.MEDIUM}>Medium</option>
                        <option value={Likelihood.HIGH}>High</option>
                      </select>
                      <div className="invalid-feedback">{errors.likelihood?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="form-group">
                  <Row className="pt-3">
                    <Col>
                      <FormButton type="submit" variant="primary" size="lg">
                        Submit Issue
                      </FormButton>
                    </Col>
                    <Col className="d-flex justify-content-end">
                      <FormButton
                        type="button"
                        variant="cancel"
                        size="lg"
                        className="me-2"
                        onClick={() => reset()}
                      >
                        Reset Form
                      </FormButton>
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

export default AddIssueForm;
