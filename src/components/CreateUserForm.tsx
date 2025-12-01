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
import FormRequired from './FormRequired';

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
    <Container className="my-3">
      <Row className="justify-content-center">
        <Col xs={5}>
          <Col className="text-center mb-4">
            <div className="align-items-center mb-3">
              <h2>
                Create User
              </h2>
              <p className="text-muted">
                Create a new user account
              </p>
            </div>
          </Col>

          <Card className="form-Card">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>
                        First Name
                        <FormRequired />
                      </Form.Label>
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
                      <Form.Label>
                        Last Name
                        <FormRequired />
                      </Form.Label>
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
                  <Form.Label>
                    Email
                    <FormRequired />
                  </Form.Label>
                  <input
                    type="text"
                    placeholder="john.doe@example.com"
                    {...register('email')}
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.email?.message}</div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    User Type
                    <FormRequired />
                  </Form.Label>
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
                      <FormButton type="submit" variant="primary">
                        Create Account
                      </FormButton>
                    </Col>
                    <Col xs="auto">
                      <FormButton type="button" variant="cancel" href="/admin">
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

export default CreateUserForm;
