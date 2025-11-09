'use client';

import { useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { addEvent } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AddEventSchema } from '@/lib/validationSchemas';
import { Project } from '@prisma/client';
import { InferType } from 'yup';

type AddEventFormData = InferType<typeof AddEventSchema>;

const onSubmit = async (data: AddEventFormData) => {
  await addEvent(data);
  swal('Success', 'Event has been submitted', 'success', {
    timer: 2000,
  });
};

const AddEventForm = ({ project }: { project: Project; }) => {
  const { status } = useSession();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AddEventSchema),
    mode: 'onChange',
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
            <h2>Create Event</h2>
            <p className="text-muted">
              {`Add an event for ${project.name}`}
            </p>
          </Col>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('projectId')} value={project.id} />
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Event Name</Form.Label>
                      <input
                        type="text"
                        {...register('name')}
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="Enter name of event"
                      />
                      <div className="invalid-feedback">{errors.name?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Event Description</Form.Label>
                      <input
                        type="text"
                        {...register('description')}
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        placeholder="Enter description of event"
                      />
                      <div className="invalid-feedback">{errors.description?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Planned Start Date</Form.Label>
                      <input
                        type="date"
                        {...register('plannedStart')}
                        className={`form-control ${errors.plannedStart ? 'is-invalid' : ''}`}
                        placeholder="Set planned start date for event"
                      />
                      <div className="invalid-feedback">{errors.plannedStart?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Planned End Date</Form.Label>
                      <input
                        type="date"
                        {...register('plannedEnd')}
                        className={`form-control ${errors.plannedEnd ? 'is-invalid' : ''}`}
                        placeholder="Set planned end date for event"
                      />
                      <div className="invalid-feedback">{errors.plannedEnd?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Actual Start Date</Form.Label>
                      <input
                        type="date"
                        {...register('actualStart')}
                        className={`form-control ${errors.actualStart ? 'is-invalid' : ''}`}
                        placeholder="Set actual start date for event"
                      />
                      <div className="invalid-feedback">{errors.actualStart?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Actual End Date</Form.Label>
                      <input
                        type="date"
                        {...register('actualEnd')}
                        className={`form-control ${errors.actualEnd ? 'is-invalid' : ''}`}
                        placeholder="Set actual end date for event"
                      />
                      <div className="invalid-feedback">{errors.actualEnd?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Completed?</Form.Label>
                    <input type="checkbox" {...register('completed')} />
                  </Form.Group>
                </Row>

                <Form.Group className="form-group">
                  <Row className="pt-3">
                    <Col>
                      <Button type="submit" variant="primary" size="lg">
                        Create Event
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

export default AddEventForm;
