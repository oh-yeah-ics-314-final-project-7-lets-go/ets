'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Form, Container } from 'react-bootstrap';
import { updateUser, getUserById } from '@/lib/dbActions';
import { Role } from '@prisma/client';

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

    // Redirect depending on updated role
    if (updatedUser.role === 'ETS') {
      router.push('/admin'); // still an admin
    } else {
      router.push('/reports'); // no longer an admin
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Container className="py-3">
      <h2>Edit User</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Label>First Name</Form.Label>
          <Form.Control value={firstName} onChange={e => setFirstName(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Last Name</Form.Label>
          <Form.Control value={lastName} onChange={e => setLastName(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Email</Form.Label>
          <Form.Control value={email} onChange={e => setEmail(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Role</Form.Label>
          <Form.Select value={role} onChange={e => setRole(e.target.value as Role)}>
            <option value="VENDOR">Vendor</option>
            <option value="ETS">ETS</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit">Save Changes</Button>
      </Form>
    </Container>
  );
};

export default EditUserPage;
