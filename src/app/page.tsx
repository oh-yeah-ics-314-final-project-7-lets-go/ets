'use client';

import { Button, Col, Container, Row } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** The Home page. */
const Home = () => {
  const router = useRouter();

  const [query, setQuery] = useState('');

  return (
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
                <form
                  className="input-group"
                  style={{ width: '200px' }}
                  onSubmit={() => router.push(`/dashboard?search=${query}`)}
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    className="form-control"
                    style={{ fontSize: '14px' }}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button
                    type="submit"
                    style={{
                      backgroundColor: '#18828C',
                      color: 'white',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#175450')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#18828C')}
                  >
                    <Search size={18} />
                  </Button>
                </form>

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
                  This graph is a semi-circular progress chart showing the overall project completion.
                  The green portion represents the percentage of work completed,
                  while the gray portion shows the remaining tasks yet to be finished.
                </p>
              </Col>

              <Col md={6} className="p-3">
                <Image
                  src="/Screenshot_10-12-2025_115020_pseudo-hacc-ets.vercel.app.jpeg"
                  alt="Graph 2"
                  width={600}
                  height={230}
                  style={{
                    width: '100%',
                    height: '230px',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    borderRadius: '8px',
                  }}
                />
              </Col>

            </Row>

            <Row className="text-center align-items-center">
              <Col md={6} className="p-3">
                <Image
                  src="/Screenshot_10-12-2025_11468_pseudo-hacc-ets.vercel.app.jpeg"
                  alt="Graph 3"
                  width={600}
                  height={420}
                  style={{
                    width: '100%',
                    height: '420px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
              </Col>
              <Col md={6} className="p-3 d-flex flex-column justify-content-center">
                <p className="mt-2">
                  This bar graph compares project spending to the original contract amount.
                  The left bar shows how much has been spent so far,
                  while the right bar represents the total funding provided in the original contract.
                </p>
              </Col>
            </Row>

            <Row className="text-center">
              <Col className="p-3">
                <Image
                  src="/Screenshot_10-12-2025_115143_pseudo-hacc-ets.vercel.app.jpeg"
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
                <p className="mt-2">
                  This timeline displays the key events and milestones of the project in chronological order,
                  showing when major tasks were started, completed, or scheduled.
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default Home;
