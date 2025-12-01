'use client';

import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { Project } from '@prisma/client';
import { EditProjectSchema } from '@/lib/validationSchemas';
import { editProject } from '@/lib/dbActions';
import FormButton from '@/components/FormButton';
import FormRequired from '../FormRequired';

type EditProjectFormData = {
  id: number;
  name: string;
  description: string;
  originalContractAward: number;
};

const EditProjectForm = ({ project }: { project: Project }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProjectFormData>({
    resolver: yupResolver(EditProjectSchema),
    defaultValues: {
      id: project.id,
      name: project.name,
      description: project.description,
      originalContractAward: project.originalContractAward,
    },
  });

  const onSubmit = async (data: EditProjectFormData) => {
    await editProject(data as Project);
    swal('Success', 'IV&V Project Report has been updated', 'success', {
      timer: 2000,
    });
  };

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={8}>
          <Col className="text-center mb-4">
            <div className="align-items-center mb-3">
              <h2>
                {`Edit "${project.name}" Project`}
              </h2>
              <p className="text-muted">
                {`Update project data for ${project.name}`}
              </p>
            </div>
          </Col>

          <Card className="form-Card">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('id')} />

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Project Name
                        <FormRequired />
                      </Form.Label>
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
                      <Form.Label>
                        Original Contract Award ($)
                        <FormRequired />
                      </Form.Label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('originalContractAward')}
                        className={`form-control ${errors.originalContractAward ? 'is-invalid' : ''}`}
                        placeholder="0.00"
                      />
                      <div className="invalid-feedback">{errors.originalContractAward?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Description
                        <FormRequired />
                      </Form.Label>
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
                      <FormButton type="submit" variant="primary">
                        Update Report
                      </FormButton>
                    </Col>
                    <Col className="d-flex justify-content-end gap-2">
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

export default EditProjectForm;
