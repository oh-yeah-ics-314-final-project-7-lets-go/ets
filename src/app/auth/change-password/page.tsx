'use client';

import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { changePassword } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';
import FormRequired from '@/components/FormRequired';
import FormButton from '@/components/FormButton';

type ChangePasswordForm = {
  oldpassword: string;
  password: string;
  confirmPassword: string;
  // acceptTerms: boolean;
};

/** The change password page. */
const ChangePassword = () => {
  const { data: session, status } = useSession();
  const email = session?.user?.email || '';
  const validationSchema = Yup.object().shape({
    oldpassword: Yup.string().required('Password is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(40, 'Password must not exceed 40 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password'), ''], 'Confirm Password does not match'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    // console.log(JSON.stringify(data, null, 2));
    await changePassword({ email, ...data });
    await swal('Password Changed', 'Your password has been changed', 'success', { timer: 2000 });
    reset();
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <main>
      <Container className="py-3">
        <Row className="justify-content-center">
          <Col xs={5}>
            <h2 className="text-center mb-3">Change Password</h2>
            <Card className="form-Card">
              <Card.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="form-group mb-3">
                    <Form.Label>
                      Old Password
                      <FormRequired />
                    </Form.Label>
                    <input
                      type="password"
                      {...register('oldpassword')}
                      className={`form-control ${errors.oldpassword ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.oldpassword?.message}</div>
                  </Form.Group>

                  <Form.Group className="form-group mb-3">
                    <Form.Label>
                      New Password
                      <FormRequired />
                    </Form.Label>
                    <input
                      type="password"
                      {...register('password')}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.password?.message}</div>
                  </Form.Group>
                  <Form.Group className="form-group mb-3">
                    <Form.Label>
                      Confirm Password
                      <FormRequired />
                    </Form.Label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                  </Form.Group>
                  <Form.Group className="pt-3">
                    <Row className="justify-content-between">
                      <Col xs="auto">
                        <FormButton type="submit" variant="primary">
                          Change Password
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
    </main>
  );
};

export default ChangePassword;
