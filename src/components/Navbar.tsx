'use client';

import { Role } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowRight, CaretLeftFill, Lock, MoonFill, PersonFill, SunFill } from 'react-bootstrap-icons';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { useColorScheme } from '@mui/material/styles';

const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const currentUser = session?.user?.email;
  const userWithRole = session?.user as { firstName: string; lastName: string; email: string; randomKey: string };
  const role = userWithRole?.randomKey as Role;
  const pathName = usePathname();
  const themeState = useTheme();
  const { setMode } = useColorScheme();

  return (
    <Navbar
      className="py-1"
      bg="light"
      expand="lg"
    >
      <Container fluid className="px-0 mx-3">
        <Navbar.Brand>
          <Button
            onClick={() => router.back()}
            title="Click to navigate to the previous page."
            style={{
              cursor: 'pointer',
              textShadow: '2px 2px 2px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="d-flex py-1">
              <CaretLeftFill />
            </div>
          </Button>
        </Navbar.Brand>
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
                  <BoxArrowRight className="me-1" />
                  <span className="align-middle">Sign out</span>
                </NavDropdown.Item>
                <NavDropdown.Item id="login-dropdown-change-password" href="/auth/change-password">
                  <Lock className="me-1" />
                  <span className="align-middle">Change password</span>
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown id="login-dropdown" title="Login">
                <NavDropdown.Item id="login-dropdown-sign-in" href="/auth/signin">
                  <PersonFill className="me-1" />
                  <span className="align-middle">Sign in</span>
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <Navbar.Brand className="me-0">
            <Button
              title={themeState?.[0] ? 'Dim the lights' : 'Turn on the lights'}
              onClick={() => {
                themeState?.[1](!themeState[0]);
                setMode(!themeState?.[0] ? 'dark' : 'light');
              }}
            >
              <div className="d-flex py-1">
                {themeState?.[0] ? <SunFill /> : <MoonFill />}
              </div>
            </Button>
          </Navbar.Brand>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
