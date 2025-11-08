'use client';

import { Col, Container, Row } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import Image from 'next/image';

/** The Home page. */
const Home = () => (
  <main>
    <Container id="landing-page" fluid className="py-3">
      <Row className="justify-content-center">
        <Col
          md={8}
          className="mx-auto p-4"
          style={{ backgroundColor: '#f0f0f0', borderRadius: '8px' }}
        >
          {/* Header Row */}
          <Row
            className="align-items-center mb-3"
            style={{ height: '16.66vh', backgroundColor: '#F5D25A', padding: '0.5rem' }}
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
                    backgroundColor: '#4D76A4',
                    color: 'white',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3b5d82')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4D76A4')}
                >
                  <Search size={18} />
                </button>
              </div>

            </Col>
          </Row>

          {/* Summary Section */}
          <Row className="my-4">
            <Col className="text-center">
              <h4 style={{ fontWeight: '600' }}>Welcome to the ETS Report Cnter</h4>
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
                Placeholder for future graph 1 and description
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
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            </Col>
          </Row>

          <Row className="text-center align-items-center">
            <Col md={6} className="p-3">
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#dcdcdc',
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
            {/* Row 2: Text left, Graph right */}
            <Col md={6} className="p-3 d-flex flex-column justify-content-center">
              <p className="mt-2">
                Placeholder for future graph 4 and description
              </p>
            </Col>
            <Col md={6} className="p-3">
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#dcdcdc',
                  borderRadius: '8px',
                }}
              />
            </Col>
          </Row>

          <Row className="text-center">
            <Col className="p-3">
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#dcdcdc',
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
