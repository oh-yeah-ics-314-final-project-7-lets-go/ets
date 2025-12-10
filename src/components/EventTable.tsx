'use client';

import { Event } from '@prisma/client';
import { useState } from 'react';
import { Button, Card, CardBody, CardHeader, Col, FormSelect, ListGroup, ListGroupItem, Row } from 'react-bootstrap';

interface EventTableProps {
  projectId: string;
  isApproved: boolean;
  events: Event[];
}

const EventTable = ({ projectId, isApproved, events }: EventTableProps) => {
  const [filter, setFilter] = useState<string>('MOST_URGENT');

  const getFilteredEvents = () => {
    let filtered = [...events];

    switch (filter) {
      case 'UNCOMPLETED':
        filtered = events.filter(event => !event.completed);
        break;
      case 'COMPLETED':
        filtered = events.filter(event => event.completed);
        break;
      case 'LATEST':
        filtered = events
          .sort((a, b) => new Date(b.plannedStart).getTime() - new Date(a.plannedStart).getTime())
          .slice(0, 5);
        break;
      case 'MOST_URGENT': {
        const today = new Date();
        filtered = events
          .filter(event => !event.completed && new Date(event.plannedEnd) >= today)
          .sort((a, b) => new Date(a.plannedEnd).getTime() - new Date(b.plannedEnd).getTime());
        break;
      }
      default:
        filtered = events.filter(event => !event.completed);
    }

    return filtered.sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime());
  };

  const sortedEvents = getFilteredEvents();

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Row className="mt-4">
      <Col>
        <Card>
          <CardHeader className="d-flex gap-2 align-items-center">
            <h3 className="mb-0">Events</h3>
            <div className="ms-auto d-flex gap-2">
              <FormSelect
                size="sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="UNCOMPLETED">Uncompleted</option>
                <option value="COMPLETED">Completed</option>
                <option value="LATEST">Latest 5</option>
                <option value="MOST_URGENT">Most Urgent</option>
              </FormSelect>
            </div>
            {!isApproved && (
            <Button
              variant="outline-primary"
              size="sm"
              href={`/project/${projectId}/event/create`}
            >
              Add Event
            </Button>
            )}
          </CardHeader>
          <CardBody>
            <ListGroup>
              {sortedEvents.map((event) => (
                <ListGroupItem key={event.id}>
                  <div className="d-flex w-100 justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        <span className="align-middle">{event.name}</span>
                        {event.completed && (
                          <span className="badge bg-success ms-2">Completed</span>
                        )}
                      </h6>
                      <p className="mb-1">{event.description}</p>
                      <small className="text-muted">
                        Planned:
                        {' '}
                        {formatDate(event.plannedStart)}
                        {' '}
                        -
                        {' '}
                        {formatDate(event.plannedEnd)}
                        {event.actualStart && (
                          <>
                            {' '}
                            | Actual:
                            {' '}
                            {formatDate(event.actualStart)}
                            {event.actualEnd && ` - ${formatDate(event.actualEnd)}`}
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                </ListGroupItem>
              ))}
            </ListGroup>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EventTable;
