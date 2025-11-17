'use client';

import { deleteEvent, deleteIssue } from '@/lib/dbActions';
import { Event, Issue, Project } from '@prisma/client';
import { Button, Card, CardBody, CardFooter, CardHeader, CardText, Col, Container, Row } from 'react-bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';
import AddCommentForm from '../comment/AddCommentForm';
import CommentForm, { CommentWithUser } from '../comment/CommentForm';

const ProjectPage = ({
  firstRaised,
  updatedAt,
  id,
  name,
  originalContractAward,
  progress,
  totalPaidOut,
  creatorId,
  issues,
  events,
  comments,
}: Project & {
  issues: Issue[];
  events: Event[];
  comments: CommentWithUser[];
}) => (
  <Container>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <Button variant="outline-secondary" href={`/projects/${id}`}>
        ← Back to Overview
      </Button>
      <div style={{ width: '140px' }} />
    </div>
    <Row>
      <Col>
        <h2>Issues</h2>
        <Button variant="outline-success" href={`/project/${id}/issue/create`}>
          Add an issue
        </Button>
        {issues.map(i => (
          <Card key={`issue${i.id}`}>
            <CardHeader>
              {`Created by user ${i.creatorId}`}
              <Button className="ms-2" variant="warning" href={`/project/${id}/issue/${i.id}/edit`}>
                <Pencil />
              </Button>
              <Button className="ms-2" variant="danger" onClick={() => deleteIssue(i.id)}>
                <Trash />
              </Button>
            </CardHeader>
            <CardText>
              {`Currently ${i.status}`}
            </CardText>
            <CardBody>
              <h3>Description</h3>
              {i.description}
              <br />
              <h3>Remedy</h3>
              {i.remedy}

              <br />
              <h3>Likelihood</h3>
              {i.likelihood}
              <br />
              <h3>Severity</h3>
              {i.severity}
            </CardBody>
            <CardFooter>
              Created
              {' '}
              {i.firstRaised.toDateString()}
              <br />
              Updated
              {' '}
              {i.updatedAt.toDateString()}
            </CardFooter>
          </Card>
        ))}
      </Col>
      <Col>
        <h2>events</h2>
        <Button variant="outline-success" className="w-auto mb-3" href={`/project/${id}/event/create`}>
          Add an event
        </Button>
        {events.map(e => (
          <Card key={`event${e.id}`} className="mb-3">
            <CardHeader>
              {e.name}
              <Button className="ms-2" variant="warning" href={`/project/${id}/event/${e.id}/edit`}>
                <Pencil />
              </Button>
              <Button className="ms-2" variant="danger" onClick={() => deleteEvent(e.id)}>
                <Trash />
              </Button>
            </CardHeader>
            <CardBody>
              {e.description}
            </CardBody>
            <CardFooter>
              {e.completed ? 'Completed' : 'In progress'}
              <br />
              Planned to start
              {' '}
              {e.plannedStart.toDateString()}
              <br />
              Planned to end
              {' '}
              {e.plannedEnd.toDateString()}
              <br />
              {e.actualStart && (
                <>
                  Actually starts
                  {' '}
                  {e.actualStart.toDateString()}
                  <br />
                </>
              )}
              {e.actualEnd && (
                <>
                  Actually ends
                  {' '}
                  {e.actualEnd.toDateString()}
                  <br />
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </Col>
      <Col>
        <h2>comments</h2>
        {comments.map((c) => (
          <CommentForm {...c} />
        ))}
        <AddCommentForm project={{
          firstRaised,
          updatedAt,
          id,
          name,
          originalContractAward,
          progress,
          totalPaidOut,
          creatorId,
        }}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <h1 className="mb-0">{`About ${name} (${id})`}</h1>
        <p>{firstRaised.toLocaleString()}</p>
        <h2>first raised</h2>
        <p>{firstRaised.toLocaleString()}</p>
        <h2>last updated</h2>
        <p>{updatedAt.toLocaleString()}</p>
        <h2>original contract award</h2>
        <p>{`$${originalContractAward}`}</p>
        <h2>total paid out</h2>
        <p>{`$${totalPaidOut}`}</p>
        <h2>progress</h2>
        <p>{`${progress}%`}</p>
      </Col>
    </Row>
  </Container>
);

export default ProjectPage;
