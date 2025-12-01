'use client';

import { useSession } from 'next-auth/react';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { editEvent } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import { EditEventSchema } from '@/lib/validationSchemas';
import { Event, Project } from '@prisma/client';
import { InferType } from 'yup';
import FormButton from '../FormButton';
import FormRequired from '../FormRequired';

type EditEventFormData = InferType<typeof EditEventSchema>;

const EditEventForm = ({ project, event }: { project: Project; event: Event }) => {
  const { status } = useSession();

  const onSubmit = async (data: EditEventFormData) => {
    await editEvent({ ...event, ...data });
    swal('Success', 'Event has been edited', 'success', { timer: 2000 });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditEventFormData>({
    resolver: yupResolver(EditEventSchema),
    mode: 'onChange',
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
                {`Edit "${event.name}" Event`}
              </h2>
              <p className="text-muted">
                {`Update event data for ${project.name}`}
              </p>
            </div>
          </Col>

          <Card className="form-Card">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('id')} value={event.id} />

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
                        defaultValue={event.name}
                      />
                      <div className="invalid-feedback">{errors.name?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Event Description
                        <FormRequired />
                      </Form.Label>
                      <input
                        type="text"
                        {...register('description')}
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        placeholder="Enter description of event"
                        defaultValue={event.description}
                      />
                      <div className="invalid-feedback">{errors.description?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

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
                        defaultValue={event.plannedStart.toISOString().split('T')[0]}
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
                        defaultValue={event.plannedEnd.toISOString().split('T')[0]}
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
                        defaultValue={event.actualStart?.toISOString().split('T')[0]}
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
                        defaultValue={event.actualEnd?.toISOString().split('T')[0]}
                      />
                      <div className="invalid-feedback">{errors.actualEnd?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col xs={6}>
                    <Form.Group className="mb-3 d-flex align-content-center">
                      <Form.Label className="mb-0">
                        Completed?
                      </Form.Label>
                      <input
                        className="ms-auto"
                        type="checkbox"
                        {...register('completed')}
                        defaultChecked={event.completed}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="form-group">
                  <Row className="pt-3">
                    <Col>
                      <FormButton type="submit" variant="primary">
                        Update Event
                      </FormButton>
                    </Col>
                    <Col className="d-flex justify-content-end">
                      <FormButton
                        type="button"
                        variant="cancel"
                        href={`/project/${project.id}/event/${event.id}`}
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

export default EditEventForm;
