'use client';

import { Col, Container, Row } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import Image from 'next/image';

/** The Home page. */
const Home = () => (
  <main>
    <Container id="landing-page" fluid className="py-4">
      <Row className="justify-content-center">
        <Col
          md={8}
          className="mx-auto bg-dark-subtle rounded-3"
        >
          {/* Header Row */}
          <Row
            className="align-items-center mb-3 rounded-top-3 ps-3 text-black"
            style={{ height: '10vh', backgroundColor: '#F5D25A', padding: '0.5rem' }}
          >

            {/* Header Text */}
            <Col className="d-flex align-items-center">
              <h2 className="mb-0" style={{ fontSize: '30px' }}>ETS Report Center</h2>
            </Col>

            {/* Search bar */}
            <Col xs="auto">
              <div className="input-group" style={{ width: '200px' }}>
                <input
                  type="text"
                  placeholder="Search..."
                  className="form-control"
                  style={{ fontSize: '14px' }}
                />
                <button
                  className="btn"
                  type="button"
                  style={{
                    backgroundColor: '#18828C',
                    color: 'white',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#175450')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#18828C')}
                >
                  <Search size={18} />
                </button>
              </div>

            </Col>
          </Row>

          {/* Summary Section */}
          <Row className="my-4">
            <Col className="text-center">
              <h4 style={{ fontWeight: '600' }}>Welcome to the ETS Report Center</h4>
              <p style={{ fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
                This site is for the submission and viewing of IV&V Vendor&apos;s monthly project report.
                The goal is to organize and change all the data from the reports
                to a standardized form for easier access and viewing.
              </p>
            </Col>
          </Row>

          {/* Graphs */}
          <Row className="text-center align-items-center">
            <Col md={6} className="p-3">
              <Image
                src="/41-e1731705856149.png"
                alt="Graph placeholder"
                width={600}
                height={200}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            </Col>
            <Col md={6} className="p-3 d-flex flex-column justify-content-center">
              <p className="mt-2">
                This site is designed with the purpose of making submitting IV&V Vendor&apos;s monthly
                project report more standardized and straightforward.
                It is to help create a set of details so a different report from different vendors can
                be read in the same format making the process more streamlined.
              </p>
            </Col>
          </Row>

          <Row className="text-center align-items-center">
            <Col md={6} className="p-3 d-flex flex-column justify-content-center">
              <p className="mt-2">
                Placeholder for future graph 2 and description
              </p>
            </Col>

            <Col md={6} className="p-3">
              <Image
                src="/Screenshot 2025-11-08 071927.png"
                alt="Graph 2"
                width={600}
                height={220}
                style={{
                  width: '100%',
                  height: '230px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            </Col>
          </Row>

          <Row className="text-center align-items-center">
            <Col md={6} className="p-3">
              <Image
                src="/Screenshot 2025-11-08 224257.png"
                alt="Graph 3"
                width={600}
                height={300}
                style={{
                  width: '100%',
                  height: '260px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            </Col>
            <Col md={6} className="p-3 d-flex flex-column justify-content-center">
              <p className="mt-2">
                Placeholder for future graph 3 and description
              </p>
            </Col>
          </Row>

          <Row className="text-center align-items-center">
            <Col md={6} className="p-3 d-flex flex-column justify-content-center">
              <p className="mt-2">
                Placeholder for future graph 4 and description
              </p>
            </Col>
            <Col md={6} className="p-3">
              <Image
                src="/Screenshot 2025-11-08 072936.png"
                alt="Graph 4"
                width={600}
                height={250}
                style={{
                  width: '100%',
                  height: '240px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            </Col>
          </Row>

          <Row className="text-center">
            <Col className="p-3">
              <Image
                src="/Screenshot 2025-11-08 224333.png"
                alt="Graph 5"
                width={600}
                height={300}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
              <p className="mt-2">Placeholder for future graph 5 and description</p>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  </main>

);

export default Home;
