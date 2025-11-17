'use client';

import { Event } from '@prisma/client';
import { useState } from 'react';

interface EventTableProps {
  events: Event[];
}

const EventTable = ({ events }: EventTableProps) => {
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
    <div className="row mt-4">
      <div className="col">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Events</h3>
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="UNCOMPLETED">Uncompleted</option>
                <option value="COMPLETED">Completed</option>
                <option value="LATEST">Latest 5</option>
                <option value="MOST_URGENT">Most Urgent</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            <div className="list-group">
              {sortedEvents.map((event) => (
                <div key={event.id} className="list-group-item">
                  <div className="d-flex w-100 justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        {event.name}
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
                            {formatDate(event.actualStart)}
                            {event.actualEnd && ` - ${formatDate(event.actualEnd)}`}
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTable;
