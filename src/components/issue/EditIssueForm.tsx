'use client';

import { useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { editIssue } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { EditIssueSchema } from '@/lib/validationSchemas';
import { Issue, Likelihood, Project, Severity, Status } from '@prisma/client';
import { InferType } from 'yup';

type EditIssueFormData = InferType<typeof EditIssueSchema>;

const EditIssueForm = ({ project, issue }: { project: Project; issue: Issue; }) => {
  const { status } = useSession();

  const onSubmit = async (data: EditIssueFormData) => {
    await editIssue({ ...issue, ...data });
    swal('Success', 'Issue has been edited', 'success', {
      timer: 2000,
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditIssueFormData>({
    resolver: yupResolver(EditIssueSchema),
  });

  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={8}>
          <Col className="text-center">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <a
                href={`/project/${project.id}`}
                className="btn btn-outline-secondary"
              >
                ← Back to Overview
              </a>
              <div>
                <h2 className="mb-0">Edit Issue</h2>
                <p className="text-muted mb-0">
                  {`Editing an issue for ${project.name}`}
                </p>
              </div>
              <div style={{ width: '140px' }} />
              {' '}
              {/* Spacer for centering */}
            </div>
          </Col>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('id')} value={issue.id} />
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Issue Description</Form.Label>
                      <input
                        type="text"
                        {...register('description')}
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        placeholder="Enter description of issue"
                        defaultValue={issue.description}
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
                        defaultValue={issue.remedy}
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
                        defaultValue={issue.severity}
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
                        defaultValue={issue.likelihood}
                      >
                        <option value={Likelihood.LOW}>Low</option>
                        <option value={Likelihood.MEDIUM}>Medium</option>
                        <option value={Likelihood.HIGH}>High</option>
                      </select>
                      <div className="invalid-feedback">{errors.likelihood?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <select
                        {...register('status')}
                        className={`form-control ${errors.status ? 'is-invalid' : ''}`}
                        defaultValue={issue.status.toLowerCase()}
                      >
                        <option value={Status.OPEN}>Open</option>
                        <option value={Status.CLOSED}>Closed</option>
                      </select>
                      <div className="invalid-feedback">{errors.status?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="form-group">
                  <Row className="pt-3">
                    <Col>
                      <Button type="submit" variant="primary" size="lg">
                        Submit Issue
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type="button"
                        onClick={() => reset()}
                        variant="outline-secondary"
                        size="lg"
                        className="float-end"
                      >
                        Reset Form
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

export default EditIssueForm;
