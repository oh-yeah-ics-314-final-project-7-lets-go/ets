'use client';

import { useSession } from 'next-auth/react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { addEvent } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import FormButton from '@/components/FormButton';
import { AddEventSchema } from '@/lib/validationSchemas';
import { Project } from '@prisma/client';
import { InferType } from 'yup';
import FormRequired from '../FormRequired';

type AddEventFormData = InferType<typeof AddEventSchema>;

const AddEventForm = ({ project }: { project: Project }) => {
  const { status } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddEventFormData>({
    resolver: yupResolver(AddEventSchema),
    mode: 'onChange',
  });

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'unauthenticated') redirect('/auth/signin');

  const onSubmit = async (data: AddEventFormData) => {
    await addEvent(data);
    swal('Success', 'Event has been submitted', 'success', { timer: 2000 });
  };

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={8}>
          <Col className="text-center mb-4">
            <div className="align-items-center mb-3">
              <h2>
                Create Event
              </h2>
              <p className="text-muted">
                Create an event for
                {' '}
                <i>{project.name}</i>
              </p>
            </div>
          </Col>

          <Card className="form-Card">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('projectId')} value={project.id} />

                {/* Event Name */}
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Event Name
                        <FormRequired />
                      </Form.Label>
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

                {/* Event Description */}
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Event Description
                        <FormRequired />
                      </Form.Label>
                      <textarea
                        {...register('description')}
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        placeholder="Enter description of event"
                      />
                      <div className="invalid-feedback">{errors.description?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Planned Dates */}
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Planned Start Date
                        <FormRequired />
                      </Form.Label>
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
                      <Form.Label>
                        Planned End Date
                        <FormRequired />
                      </Form.Label>
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

                {/* Actual Dates */}
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

                {/* Completed */}
                <Row>
                  <Col xs={6}>
                    <Form.Group className="mb-3 d-flex align-content-center">
                      <Form.Label className="mb-0">
                        Completed?
                      </Form.Label>
                      <input className="ms-auto" type="checkbox" {...register('completed')} />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Buttons */}
                <Form.Group className="form-group">
                  <Row className="pt-3">
                    <Col>
                      <FormButton type="submit" variant="primary">
                        Create Event
                      </FormButton>
                    </Col>
                    <Col className="d-flex justify-content-end">
                      <FormButton
                        type="button"
                        variant="cancel"
                        href={`/project/${project.id}`}
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

export default AddEventForm;
