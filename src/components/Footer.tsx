'use client';

import { Col, Container, Nav } from 'react-bootstrap';
import { usePathname } from 'next/navigation';
import { Role } from '@prisma/client';
import { useSession } from 'next-auth/react';

/** The Footer appears at the bottom of every page. Rendered by the App Layout component. */
const Footer = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { firstName: string; lastName: string; email: string; randomKey: string };
  const role = userWithRole?.randomKey as Role;
  const pathName = usePathname();

  return (
    <footer className="mt-auto py-3 bg-light border-top">
      <Container>
        <Col className="text-center">
          <Nav className="justify-content-center">
            <Nav.Link
              href="/reports"
              active={pathName === '/reports'}
              className="text-decoration-none text-secondary mx-2"
            >
              Reports
            </Nav.Link>
            <Nav.Link
              href="/add"
              active={pathName === '/add'}
              className="text-decoration-none text-secondary mx-2"
            >
              Add Report
            </Nav.Link>
            <Nav.Link
              href="/dashboard"
              active={pathName === '/dashboard'}
              className="text-decoration-none text-secondary mx-2"
            >
              Dashboard
            </Nav.Link>
            {currentUser && role === 'ETS' ? (
              <Nav.Link
                id="admin-nav"
                href="/admin"
                key="admin"
                active={pathName === '/admin'}
                className="text-decoration-none text-secondary mx-2"
              >
                User Management
              </Nav.Link>
            ) : (
              ''
            )}
            <Nav.Link
              href="/about"
              active={pathName === '/about'}
              className="text-decoration-none text-secondary mx-2"
            >
              About
            </Nav.Link>
          </Nav>

          <br />

          <a href="https://oh-yeah-ics-314-final-project-7-lets-go.github.io/">
            Project Homepage
          </a>
        </Col>
      </Container>
    </footer>
  );
};

export default Footer;
