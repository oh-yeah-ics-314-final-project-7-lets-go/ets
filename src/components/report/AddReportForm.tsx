'use client';

import { useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm, UseFormSetError } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { addReport, reportAlreadyExists } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AddReportSchema } from '@/lib/validationSchemas';
import { InferType } from 'yup';

type AddReportFormData = InferType<typeof AddReportSchema>;

const onSubmit = async (data: AddReportFormData, setError: UseFormSetError<AddReportFormData>) => {
  if (await reportAlreadyExists(data)) {
    setError('yearCreate', { message: 'A report with this year and month already exists.' });
    setError('monthCreate', { message: 'A report with this year and month already exists.' });
  } else {
    await addReport(data);
    swal('Success', 'IV&V Project Report has been submitted', 'success', {
      timer: 2000,
    });
  }
};

const AddReportForm = ({ projectId }: { projectId: number }) => {
  const { status } = useSession();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<AddReportFormData>({
    resolver: yupResolver(AddReportSchema),
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
              Enter report information for this project.
            </p>
          </Col>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit((d) => onSubmit(d, setError))}>
                <input type="hidden" {...register('projectId')} value={projectId} required />
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Year Created *</Form.Label>
                      <input
                        type="number"
                        min={1900}
                        max={4000}
                        {...register('yearCreate')}
                        className={`form-control ${errors.yearCreate ? 'is-invalid' : ''}`}
                        placeholder="Enter year covered"
                      />
                      <div className="invalid-feedback">{errors.yearCreate?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Month Created *</Form.Label>
                      <Form.Select
                        {...register('monthCreate')}
                        className={`form-control ${errors.monthCreate ? 'is-invalid' : ''}`}
                      >
                        <option value="">Select a month</option>
                        <option value="JANUARY">January</option>
                        <option value="FEBRUARY">February</option>
                        <option value="MARCH">March</option>
                        <option value="APRIL">April</option>
                        <option value="MAY">May</option>
                        <option value="JUNE">June</option>
                        <option value="JULY">July</option>
                        <option value="AUGUST">August</option>
                        <option value="SEPTEMBER">September</option>
                        <option value="OCTOBER">October</option>
                        <option value="NOVEMBER">November</option>
                        <option value="DECEMBER">December</option>
                      </Form.Select>
                      <div className="invalid-feedback">{errors.monthCreate?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Amount Invoiced up to now ($) *</Form.Label>
                      <input
                        type="number"
                        min={0}
                        max={999999999999}
                        {...register('paidUpToNow')}
                        className={`form-control ${errors.paidUpToNow ? 'is-invalid' : ''}`}
                        placeholder="Cumulative amount invoiced"
                      />
                      <div className="invalid-feedback">{errors.paidUpToNow?.message}</div>
                      <Form.Text className="text-muted">
                        Enter the total invoiced up to the end of this month in USD
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Progress (%) *</Form.Label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        {...register('progress')}
                        className={`form-control ${errors.progress ? 'is-invalid' : ''}`}
                        placeholder="Cumulative Progress"
                      />
                      <div className="invalid-feedback">{errors.progress?.message}</div>
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

export default AddReportForm;
