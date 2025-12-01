'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Container, Row, Col, Card } from 'react-bootstrap';
import { updateUser, getUserById } from '@/lib/dbActions';
import { Role } from '@prisma/client';
import FormButton from '@/components/FormButton';
import FormRequired from '@/components/FormRequired';

const EditUserPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('VENDOR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const user = await getUserById(userId);
      if (user) {
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setRole(user.role as Role);
      }
      setLoading(false);
    }
    fetchUser();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser = await updateUser(userId, {
      firstName,
      lastName,
      email,
      role,
    });

    if (updatedUser.role === 'ETS') {
      router.push('/admin');
    } else {
      router.push('/projects');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Container className="my-3">
      <Row className="justify-content-center">
        <Col xs={5}>
          <Col className="text-center mb-4">
            <div className="align-items-center mb-3">
              <h2>
                {`Edit ${firstName} ${lastName}'s Account`}
              </h2>
              <p className="text-muted">
                Update account data
              </p>
            </div>
          </Col>
          <Card className="form-Card">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Row>
                    <Col>
                      <Form.Label>
                        First Name
                        <FormRequired />
                      </Form.Label>
                      <Form.Control
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Label>
                        Last Name
                        <FormRequired />
                      </Form.Label>
                      <Form.Control
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Email
                    <FormRequired />
                  </Form.Label>
                  <Form.Control
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Role
                    <FormRequired />
                  </Form.Label>
                  <Form.Select
                    value={role}
                    onChange={e => setRole(e.target.value as Role)}
                  >
                    <option value="VENDOR">Vendor</option>
                    <option value="ETS">ETS</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="pt-3">
                  <Row className="justify-content-between">
                    <Col xs="auto">
                      <FormButton type="submit" variant="primary">
                        Update Account
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

export default EditUserPage;
