'use client';

import { Event, Issue } from '@prisma/client';
import { useState } from 'react';

interface EventTimelineProps {
  events: Event[];
  issues: Issue[];
  projectId: string;
}

const EventTimeline = ({ events, issues, projectId }: EventTimelineProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleTimelineClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Get severity badge color
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-danger';
      case 'MEDIUM': return 'bg-warning';
      case 'LOW': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => (status === 'OPEN' ? 'bg-warning' : 'bg-success');
  // Sort events by planned start date
  const sortedEvents = events.sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime());

  // Format date for display
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate timeline range and positions based on actual dates
  const getTimelineData = () => {
    if (sortedEvents.length === 0) return { startDate: new Date(), endDate: new Date(), months: [] };

    const startDate = new Date(sortedEvents[0].plannedStart);
    const endDate = new Date(sortedEvents[sortedEvents.length - 1].plannedEnd);

    // Add some padding (1 month before and after)
    const paddedStart = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
    const paddedEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);

    // Generate month markers
    const months = [];
    const current = new Date(paddedStart);
    while (current <= paddedEnd) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    return { startDate: paddedStart, endDate: paddedEnd, months };
  };

  const timelineData = getTimelineData();

  // Calculate position relative to today as center
  const getEventPosition = (eventDate: Date | string) => {
    if (sortedEvents.length === 0) return 50;

    const today = new Date();
    const date = new Date(eventDate);
    const center = 50; // Center position as percentage
    const visualCorrectionVariable = 0.01; // Adjust this to control sensitivity
    const sizeOfTheTable = 100; // Full width in percentage

    // Calculate days difference from today
    const daysDifference = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    // Calculate position relative to center
    const position = center + (daysDifference * visualCorrectionVariable * sizeOfTheTable);

    return Math.max(0, Math.min(100, position));
  };

  const getMonthPosition = (monthDate: Date) => {
    if (sortedEvents.length === 0) return 0;

    const today = new Date();
    const center = 50; // Center position as percentage
    const visualCorrectionVariable = 0.1; // Same as event positioning
    const sizeOfTheTable = 100; // Full width in percentage

    // Calculate days difference from today
    const daysDifference = (monthDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    // Calculate position relative to center
    const position = center + (daysDifference * visualCorrectionVariable * sizeOfTheTable);

    return Math.max(0, Math.min(100, position));
  };

  // Calculate event levels to avoid overlaps
  const getEventLevels = () => {
    const levels: { event: Event; level: number; }[] = [];
    const occupiedRanges: { start: number; end: number; level: number; }[] = [];

    sortedEvents.forEach((event) => {
      const startPos = getEventPosition(event.plannedStart);
      const endPos = getEventPosition(event.plannedEnd);
      const eventStart = Math.min(startPos, endPos);
      const eventEnd = Math.max(startPos, endPos);

      // Find the lowest available level
      let level = 0;
      let foundLevel = false;

      while (!foundLevel) {
        const conflicts = occupiedRanges.filter(range => range.level === level
          && !(eventEnd < range.start || eventStart > range.end));

        if (conflicts.length === 0) {
          foundLevel = true;
        } else {
          level++;
        }
      }

      levels.push({ event, level });
      occupiedRanges.push({ start: eventStart, end: eventEnd, level });
    });

    return levels;
  };

  const eventLevels = getEventLevels();
  const maxLevel = eventLevels.length > 0 ? Math.max(...eventLevels.map(el => el.level)) : 0;
  const centerLevel = maxLevel / 2;

  // Always position Today at the center of the timeline container
  const todayPosition = 50; // Always at 50% (center)

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <p>No events scheduled yet.</p>
        <small>Add an event to see the timeline visualization.</small>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {/* Timeline Header */}
      <div className="mb-3">
        <h5>
          Events Timeline (
          {sortedEvents.length}
          {' '}
          events)
        </h5>
      </div>

      {/* Timeline Visualization */}
      <div className="position-relative" style={{ minHeight: `${200 + (maxLevel * 40)}px`, marginBottom: '20px' }}>
        {/* Timeline Line */}
        <div
          style={{
            position: 'absolute',
            top: `${90 + (centerLevel * 40)}px`,
            left: '20px',
            right: '20px',
            height: '2px',
            backgroundColor: '#dee2e6',
            zIndex: 1,
          }}
        />

        {/* Today Pointer */}
        <div
          style={{
            position: 'absolute',
            left: `${todayPosition}%`,
            top: '20px',
            bottom: '20px',
            transform: 'translateX(-50%)',
            zIndex: 4,
          }}
        >
          {/* Vertical Line */}
          {/* <div
            style={{
              width: '3px',
              height: '100%',
              backgroundColor: '#dc3545',
              opacity: 0.8,
              borderRadius: '1.5px'
            }}
          /> */}

          {/* Today Label */}
          <div
            style={{
              position: 'absolute',
              top: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>

          {/* Arrow Pointer */}
          <div
            style={{
              position: 'absolute',
              top: '-7px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '6px solid #dc3545',
            }}
          />
        </div>

        {/* Month Grid */}
        {timelineData.months.map((month, index) => {
          const position = getMonthPosition(month);

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${position}%`,
                top: `${170 + (maxLevel * 40)}px`,
                transform: 'translateX(-50%)',
                zIndex: 0,
              }}
            >
              {/* Month Tick Mark */}
              <div
                style={{
                  width: '1px',
                  height: '15px',
                  backgroundColor: '#adb5bd',
                  marginLeft: '50%',
                }}
              />
            </div>
          );
        })}

        {/* Event Durations */}
        {eventLevels.map(({ event, level }) => {
          const startPosition = getEventPosition(event.plannedStart);
          const endPosition = getEventPosition(event.plannedEnd);
          const isCompleted = event.completed;
          const leftPosition = Math.min(startPosition, endPosition);
          const width = Math.abs(endPosition - startPosition);

          // Calculate vertical position from center
          const eventTop = 90 + (level * 40);
          const dotTop = eventTop - 9; // Center dot on line
          const labelTop = eventTop - 22; // Label above the event

          return (
            <div key={event.id}>
              {/* Event Duration Line */}
              <div
                style={{
                  position: 'absolute',
                  left: `${leftPosition}%`,
                  top: `${eventTop - 1}px`,
                  width: `${width}%`,
                  height: '4px',
                  backgroundColor: isCompleted ? '#198754' : '#0d6efd',
                  opacity: 0.7,
                  zIndex: 2,
                  borderRadius: '2px',
                }}
              />

              {/* Start Date Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: `${startPosition}%`,
                  top: `${dotTop}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    backgroundColor: isCompleted ? '#198754' : '#0d6efd',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    fontSize: '0.6rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    border: '2px solid #fff',
                  }}
                  title={`${event.name} - Start: ${formatDate(event.plannedStart)}`}
                >
                  {new Date(event.plannedStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* End Date Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: `${endPosition}%`,
                  top: `${dotTop}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    backgroundColor: isCompleted ? '#198754' : '#0d6efd',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    fontSize: '0.6rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    border: '2px solid #fff',
                  }}
                  title={`${event.name} - End: ${formatDate(event.plannedEnd)}`}
                >
                  {new Date(event.plannedEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Issue Dots on Event Bar */}
              {issues
                .filter(issue => {
                  // Show issues that fall within this event's timeframe or are general project issues
                  const issueDate = new Date(issue.updatedAt);
                  const eventStart = new Date(event.plannedStart);
                  const eventEnd = new Date(event.plannedEnd);
                  // For now, show all issues on all events - you can adjust this logic as needed
                  return true;
                })
                .map((issue, issueIndex) => {
                  const issuePosition = getEventPosition(issue.updatedAt);
                  return (
                    <div
                      key={`issue-${issue.id}-${event.id}`}
                      style={{
                        position: 'absolute',
                        left: `${issuePosition}%`,
                        top: `${eventTop - 3}px`, // Slightly above the event bar
                        transform: 'translateX(-50%)',
                        zIndex: 4,
                      }}
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#ffc107', // Yellow color
                          borderRadius: '50%',
                          border: '1px solid #fff',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          cursor: 'pointer',
                        }}
                        title={`Issue: ${issue.description} - Updated: ${formatDate(issue.updatedAt)}`}
                      />
                    </div>
                  );
                })}

              {/* Event Label */}
              <div
                style={{
                  position: 'absolute',
                  left: `${(startPosition + endPosition) / 2}%`,
                  top: `${labelTop}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 3,
                }}
              >
                <div
                  className="text-center"
                  style={{
                    fontSize: '0.75rem',
                    width: '100px',
                    marginLeft: '-50px',
                  }}
                >
                  <div
                    className="fw-bold"
                    style={{
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      transition: 'background-color 0.2s ease',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTimelineClick();
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Click to view issues"
                  >
                    {event.name}
                  </div>
                  {isCompleted && (
                    <span className="badge bg-success mt-1" style={{ fontSize: '0.6rem' }}>
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Issues Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseModal}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Project Issues</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                />
              </div>
              <div className="modal-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>
                    Issues (
                    {issues.length}
                    )
                  </h6>
                  <a
                    href={`/project/${projectId}/issue/create`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Add Issue
                  </a>
                </div>

                {issues.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <p>No issues reported yet.</p>
                    <small>Click "Add Issue" to report a new issue.</small>
                  </div>
                ) : (
                  <div className="list-group">
                    {issues.map((issue) => (
                      <div key={issue.id} className="list-group-item">
                        <div className="d-flex w-100 justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{issue.description}</h6>
                            <p className="mb-1 text-muted">{issue.remedy}</p>
                            <div className="d-flex gap-2 mb-2">
                              <span className={`badge ${getSeverityBadge(issue.severity)}`}>
                                {issue.severity}
                                {' '}
                                Severity
                              </span>
                              <span className={`badge ${getSeverityBadge(issue.likelihood)}`}>
                                {issue.likelihood}
                                {' '}
                                Likelihood
                              </span>
                              <span className={`badge ${getStatusBadge(issue.status)}`}>
                                {issue.status}
                              </span>
                            </div>
                            <small className="text-muted">
                              Reported:
                              {' '}
                              {formatDate(issue.firstRaised)}
                              {issue.updatedAt && issue.updatedAt !== issue.firstRaised && (
                                <>
                                  {' '}
                                  | Updated:
                                  {formatDate(issue.updatedAt)}
                                </>
                              )}
                            </small>
                          </div>
                          <div className="ms-3">
                            <a
                              href={`/project/${projectId}/issue/${issue.id}/edit`}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              Edit
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event List */}
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
    </div>
  );
};

export default EventTimeline;
