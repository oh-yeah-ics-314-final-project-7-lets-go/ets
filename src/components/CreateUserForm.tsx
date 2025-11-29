'use client';

import { createUser } from '@/lib/dbActions';
import { yupResolver } from '@hookform/resolvers/yup';
import { Role } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import swal from 'sweetalert';
import FormButton from './FormButton';

type SignUpForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
};

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().required('Email is required').email('Email is invalid'),
  role: Yup.string().required('Role is required').oneOf([Role.ETS, Role.VENDOR]),
});

const CreateUserForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: yupResolver(validationSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: SignUpForm) => {
    const password = await createUser(data);
    await swal(
      'Success',
      `Please give the user the password for their account: ${password}`,
      'success',
      { timer: 2000 },
    );
    router.push('/admin');
  };

  return (
    <main>
      <Container>
        <Row className="justify-content-center">
          <Col xs={5}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <FormButton size="sm" variant="cancel" onClick={() => router.push('/admin')}>
                ← Back
              </FormButton>
              <h1 className="text-center mb-0">Create User</h1>
              <div style={{ width: '70px' }} />
            </div>

            <Card>
              <Card.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row className="mb-3">
                    <Col>
                      <Form.Group>
                        <Form.Label>First Name</Form.Label>
                        <input
                          type="text"
                          placeholder="John"
                          {...register('firstName')}
                          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">{errors.firstName?.message}</div>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <input
                          type="text"
                          placeholder="Doe"
                          {...register('lastName')}
                          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">{errors.lastName?.message}</div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <input
                      type="text"
                      placeholder="john.doe@example.com"
                      {...register('email')}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>User Type</Form.Label>
                    <Form.Select {...register('role')} className={`form-control ${errors.role ? 'is-invalid' : ''}`}>
                      <option value="" disabled selected>
                        Select a role
                      </option>
                      <option value={Role.ETS}>ETS Employee</option>
                      <option value={Role.VENDOR}>IV&V Vendor</option>
                    </Form.Select>
                    <div className="invalid-feedback">{errors.role?.message}</div>
                  </Form.Group>

                  <Form.Group className="pt-3">
                    <Row className="justify-content-between">
                      <Col xs="auto">
                        <FormButton type="submit" variant="primary" size="lg">
                          Create Account
                        </FormButton>
                      </Col>
                      <Col xs="auto">
                        <FormButton type="button" variant="cancel" size="lg" onClick={() => reset()}>
                          Reset
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
    </main>
  );
};

export default CreateUserForm;
