'use client';

import { Event } from '@prisma/client';

interface EventTableProps {
  events: Event[];
}

const EventTable = ({ events }: EventTableProps) => {
  // Sort events by start date
  const sortedEvents = events.sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime());

  // Format date for display
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="row mt-4">
      <div className="col">
        <h6>Event Details</h6>
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
  );
};

export default EventTable;
