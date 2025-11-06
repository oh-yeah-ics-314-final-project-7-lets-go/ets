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
      bg="light"
      expand="lg"
      style={{
      backgroundColor: 'rgba(248, 249, 250, 1)',
      }}
    >
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <Image
            src="/HACC-with-Flag-final-1.png" // <-- just the path
            alt="HACC Logo"
            width={150}
            height={60}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto justify-content-start">
            {currentUser && (
              <Nav.Link id="profile-nav" href="/profile" active={pathName === '/profile'}>
                Profile
              </Nav.Link>
            )}

            <Nav.Link id="list-stuff-nav" href="/list" active={pathName === '/list'}>
              Reports
            </Nav.Link>

            {currentUser && (
              <Nav.Link id="add-stuff-nav" href="/add" active={pathName === '/add'}>
                Add Report
              </Nav.Link>
        )}
            {currentUser && (
              <Nav.Link id="dashboard-nav" href="/dashboard" active={pathName === '/dashboard'}>
                Dashboard
              </Nav.Link>
          )}
            {currentUser && role === 'ETS' ? (
              <Nav.Link id="admin-stuff-nav" href="/admin" key="admin" active={pathName === '/admin'}>
                Admin
              </Nav.Link>
            ) : (
              ''
            )}
            <Nav.Link id="about-nav" href="/about" active={pathName === '/about'}>
              About
            </Nav.Link>

            <Nav.Link id="help-nav" href="/help" active={pathName === '/help'}>
              Help
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
