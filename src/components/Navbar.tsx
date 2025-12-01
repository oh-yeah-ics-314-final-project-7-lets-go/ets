/* eslint-disable react/jsx-indent, @typescript-eslint/indent */

'use client';

import { Role } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowRight, Lock, PersonFill } from 'react-bootstrap-icons';
import Image from 'next/image';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
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
      <Container className="px-0 mx-0">
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onClick={() => router.back()}
          className="flex ms-4 me-3"
          title="Click to navigate to the previous page."
          style={{
            cursor: 'pointer',
            textShadow: '2px 2px 2px rgba(0, 0, 0, 0.25)',
          }}
        >
          <svg className="my-auto" height={20} width={20} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <line strokeLinecap="round" x1={30} y1={55} x2={5} y2={30} strokeWidth={5} stroke="#fff" />
            <line strokeLinecap="round" x1={30} y1={5} x2={5} y2={30} strokeWidth={5} stroke="#fff" />
          </svg>
        </div>
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

            {currentUser && role !== 'ETS' && (
              <Nav.Link id="add-nav" href="/project/create" active={pathName === '/project/create'}>
                Create Project
              </Nav.Link>
        )}
            {currentUser && role === 'ETS' && (
              <Nav.Link id="admin-nav" href="/admin" key="admin" active={pathName === '/admin'}>
                User Management
              </Nav.Link>
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
                  Sign out
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-change-password" href="/auth/change-password">
                  <Lock />
                  Change password
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown id="login-dropdown" title="Login">
                <NavDropdown.Item id="login-dropdown-sign-in" href="/auth/signin">
                  <PersonFill />
                  Sign in
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
