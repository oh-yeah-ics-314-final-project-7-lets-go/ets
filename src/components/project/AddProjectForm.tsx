'use client';

import { useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { addProject } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AddProjectSchema } from '@/lib/validationSchemas';

type AddProjectFormData = {
  name: string;
  description: string;
  originalContractAward: number;
};

const onSubmit = async (data: AddProjectFormData) => {
  await addProject(data);
  swal('Success', 'IV&V Project Report has been submitted', 'success', {
    timer: 2000,
  });
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
            <h2>Submit IV&V Project Report</h2>
            <p className="text-muted">
              Submit standardized project data for Independent Verification & Validation
            </p>
          </Col>
          <Card>
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
                      <Button type="submit" variant="primary" size="lg">
                        Submit Report
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

export default AddProjectForm;
