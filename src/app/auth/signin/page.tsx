'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row, Alert, InputGroup, Modal } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

const SignIn = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };

    const email = target.email.value;
    const password = target.password.value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/projects',
    });

    if (result?.error) {
      setError('Wrong email or password.');
      setLoading(false);
      return;
    }

    window.location.href = '/projects';
  };

  return (
    <main>
      <Container>
        <Row className="justify-content-center">
          <Col xs={5}>
            <h1 className="text-center">Sign In</h1>
            <Card>
              <Card.Body>

                {error && (
                  <Alert variant="danger" className="text-center">
                    {error}
                  </Alert>
                )}

                <Form method="post" onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      name="email"
                      type="text"
                      placeholder="Enter your email"
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label>Password</Form.Label>

                    <InputGroup>
                      <Form.Control
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                      />

                      <InputGroup.Text
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          backgroundColor: '#4D76A4',
                          borderColor: '#4D76A4',
                          color: 'white',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#395878';
                          e.currentTarget.style.borderColor = '#395878';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#4D76A4';
                          e.currentTarget.style.borderColor = '#4D76A4';
                        }}
                      >
                        {showPassword ? <EyeSlash /> : <Eye />}
                      </InputGroup.Text>
                    </InputGroup>

                    <div className="text-end mt-1">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          color: '#0d6efd',
                          textDecoration: 'underline',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="mt-3 w-100"
                    disabled={loading}
                    style={{
                      backgroundColor: '#4D76A4',
                      borderColor: '#4D76A4',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#395878';
                      e.currentTarget.style.borderColor = '#395878';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#4D76A4';
                      e.currentTarget.style.borderColor = '#4D76A4';
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Form>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showForgotModal} onHide={() => setShowForgotModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Forgot Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This feature is not yet implemented.
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{
              backgroundColor: '#4D76A4',
              borderColor: '#4D76A4',
            }}
            onClick={() => setShowForgotModal(false)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#395878';
              e.currentTarget.style.borderColor = '#395878';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4D76A4';
              e.currentTarget.style.borderColor = '#4D76A4';
            }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default SignIn;
