'use client';

import { useSession } from 'next-auth/react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { editIssue } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import FormButton from '@/components/FormButton';
import { EditIssueSchema } from '@/lib/validationSchemas';
import { Issue, Likelihood, Project, Severity, Status } from '@prisma/client';
import { InferType } from 'yup';
import FormRequired from '../FormRequired';

type EditIssueFormData = InferType<typeof EditIssueSchema>;

const EditIssueForm = ({ project, issue }: { project: Project; issue: Issue }) => {
  const { status } = useSession();

  const onSubmit = async (data: EditIssueFormData) => {
    await editIssue({ ...issue, ...data });
    swal('Success', 'Issue has been edited', 'success', { timer: 2000 });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditIssueFormData>({
    resolver: yupResolver(EditIssueSchema),
  });

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'unauthenticated') redirect('/auth/signin');

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={8}>
          <Col className="text-center mb-4">
            <div className="align-items-center mb-3">
              <h2>
                {`Edit Issue #${issue.id}`}
              </h2>
              <p className="text-muted">
                Update issue data for
                {' '}
                <i>{project.name}</i>
              </p>
            </div>
          </Col>

          <Card className="form-Card">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('id')} value={issue.id} />
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Issue Title
                        <FormRequired />
                      </Form.Label>
                      <input
                        type="text"
                        {...register('title')}
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        placeholder="Enter title of issue"
                        defaultValue={issue.title}
                      />
                      <div className="invalid-feedback">{errors.title?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Issue Description
                        <FormRequired />
                      </Form.Label>
                      <textarea
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
                      <Form.Label>
                        Remedy for Issue
                        <FormRequired />
                      </Form.Label>
                      <textarea
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
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Severity
                        <FormRequired />
                      </Form.Label>
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
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Likelihood
                        <FormRequired />
                      </Form.Label>
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
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Status
                        <FormRequired />
                      </Form.Label>
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
                      <FormButton type="submit" variant="primary">
                        Update Issue
                      </FormButton>
                    </Col>
                    <Col className="d-flex justify-content-end">
                      <FormButton
                        type="button"
                        variant="cancel"
                        href={`/project/${project.id}/issue/${issue.id}`}
                      >
                        Cancel
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

export default EditIssueForm;
