import { Container, Row, Spinner } from 'react-bootstrap';

const LoadingSpinner = () => (
  <Container>
    <Row className="justify-content-md-center">
      <Spinner className="me-2" animation="border" />
      Getting data
    </Row>
  </Container>
);

export default LoadingSpinner;
