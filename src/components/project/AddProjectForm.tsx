'use client';

import { useSession } from 'next-auth/react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { addProject } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import FormButton from '@/components/FormButton';
import { AddProjectSchema } from '@/lib/validationSchemas';

type AddProjectFormData = {
  name: string;
  description: string;
  originalContractAward: number;
};

const AddProjectForm: React.FC = () => {
  const { status } = useSession();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddProjectFormData>({
    resolver: yupResolver(AddProjectSchema),
  });

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'unauthenticated') redirect('/auth/signin');

  const onSubmit = async (data: AddProjectFormData) => {
    await addProject(data);
    swal('Success', 'IV&V Project Report has been submitted', 'success', { timer: 2000 });
  };

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={8}>
          <Col className="text-center">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <FormButton href="/" variant="cancel" size="sm">
                ← Back
              </FormButton>
              <div>
                <h2>Submit IV&V Project Report</h2>
                <p className="text-muted">
                  Submit standardized project data for Independent Verification & Validation
                </p>
              </div>
              <div style={{ width: '140px' }} />
            </div>
          </Col>

          <Card className="form-Card">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Project Name *</Form.Label>
                      <input
                        type="text"
                        {...register('name')}
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="Enter project name"
                      />
                      <div className="invalid-feedback">{errors.name?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Original Contract Award ($) *</Form.Label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('originalContractAward')}
                        className={`form-control ${errors.originalContractAward ? 'is-invalid' : ''}`}
                        placeholder="0.00"
                      />
                      <div className="invalid-feedback">{errors.originalContractAward?.message}</div>
                      <Form.Text className="text-muted">
                        Enter the initial contract value in USD
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Description *</Form.Label>
                      <textarea
                        {...register('description')}
                        rows={5}
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        style={{ resize: 'none' }}
                        placeholder="Enter the description of the project"
                      />
                      <div className="invalid-feedback">{errors.description?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="form-group">
                  <Row className="pt-3">
                    <Col>
                      <FormButton type="submit" variant="primary" size="lg">
                        Submit Project
                      </FormButton>
                    </Col>
                    <Col className="d-flex justify-content-end">
                      <FormButton
                        type="button"
                        variant="cancel"
                        size="lg"
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

export default AddProjectForm;
