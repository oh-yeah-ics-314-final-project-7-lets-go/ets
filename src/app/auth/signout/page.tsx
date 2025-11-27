'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';

const SignOut = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  const user = session?.user as {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    randomKey?: string;
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '70vh' }}
    >
      <Card
        className="p-4 shadow-sm"
        style={{
          maxWidth: '400px',
          width: '100%',
          border: '3px solid #18828C',
          borderRadius: '12px',
        }}
      >
        <Card.Body className="text-center">
          <h3 className="mb-2">Sign Out</h3>
          <p className="text-muted mb-4">Are you sure you want to sign out?</p>

          {user && (
            <div className="mb-4">
              <h5 className="mb-1">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email}
              </h5>
              <div className="text-muted">{user.email}</div>
              {user.randomKey && (
                <div className="mt-2">
                  <span
                    className="badge text-white"
                    style={{ backgroundColor: '#18828C' }}
                  >
                    {user.randomKey}
                  </span>
                </div>
              )}
            </div>
          )}

          <Row className="g-2">
            <Col>
              <Button
                className="w-100"
                variant="primary"
                onClick={() => signOut({ callbackUrl: '/', redirect: true })}
              >
                Sign Out
              </Button>
            </Col>
            <Col>
              <Button
                variant="secondary"
                className="w-100"
                href="/"
                style={{
                  backgroundColor: '#4e4848',
                  borderColor: '#4e4848',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#444444';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4e4848';
                }}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SignOut;
