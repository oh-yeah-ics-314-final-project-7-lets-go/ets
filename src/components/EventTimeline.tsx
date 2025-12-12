'use client';

import { truncate } from '@/lib/util';
import { Event, Issue } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import { FormSelect } from 'react-bootstrap';

interface EventTimelineProps {
  events: Event[];
  issues: Issue[];
  projectId: string;
}

const EventTimeline = ({ events, issues, projectId }: EventTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>('12_MONTHS');
  const today = new Date();

  const getFilteredData = () => {
    const sixMonthsBefore = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
    const sixMonthsAfter = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
    const threeMonthsBefore = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    const threeMonthsAfter = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    const oneMonthBefore = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const oneMonthAfter = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const currentYearStart = new Date(today.getFullYear(), 0, 1);
    const currentYearEnd = new Date(today.getFullYear(), 11, 31);

    let filteredEvents = [...events];
    let filteredIssues = [...issues];

    switch (filter) {
      case '12_MONTHS':
        filteredEvents = events.filter(event => (
          new Date(event.plannedEnd) >= sixMonthsBefore && new Date(event.plannedStart) <= sixMonthsAfter
        ));
        filteredIssues = issues.filter(issue => (
          new Date(issue.updatedAt) >= sixMonthsBefore && new Date(issue.firstRaised) <= sixMonthsAfter
        ));
        break;
      case '6_MONTHS':
        filteredEvents = events.filter(event => (
          new Date(event.plannedEnd) >= threeMonthsBefore && new Date(event.plannedStart) <= threeMonthsAfter
        ));
        filteredIssues = issues.filter(issue => (
          new Date(issue.updatedAt) >= threeMonthsBefore && new Date(issue.firstRaised) <= threeMonthsAfter
        ));
        break;
      case '2_MONTHS':
        filteredEvents = events.filter(event => (
          new Date(event.plannedEnd) >= oneMonthBefore && new Date(event.plannedStart) <= oneMonthAfter
        ));
        filteredIssues = issues.filter(issue => (
          new Date(issue.updatedAt) >= oneMonthBefore && new Date(issue.firstRaised) <= oneMonthAfter
        ));
        break;
      case 'CURRENT_YEAR':
        filteredEvents = events.filter(event => (
          new Date(event.plannedStart) >= currentYearStart && new Date(event.plannedEnd) <= currentYearEnd
        ));
        filteredIssues = issues.filter(issue => (
          new Date(issue.firstRaised) >= currentYearStart && new Date(issue.updatedAt) <= currentYearEnd
        ));
        break;
      case 'ACTIVE_ONLY':
        filteredEvents = events.filter(event => !event.completed);
        filteredIssues = issues.filter(issue => issue.status !== 'CLOSED');
        break;
      case 'ALL':
      default:

        break;
    }

    return { filteredEvents, filteredIssues };
  };

  const { filteredEvents, filteredIssues } = getFilteredData();

  const filteredIssuesAsEvents = filteredIssues.filter(issue => issue.status !== 'CLOSED').map((issue) => ({
    id: issue.id,
    name: truncate(issue.title, 100),
    projectId: issue.projectId,
    description: truncate(issue.description, 150),
    plannedStart: issue.firstRaised,
    plannedEnd: issue.status === 'CLOSED' ? issue.updatedAt : today,
    completed: issue.status === 'CLOSED',
    actualStart: null,
    actualEnd: null,
    isIssue: true,
    originalIssue: issue,
  }));

  const allItems = [...filteredEvents, ...filteredIssuesAsEvents];
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

  const getEventPosition = (eventDate: Date | string) => {
    if (sortedEvents.length === 0) return 50;

    const currentDate = new Date();
    const date = new Date(eventDate);
    const todayPosition = 50;
    const pixelsPerDay = 1;
    const daysDifference = (date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

    const position = todayPosition + (daysDifference * pixelsPerDay);

    return Math.max(5, Math.min(95, position));
  };

  const getMonthPosition = (monthDate: Date) => {
    if (sortedEvents.length === 0) return 0;

    const currentDate = new Date();
    const todayPosition = 50;
    const pixelsPerDay = 1;

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

  const todayPosition = 50;

  useEffect(() => {
    if (timelineRef.current && sortedEvents.length > 0) {
      const container = timelineRef.current;
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;
      const timelineHeight = 200 + (maxLevel * 40);

      const verticalCenter = (timelineHeight / 2) - (containerHeight / 2);
      container.scrollTop = Math.max(0, verticalCenter);

      const timelineWidth = container.scrollWidth;
      const horizontalCenter = (timelineWidth * 0.5) - (containerWidth / 2);
      container.scrollLeft = Math.max(0, horizontalCenter);
    }
  }, [sortedEvents.length, maxLevel, filter]);

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
      <div className="mb-3 d-flex gap-2 align-items-center">
        <h5 className="mb-0">
          Timeline (
          {filteredEvents.length}
          {' '}
          events,
          {' '}
          {filteredIssues.filter(issue => issue.status !== 'CLOSED').length}
          {' '}
          open issues)
        </h5>
        <div className="ms-auto">
          <FormSelect
            size="sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="12_MONTHS">12 Months</option>
            <option value="6_MONTHS">6 Months</option>
            <option value="2_MONTHS">2 Months</option>
            <option value="CURRENT_YEAR">Current Year</option>
            <option value="ACTIVE_ONLY">Active Only</option>
            <option value="ALL">All</option>
          </FormSelect>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div
        ref={timelineRef}
        className="position-relative"
        style={{
          minHeight: '400px',
          maxHeight: '600px',
          height: `${200 + (maxLevel * 40)}px`,
          marginBottom: '20px',
          overflowX: 'auto',
          overflowY: 'auto',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '10px 0',
        }}
      >
        <div
          style={{
            width: '300%',
            minWidth: '1200px',
            position: 'relative',
            height: '100%',
          }}
        >
          {/* Timeline Line */}
          <div
            style={{
              position: 'absolute',
              top: `${90 + (centerLevel * 40)}px`,
              left: '20px',
              right: '20px',
              height: '2px',
              backgroundColor: '#17828c',
              zIndex: 1,
            }}
          />

          {/* Today Pointer */}
          <div
            style={{
              position: 'absolute',
              left: `${todayPosition}%`,
              top: '0px',
              transform: 'translateX(-50%)',
              zIndex: 1,
              height: `${200 + (maxLevel * 40) + 40}px`,
            }}
          >
            {/* Vertical Line */}
            <div
              style={{
                width: '2px',
                height: '100%',
                backgroundColor: '#dc3545',
                opacity: 0.6,
                borderRadius: '1px',
              }}
            />

            {/* Today Label */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
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
                zIndex: 5,
              }}
            >
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>

            {/* Arrow Pointer */}
            <div
              style={{
                position: 'absolute',
                top: '28px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '6px solid #dc3545',
                zIndex: 5,
              }}
            />
          </div>

          {/* Month Grid */}
          {timelineData.months.map((month) => {
            const position = getMonthPosition(month);

            return (
              <div
                key={`month-${month.getFullYear()}-${month.getMonth()}`}
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
            const isIssue = (event as any).isIssue || false;

            // eslint-disable-next-line no-nested-ternary
            const itemColor = isIssue ? '#ffc107' : (isCompleted ? '#198754' : '#0d6efd');

            const durationInDays = (new Date(event.plannedEnd)
              .getTime() - new Date(event.plannedStart)
              .getTime()) / (1000 * 60 * 60 * 24);

            const eventTop = 90 + (level * 40);
            const dotTop = eventTop - 9;

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
