'use client';

import { useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { editReport, reportAlreadyExists } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { EditReportSchema } from '@/lib/validationSchemas';
import { InferType } from 'yup';
import { Project, Report } from '@prisma/client';
import { reportName } from '@/lib/util';
import FormButton from '../FormButton';
import FormRequired from '../FormRequired';

type EditReportFormData = InferType<typeof EditReportSchema>;

const EditReportForm = ({ project, report }: { project: Project, report: Report }) => {
  const { status } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<EditReportFormData>({
    resolver: yupResolver(EditReportSchema),
    defaultValues: {
      ...report,
    },
  });

  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  const onSubmit = async (data: EditReportFormData) => {
    const existingReport = await reportAlreadyExists({ ...data, projectId: project.id });
    // let the user change the month/year but NOT to the month/year of another report for the same project.
    if (existingReport && existingReport.id !== report.id) {
      setError('yearCreate', { message: 'A report with this year and month already exists.' });
      setError('monthCreate', { message: 'A report with this year and month already exists.' });
    } else {
      await editReport(data);
      swal('Success', 'Report was edited', 'success', {
        timer: 2000,
      });
    }
  };

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={8}>
          <Col className="text-center mb-4">
            <div className="align-items-center mb-3">
              <h2>
                {`Edit ${reportName(report)} for "${project.name}"`}
              </h2>
              <p className="text-muted">
                {`Update the report data for ${project.name}`}
              </p>
            </div>
          </Col>
          <Card className="form-Card">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('id')} value={report.id} required />
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Year Created
                        <FormRequired />
                      </Form.Label>
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
                      <Form.Label>
                        Month Created
                        <FormRequired />
                      </Form.Label>
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
                      <Form.Label>
                        Amount Invoiced up to now ($)
                        <FormRequired />
                      </Form.Label>
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
                      <Form.Label>
                        Progress (%)
                        <FormRequired />
                      </Form.Label>
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
                      <Button type="submit" variant="primary">
                        Update Report
                      </Button>
                    </Col>
                    <Col>
                      <FormButton
                        type="button"
                        href={`/project/${project.id}/report/${report.id}`}
                        variant="cancel"
                        className="float-end"
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

export default EditReportForm;
