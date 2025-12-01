'use client';

import { Event, Issue } from '@prisma/client';
import { Container } from 'react-bootstrap';
import { useRef, useEffect } from 'react';

interface EventTimelineProps {
  events: Event[];
  issues: Issue[];
  projectId: string;
  // eslint-disable-next-line react/require-default-props
  startDate?: string; // Timeline start date (0px) - format: "YYYY-MM-DD"
  // eslint-disable-next-line react/require-default-props
  endDate?: string; // Timeline end date (5760px) - format: "YYYY-MM-DD"
}

const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

// Timeline configuration constants
const TIMELINE_WIDTH = 5760; // Total timeline width in pixels
const SAFE_MARGIN = 120; // Safe margin for plotting (0.5 months buffer)

// Safe plotting boundaries for events/issues:
// - Total range: 0px to 5760px (24 months)
// - Safe range: 120px to 5640px (23 months)
// - This prevents tag overflow at timeline edges
// - Equivalent to 11 months before/after center with 0.5 month buffer on each side

// Date utility functions for timeline positioning
const createDateUtils = (startDate?: string, endDate?: string) => {
  // Default date range: exactly 1 year before today to 1 year after today
  const today = new Date();
  const defaultStart = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const defaultEnd = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  const timelineStart = startDate ? new Date(startDate) : defaultStart;
  const timelineEnd = endDate ? new Date(endDate) : defaultEnd;
  const totalTimeMs = timelineEnd.getTime() - timelineStart.getTime();

  const dateToPixel = (date: Date | string): number => {
    const targetDate = new Date(date);
    const msFromStart = targetDate.getTime() - timelineStart.getTime();
    const pixelPosition = (msFromStart / totalTimeMs) * TIMELINE_WIDTH;
    return Math.max(0, Math.min(TIMELINE_WIDTH, pixelPosition));
  };

  const pixelToDate = (pixel: number): Date => {
    const ratio = pixel / TIMELINE_WIDTH;
    const msFromStart = ratio * totalTimeMs;
    return new Date(timelineStart.getTime() + msFromStart);
  };

  const isDateInRange = (date: Date | string): boolean => {
    const targetDate = new Date(date);
    return targetDate >= timelineStart && targetDate <= timelineEnd;
  };

  const isDateInSafePlottingRange = (date: Date | string): boolean => {
    const pixel = dateToPixel(date);
    return pixel >= SAFE_MARGIN && pixel <= (TIMELINE_WIDTH - SAFE_MARGIN);
  };

  const getTodayPixel = (): number => dateToPixel(new Date());

  const getLevels = (items: any[]) => {
    const levels: { event: any; level: number; }[] = [];
    const occupiedRanges: { start: number; end: number; level: number; }[] = [];
    const MIN_EVENT_WIDTH = 250; // Minimum width for overlap detection (matches new tag minimum width)

    items.forEach((event) => {
      const startPos = dateToPixel(event.plannedStart);
      const endPos = dateToPixel(event.plannedEnd || event.plannedStart);
      let eventStart = Math.min(startPos, endPos);
      let eventEnd = Math.max(startPos, endPos);
      // Ensure minimum width for overlap detection
      if (eventEnd - eventStart < MIN_EVENT_WIDTH) {
        const center = (eventStart + eventEnd) / 2;
        eventStart = center - MIN_EVENT_WIDTH / 2;
        eventEnd = center + MIN_EVENT_WIDTH / 2;
      }

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

  return {
    dateToPixel,
    pixelToDate,
    isDateInRange,
    isDateInSafePlottingRange,
    getTodayPixel,
    getLevels,
    timelineStart,
    timelineEnd,
  };
};

const useTimelineUtils = (events: Event[], issues: Issue[], startDate?: string, endDate?: string) => {
  const dateUtils = createDateUtils(startDate, endDate);
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

  const getTimelineData = () => {
    const currentDate = new Date();
    // Always show 1 year before to 1 year after today (exactly 24 months)
    const timelineStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1);

    const months = [];
    const current = new Date(timelineStartDate);
    // Generate exactly 24 months
    for (let i = 0; i < 24; i++) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    const timelineEndDate = new Date(current); // End date is after the 24th month
    return { startDate: timelineStartDate, endDate: timelineEndDate, months };
  };

  const getEventPosition = (eventDate: Date | string) => {
    const timelineData = getTimelineData();
    const date = new Date(eventDate);
    const { startDate: timelineStart } = timelineData;

    // Calculate complete months from start
    const monthsFromStart = (date.getFullYear() - timelineStart.getFullYear()) * 12
      + (date.getMonth() - timelineStart.getMonth());

    // Calculate precise position within the current month
    const daysInCurrentMonth = getDaysInMonth(date.getFullYear(), date.getMonth());
    const dayPosition = (date.getDate() - 1) / daysInCurrentMonth; // -1 because days start at 1

    // Each month is 240px, calculate total position in pixels
    const monthWidth = 240;
    const totalWidth = 5760; // 24 months * 240px
    const positionInPixels = (monthsFromStart * monthWidth) + (dayPosition * monthWidth);
    return Math.max(0, Math.min(totalWidth, positionInPixels));
  };

  const getMonthPosition = (monthDate: Date) => {
    const timelineData = getTimelineData();
    const { startDate: timelineStart } = timelineData;

    // Calculate months from start
    const monthsFromStart = (monthDate.getFullYear() - timelineStart.getFullYear()) * 12
      + (monthDate.getMonth() - timelineStart.getMonth());

    const totalWidth = 5760;
    const position = ((monthsFromStart * 240) / totalWidth) * 100;

    return Math.max(0, Math.min(100, position));
  };

  const getLevels = (items: any[]) => {
    const levels: { event: Event; level: number; }[] = [];
    const occupiedRanges: { start: number; end: number; level: number; }[] = [];

    items.forEach((event) => {
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

  return {
    sortedEvents,
    getEventPosition,
    getMonthPosition,
    getTimelineData,
    getLevels,
    todayPosition: 50,
    dateUtils,
  };
};

// EventGraph Component (Upper Half)
const EventGraph = ({ events, projectId, dateUtils }: { events: Event[], projectId: string, dateUtils: any }) => {
  // Filter events that are within safe plotting range
  const safeEvents = events.filter(event => dateUtils.isDateInSafePlottingRange(event.plannedStart));
  const eventLevels = dateUtils.getLevels(safeEvents);
  const containerHeight = 300; // Upper half of 600px container

  const renderItem = (item: any, level: number) => {
    const startPosition = dateUtils.dateToPixel(item.plannedStart);
    const endPosition = dateUtils.dateToPixel(item.plannedEnd);
    const isCompleted = item.completed;
    const itemColor = isCompleted ? '#198754' : '#17828c';

    // Events positioned from middle (300px) upward when there are overlaps
    const spacing = 70; // Space between levels (increased for 50px circles + margin)
    const baseTop = 250; // Start well above the timeline (300px)
    const itemTop = baseTop - (level * spacing);
    const dotTop = itemTop;

    // Format dates for display
    const startDateLabel = new Date(item.plannedStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDateLabel = new Date(item.plannedEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const eventLabel = `${startDateLabel} - ${item.name} - ${endDateLabel}`;

    // Calculate width based on text content (approximate character width calculation)
    const checkmarkWidth = isCompleted ? 20 : 0; // Space for checkmark if completed
    const estimatedTextWidth = (eventLabel.length * 6) + checkmarkWidth + 32; // ~6px per char + padding
    const pixelDuration = Math.abs(endPosition - startPosition);
    const minWidth = Math.max(250, estimatedTextWidth); // Use larger of minimum or calculated width
    const maxWidth = 500; // Reasonable max to prevent excessive width
    const eventWidth = Math.min(maxWidth, Math.max(minWidth, pixelDuration + 60));

    // Consistent height and border radius for all events
    const eventHeight = 40; // Same height for all events
    const borderRadius = '20px'; // Consistent border radius

    return (
      <div
        key={item.id}
        style={{
          position: 'absolute',
          left: `${startPosition}px`,
          top: `${dotTop}px`,
          transform: 'translateX(-50%)',
          zIndex: 3,
        }}
      >
        <button
          type="button"
          style={{
            fontSize: '0.6rem',
            color: 'white',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            backgroundColor: itemColor,
            width: `${eventWidth}px`,
            height: `${eventHeight}px`,
            borderRadius,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            border: '2px solid #fff',
            cursor: 'pointer',
            padding: '0 8px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/project/${projectId}/event/${item.id}`;
          }}
        >
          {eventLabel}
          {isCompleted && <span style={{ marginLeft: '4px' }}>✓</span>}
        </button>
      </div>
    );
  };

  return (
    <div
      className="event-graph"
      style={{
        position: 'relative',
        height: `${containerHeight}px`,
        width: '5760px',
      }}
    >
      {eventLevels.map(({ event, level }: { event: Event; level: number }) => renderItem(event, level))}
    </div>
  );
};

// Timeline Component (Middle Line)
const Timeline = ({ dateUtils }: { dateUtils: any }) => {
  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const todayPixel = dateUtils.getTodayPixel();

  return (
    <>
      {/* Main timeline line - positioned at center of 600px container */}
      <div
        style={{
          position: 'absolute',
          top: '300px',
          left: '0',
          width: '5760px',
          height: '3px',
          backgroundColor: '#6c757d',
          borderRadius: '2px',
          transform: 'translateY(-50%)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />

      {/* Today Pointer - positioned based on calculated pixel position */}
      <div
        style={{
          position: 'absolute',
          left: `${todayPixel}px`,
          top: '300px',
          transform: 'translate(-50%, -50%)',
          zIndex: 4,
        }}
      >
        <div style={{
          fontSize: '0.8rem',
          color: 'white',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          backgroundColor: '#dc3545',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          border: '2px solid #fff',
        }}
        >
          {todayLabel}
        </div>
      </div>
    </>
  );
};

// IssueGraph Component (Lower Half)
const IssueGraph = ({ issues, projectId, dateUtils }: { issues: Issue[], projectId: string, dateUtils: any }) => {
  // Debug logging
  console.log('IssueGraph - Total issues:', issues.length);
  console.log('IssueGraph - Issues:', issues);

  // Filter issues that are within safe plotting range and not closed
  const openIssues = issues.filter(issue => issue.status !== 'CLOSED' && dateUtils
    .isDateInSafePlottingRange(issue.firstRaised));

  console.log('IssueGraph - Open issues after filtering:', openIssues.length);
  console.log('IssueGraph - Open issues:', openIssues);
  const issueLevels = dateUtils.getLevels(openIssues.map(issue => ({
    id: issue.id,
    name: issue.remedy,
    plannedStart: issue.firstRaised,
    plannedEnd: issue.updatedAt,
    completed: false,
    isIssue: true,
  })));
  const containerHeight = 300; // Lower half of 600px container

  const renderIssue = (issue: Issue, level: number) => {
    const startPosition = dateUtils.dateToPixel(issue.firstRaised);
    const endPosition = dateUtils.dateToPixel(issue.updatedAt);
    const itemColor = '#ffc107'; // Yellow for issues

    // Issues positioned from middle (300px) downward when there are overlaps
    const spacing = 70; // Space between levels
    const baseTop = 350; // Start below the timeline (300px + 50px margin)
    const itemTop = baseTop + (level * spacing);
    const dotTop = itemTop;

    // Format dates for display
    const startDateLabel = new Date(issue.firstRaised).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDateLabel = new Date(issue.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const issueLabel = `${startDateLabel} - ${issue.remedy} - ${endDateLabel}`;

    // Calculate width based on text content
    const estimatedTextWidth = (issueLabel.length * 6) + 32;
    const pixelDuration = Math.abs(endPosition - startPosition);
    const minWidth = Math.max(250, estimatedTextWidth);
    const maxWidth = 500;
    const issueWidth = Math.min(maxWidth, Math.max(minWidth, pixelDuration + 60));

    // Consistent height and border radius
    const issueHeight = 40;
    const borderRadius = '20px';

    return (
      <div
        key={issue.id}
        style={{
          position: 'absolute',
          left: `${startPosition}px`,
          top: `${dotTop}px`,
          transform: 'translateX(-50%)',
          zIndex: 3,
        }}
      >
        <button
          type="button"
          style={{
            fontSize: '0.6rem',
            color: 'white',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            backgroundColor: itemColor,
            width: `${issueWidth}px`,
            height: `${issueHeight}px`,
            borderRadius,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            border: '2px solid #fff',
            cursor: 'pointer',
            padding: '0 8px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/project/${projectId}/issue/${issue.id}`;
          }}
        >
          {issueLabel}
        </button>
      </div>
    );
  };

  return (
    <div
      className="issue-graph"
      style={{
        position: 'relative',
        height: `${containerHeight}px`,
        width: '5760px',
      }}
    >
      {issueLevels.map(({ event, level }: { event: any; level: number }) => {
        // Find the original issue from the filtered list
        const originalIssue = openIssues.find(issue => issue.id === event.id);
        return originalIssue ? renderIssue(originalIssue, level) : null;
      })}
    </div>
  );
};

const EventTimeline = ({ events, issues, projectId, startDate, endDate }: EventTimelineProps) => {
  const utils = useTimelineUtils(events, issues, startDate, endDate);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timelineContainerRef.current && utils.dateUtils) {
      const todayPixel = utils.dateUtils.getTodayPixel();
      const scrollPosition = todayPixel - (timelineContainerRef.current.clientWidth / 2);
      timelineContainerRef.current.scrollLeft = Math.max(0, scrollPosition);
    }
  }, [utils.dateUtils]);

  if (utils.sortedEvents.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <p>No events scheduled yet.</p>
        <small>Add an event to see the timeline visualization.</small>
      </div>
    );
  }

  return (
    <Container className="timeline-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
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
        <div className="d-flex gap-2">
          <a
            href={`/project/${projectId}/event/add`}
            className="btn btn-primary btn-sm"
          >
            Add Event
          </a>
          <a
            href={`/project/${projectId}/issue/add`}
            className="btn btn-warning btn-sm"
          >
            Add Issue
          </a>
          <a
            href={`/project/${projectId}/comment/add`}
            className="btn btn-info btn-sm"
          >
            Add Comment
          </a>
        </div>
      </div>

      <div
        ref={timelineContainerRef}
        style={{
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          backgroundColor: '#fff',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <div style={{ position: 'relative', width: '5760px', height: '600px' }}>
          <EventGraph events={events} projectId={projectId} dateUtils={utils.dateUtils} />
          <Timeline dateUtils={utils.dateUtils} />
          <IssueGraph issues={issues} projectId={projectId} dateUtils={utils.dateUtils} />
        </div>
      </div>
    </Container>
  );
};

export default EventTimeline;
