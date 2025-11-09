import { Container } from 'react-bootstrap';
import Dashboard from '@/components/dashboard/Dashboard';

/** Render a list of stuff for the logged in user. */
const DashboardPage = async () => {
  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Dashboard />
      </Container>
    </main>
  );
};

export default DashboardPage;
