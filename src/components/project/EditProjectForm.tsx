'use client';

import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { Project } from '@prisma/client';
import { EditProjectSchema } from '@/lib/validationSchemas';
import { editProject } from '@/lib/dbActions';

type EditProjectFormData = {
  id: number;
  name: string;
  description: string;
  originalContractAward: number;
};

const onSubmit = async (data: EditProjectFormData) => {
  await editProject(data as Project);
  swal('Success', 'IV&V Project Report has been updated', 'success', {
    timer: 2000,
  });
};

const EditProjectForm = ({ project }: { project: Project }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // watch,
  } = useForm<EditProjectFormData>({
    resolver: yupResolver(EditProjectSchema),
    defaultValues: {
      id: project.id,
      name: project.name,
      description: project.description,
      originalContractAward: project.originalContractAward,
    },
  });

  // Watch values for real-time calculations
  // const watchedContractAward = watch('originalContractAward');
  // const watchedTotalPaidOut = watch('totalPaidOut');
  // const watchedProgress = watch('progress');

  // // Calculate budget utilization
  // const budgetUtilized = watchedContractAward > 0
  //   ? (watchedTotalPaidOut / watchedContractAward) * 100
  //   : 0;

  // const getBudgetStatus = () => {
  //   if (budgetUtilized > 100) return { variant: 'danger', text: 'Over Budget' };
  //   if (budgetUtilized > 90) return { variant: 'warning', text: 'Near Budget Limit' };
  //   return { variant: 'success', text: 'Within Budget' };
  // };

  // const budgetStatus = getBudgetStatus();

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={8}>
          <Col className="text-center mb-4">
            <h2>Edit IV&V Project Report</h2>
            <p className="text-muted">
              Update standardized project data for Independent Verification & Validation
            </p>
          </Col>

          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('id')} />

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

                {/* Budget Status Alert */}
                {/* <Alert variant={budgetStatus.variant} className="mb-3">
                  <Alert.Heading>
                    Budget Status:
                    {budgetStatus.text}
                  </Alert.Heading>
                  <p className="mb-0">
                    <strong>Budget Utilization:</strong>
                    {' '}
                    {budgetUtilized.toFixed(1)}
                    %
                    <br />
                    <strong>Remaining Budget:</strong>
                    {' '}
                    $
                    {(watchedContractAward - watchedTotalPaidOut).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </Alert> */}
                <Form.Group className="form-group">
                  <Row className="pt-3">
                    <Col>
                      <Button type="submit" variant="primary" size="lg">
                        Update Report
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type="button"
                        onClick={() => reset()}
                        variant="outline-secondary"
                        size="lg"
                        className="me-2"
                      >
                        Reset Changes
                      </Button>
                      <Button
                        variant="outline-dark"
                        size="lg"
                        href={`/project/${project.id}`}
                      >
                        Cancel
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

export default EditProjectForm;
