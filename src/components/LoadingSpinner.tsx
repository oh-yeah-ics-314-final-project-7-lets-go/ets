import { Spinner } from 'react-bootstrap';

const LoadingSpinner = () => (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{
      zIndex: 1050,
      pointerEvents: 'none',
    }}
  >
    <Spinner animation="border" className="me-2" role="status" />
    Loading...
  </div>
);

export default LoadingSpinner;
