/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { Role } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowRight, Lock, PersonFill, PersonPlusFill } from 'react-bootstrap-icons';
import Image from 'next/image';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { firstName: string; lastName: string; email: string; randomKey: string };
  const role = userWithRole?.randomKey as Role;
  const pathName = usePathname();
  return (
    <Navbar
      className="py-1"
      bg="light"
      expand="lg"
    >
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <Image
            src="/ETS-logo.png"
            alt="ETS Logo"
            width={45}
            height={45}
          />
          <div className="text-center px-2 d-sm-none d-md-block">
            <div className="fw-bold" style={{ fontSize: '0.8em' }}>State of Hawai‘i</div>
            <div style={{ fontSize: '0.7em' }}>ETS Report Center</div>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto justify-content-start">
            {currentUser && (
              <Nav.Link id="projects-nav" href="/projects" active={pathName === '/projects'}>
                Projects
              </Nav.Link>
            )}
            <Nav.Link id="dashboard-nav" href="/dashboard" active={pathName === '/dashboard'}>
                Dashboard
            </Nav.Link>

            {currentUser && (
              <Nav.Link id="add-nav" href="/project/create" active={pathName === '/project/create'}>
                Create Project
              </Nav.Link>
        )}
            {currentUser && role === 'ETS' ? (
              <Nav.Link id="admin-nav" href="/admin" key="admin" active={pathName === '/admin'}>
                User Management
              </Nav.Link>
            ) : (
              ''
            )}
            <Nav.Link id="about-nav" href="https://oh-yeah-ics-314-final-project-7-lets-go.github.io/">
              About
            </Nav.Link>
          </Nav>
          <Nav>
            {session ? (
              <NavDropdown id="login-dropdown" title={`${userWithRole.firstName} ${userWithRole.lastName}`}>
                <NavDropdown.Item id="login-dropdown-sign-out" href="/api/auth/signout">
                  <BoxArrowRight />
                  Sign Out
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-change-password" href="/auth/change-password">
                  <Lock />
                  Change Password
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown id="login-dropdown" title="Login">
                <NavDropdown.Item id="login-dropdown-sign-in" href="/auth/signin">
                  <PersonFill />
                  Sign in
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-sign-up" href="/auth/signup">
                  <PersonPlusFill />
                  Sign up
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
