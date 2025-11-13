'use client';

import { Col, Container, Nav } from 'react-bootstrap';
import { usePathname } from 'next/navigation';

/** The Footer appears at the bottom of every page. Rendered by the App Layout component. */
const Footer = () => {
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
              Report
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
            <Nav.Link
              href="/admin"
              active={pathName === '/admin'}
              className="text-decoration-none text-secondary mx-2"
            >
              Admin
            </Nav.Link>
            <Nav.Link
              href="/about"
              active={pathName === '/about'}
              className="text-decoration-none text-secondary mx-2"
            >
              About
            </Nav.Link>
            <Nav.Link
              href="/help"
              active={pathName === '/help'}
              className="text-decoration-none text-secondary mx-2"
            >
              Help
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
