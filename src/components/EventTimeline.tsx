'use client';

import { Event, Issue } from '@prisma/client';
import { useEffect, useRef } from 'react';

interface EventTimelineProps {
  events: Event[];
  issues: Issue[];
  projectId: string;
}

const EventTimeline = ({ events, issues, projectId }: EventTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const issuesAsEvents = issues.filter(issue => issue.status !== 'CLOSED').map((issue) => ({
    id: issue.id,
    name: issue.remedy,
    projectId: issue.projectId,
    description: issue.description,
    plannedStart: issue.firstRaised,
    plannedEnd: issue.status === 'CLOSED' ? issue.updatedAt : today,
    completed: issue.status === 'CLOSED',
    actualStart: null,
    actualEnd: null,
    isIssue: true,
    originalIssue: issue,
  }));

  const allItems = [...events, ...issuesAsEvents];
  const sortedEvents = allItems.sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime());

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getTimelineData = () => {
    if (sortedEvents.length === 0) return { startDate: new Date(), endDate: new Date(), months: [] };
    const startDate = new Date(sortedEvents[0].plannedStart);
    const endDate = new Date(sortedEvents[sortedEvents.length - 1].plannedEnd);
    const paddedStart = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
    const paddedEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
    const months = [];
    const current = new Date(paddedStart);
    while (current <= paddedEnd) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    return { startDate: paddedStart, endDate: paddedEnd, months };
  };

  const timelineData = getTimelineData();

  // Calculate position relative to today's position on timeline
  const getEventPosition = (eventDate: Date | string) => {
    if (sortedEvents.length === 0) return 50;

    const currentDate = new Date();
    const date = new Date(eventDate);
    const todayPosition = 50; // Today is always at 50% (center of timeline)
    const pixelsPerDay = 1; // 1% per day spacing

    // Calculate days difference from today
    const daysDifference = (date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

    // Calculate position: today's position + (days difference * pixels per day)
    const position = todayPosition + (daysDifference * pixelsPerDay);

    return Math.max(5, Math.min(95, position)); // Keep events within visible bounds
  };

  const getMonthPosition = (monthDate: Date) => {
    if (sortedEvents.length === 0) return 0;

    const currentDate = new Date();
    const todayPosition = 50;
    const pixelsPerDay = 1; // 1% per day spacing (same as events)

    const daysDifference = (monthDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

    const position = todayPosition + (daysDifference * pixelsPerDay);

    return Math.max(5, Math.min(95, position));
  };

  const getEventLevels = () => {
    const levels: { event: Event; level: number; }[] = [];
    const occupiedRanges: { start: number; end: number; level: number; }[] = [];

    sortedEvents.forEach((event) => {
      const startPos = getEventPosition(event.plannedStart);
      const endPos = getEventPosition(event.plannedEnd);
      const eventStart = Math.min(startPos, endPos);
      const eventEnd = Math.max(startPos, endPos);

      let level = 0;
      let foundLevel = false;

      while (!foundLevel) {
        const currentLevel = level;
        const conflicts = occupiedRanges.filter(range => range.level === currentLevel
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
  const baseTableheight = 300;

  // Always position Today at the center of the timeline container
  const todayPosition = 50; // Always at 50% (center)

  // Scroll to today's position on mount
  useEffect(() => {
    if (timelineRef.current && sortedEvents.length > 0) {
      const container = timelineRef.current;
      const timelineWidth = container.scrollWidth;
      const containerWidth = container.clientWidth;

      // Calculate scroll position to center today (50% of timeline width)
      const scrollPosition = (timelineWidth * 0.5) - (containerWidth * 0.5);
      container.scrollLeft = Math.max(0, scrollPosition);
    }
  }, [sortedEvents.length]);

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
          Timeline (
          {events.length}
          {' '}
          events,
          {' '}
          {issues.filter(issue => issue.status !== 'CLOSED').length}
          {' '}
          open issues)
        </h5>
      </div>

      {/* Timeline Visualization */}
      <div
        ref={timelineRef}
        className="position-relative"
        style={{
          minHeight: `${baseTableheight + (maxLevel * 40)}px`,
          marginBottom: '20px',
          overflowX: 'auto',
          overflowY: 'visible',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '10px 0',
        }}
      >
        <div
          style={{
            width: '300%', // Make timeline 3x wider than container
            minWidth: '1200px', // Ensure minimum width for small events
            position: 'relative',
            height: '100%',
          }}
        >
          {/* Timeline Line */}
          <div
            style={{
              position: 'absolute',
              top: `${(baseTableheight / 2) + (centerLevel * 40)}px`,
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
          {timelineData.months.map((month) => {
            const position = getMonthPosition(month);

            return (
              <div
                key={`month-${month.getFullYear()}-${month.getMonth()}`}
                style={{
                  position: 'absolute',
                  left: `${position}%`,
                  top: `${(baseTableheight / 2) + (maxLevel * 40)}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 0,
                }}
              >
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
          {eventLevels.map(({ event, level }) => {
            const startPosition = getEventPosition(event.plannedStart);
            const endPosition = getEventPosition(event.plannedEnd);
            const isCompleted = event.completed;
            const isIssue = (event as any).isIssue || false;
            // eslint-disable-next-line no-nested-ternary
            const itemColor = isIssue ? '#ffc107' : (isCompleted ? '#198754' : '#0d6efd');

            const durationInDays = (new Date(event.plannedEnd)
              .getTime() - new Date(event.plannedStart)
              .getTime()) / (1000 * 60 * 60 * 24);

            const eventTop = (baseTableheight / 2) + (level * 40);
            const dotTop = eventTop - 9;

            // For events shorter than 5 days OR events that ended 2+ months ago, show single dot
            const currentDate = new Date();
            const eventEndDate = new Date(event.plannedEnd);
            const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, currentDate.getDate());
            const isOldEvent = eventEndDate <= twoMonthsAgo;
            if (durationInDays <= 5 || isOldEvent) {
              const midPoint = (startPosition + endPosition) / 2;
              return (
                <div key={event.id}>
                  {/* Single dot for short events */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${midPoint}%`,
                      top: `${dotTop}px`,
                      transform: 'translateX(-50%)',
                      zIndex: 3,
                    }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      style={{
                        backgroundColor: itemColor,
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        border: '2px solid #fff',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                      }}
                      title={`${event.name} - ${formatDate(event.plannedStart)} to ${formatDate(event.plannedEnd)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const detailUrl = isIssue ? `/project/${projectId}/issue/${event.id}`
                          : `/project/${projectId}/event/${event.id}`;
                        window.location.href = detailUrl;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          const detailUrl = isIssue ? `/project/${projectId}/issue/${event.id}`
                            : `/project/${projectId}/event/${event.id}`;
                          window.location.href = detailUrl;
                        }
                      }}
                      onMouseEnter={(e) => {
                        // eslint-disable-next-line no-nested-ternary
                        const hoverColor = isIssue ? '#e0a800'
                          : (isCompleted ? '#157347' : '#0b5ed7');
                        e.currentTarget.style.backgroundColor = hoverColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = itemColor;
                      }}
                    >
                      {new Date(event.plannedStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' '}
                      -
                      {' '}
                      {event.name}
                      {' '}
                      -
                      {' '}
                      {new Date(event.plannedEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {isCompleted && (
                      <span style={{ marginLeft: '4px' }}>✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // For longer events, show start and end dots
            const leftPosition = Math.min(startPosition, endPosition);
            const width = Math.abs(endPosition - startPosition);

            return (
              <div
                key={event.id}
                role="button"
                tabIndex={0}
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const detailUrl = isIssue ? `/project/${projectId}/issue/${event.id}`
                    : `/project/${projectId}/event/${event.id}`;
                  window.location.href = detailUrl;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    const detailUrl = isIssue ? `/project/${projectId}/issue/${event.id}`
                      : `/project/${projectId}/event/${event.id}`;
                    window.location.href = detailUrl;
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                title={`Click to view ${event.name} details`}
              >
                {/* Event Duration Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${leftPosition}%`,
                    top: `${eventTop - 1}px`,
                    width: `${width}%`,
                    height: '4px',
                    backgroundColor: itemColor,
                    opacity: 0.7,
                    zIndex: 2,
                    borderRadius: '2px',
                  }}
                />

                {/* Start Date Dot - With event name */}
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
                      backgroundColor: itemColor,
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
                    {event.name}
                    {isCompleted && (
                    <span style={{ marginLeft: '4px' }}>✓</span>
                    )}
                  </div>
                </div>

                {/* End Date Dot - With date only */}
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
                      backgroundColor: itemColor,
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
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default EventTimeline;
