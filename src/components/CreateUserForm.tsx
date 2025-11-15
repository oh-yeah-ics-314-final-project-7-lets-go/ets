'use client';

import { createUser } from '@/lib/dbActions';
import { yupResolver } from '@hookform/resolvers/yup';
import { Role } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

type SignUpForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  // acceptTerms: boolean;
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
    // console.log(JSON.stringify(data, null, 2));
    const password = await createUser(data);
    // After creating, signIn with redirect to the add page
    await swal('Success', `Please give the user the password for their account: ${password}`, 'success', {
      timer: 2000,
    });
    router.push('/admin');
    // await signIn('credentials', { callbackUrl: '/add', ...data });
  };

  return (
    <main>
      <Container>
        <Row className="justify-content-center">
          <Col xs={5}>
            <h1 className="text-center">Create User</h1>
            <Card>
              <Card.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row>
                    <Col>
                      <Form.Group className="form-group">
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
                      <Form.Group className="form-group">
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
                  <Form.Group className="form-group">
                    <Form.Label>Email</Form.Label>
                    <input
                      type="text"
                      placeholder="john.doe@example.com"
                      {...register('email')}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group">
                    <Form.Label>User Type</Form.Label>
                    <Form.Select {...register('role')} className={`form-control ${errors.role ? 'is-invalid' : ''}`}>
                      <option selected disabled>Select a role</option>
                      <option value={Role.ETS}>ETS Employee</option>
                      <option value={Role.VENDOR}>IV&V Vendor</option>
                    </Form.Select>
                    <div className="invalid-feedback">{errors.role?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group py-3">
                    <Row>
                      <Col>
                        <Button type="submit" className="btn btn-primary">
                          Create account
                        </Button>
                      </Col>
                      <Col className="d-flex">
                        <Button type="button" onClick={() => reset()} className="btn btn-warning float-right">
                          Reset
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
    </main>
  );
};

export default CreateUserForm;
