'use client';

import { Event, Issue } from '@prisma/client';
import { Container } from 'react-bootstrap';
import { useRef, useEffect } from 'react';

interface EventTimelineProps {
  events: Event[];
  issues: Issue[];
  projectId: string;
}

const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

const useTimelineUtils = (events: Event[], issues: Issue[]) => {
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
    const today = new Date();
    // Always show 1 year before to 1 year after today (exactly 24 months)
    const startDate = new Date(today.getFullYear(), today.getMonth() - 12, 1);

    const months = [];
    const current = new Date(startDate);
    // Generate exactly 24 months
    for (let i = 0; i < 24; i++) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    const endDate = new Date(current); // End date is after the 24th month
    return { startDate, endDate, months };
  };

  const getEventPosition = (eventDate: Date | string) => {
    const timelineData = getTimelineData();
    const date = new Date(eventDate);
    const { startDate } = timelineData;

    // Calculate complete months from start
    const monthsFromStart = (date.getFullYear() - startDate.getFullYear()) * 12
                           + (date.getMonth() - startDate.getMonth());

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
    const { startDate } = timelineData;

    // Calculate months from start
    const monthsFromStart = (monthDate.getFullYear() - startDate.getFullYear()) * 12
                           + (monthDate.getMonth() - startDate.getMonth());

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
  };
};

// EventGraph Component (Upper Half)
// const EventGraph = ({ events, projectId, utils }: { events: Event[], projectId: string, utils: any }) => {
//   const eventLevels = utils.getLevels(events);
//   const containerHeight = 400;

//   const renderItem = (item: any, level: number) => {
//     const startPosition = utils.getEventPosition(item.plannedStart);
//     const endPosition = utils.getEventPosition(item.plannedEnd);
//     const isCompleted = item.completed;
//     const itemColor = isCompleted ? '#198754' : '#0d6efd';
//     const durationInDays = (new Date(item.plannedEnd)
//       .getTime() - new Date(item.plannedStart)
//       .getTime()) / (1000 * 60 * 60 * 24);
//     // Events should be positioned upward from bottom of container (400px container height)
//     // Place events from bottom upward: 400px - (level * spacing)
//     const spacing = 50; // increased spacing to prevent cramping
//     const itemTop = 400 - ((level + 1) * spacing);
//     const dotTop = itemTop - 9;

//     const currentDate = new Date();
//     const eventEndDate = new Date(item.plannedEnd);
//     const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, currentDate.getDate());
//     const isOldEvent = eventEndDate <= twoMonthsAgo;

//     if (durationInDays <= 5 || isOldEvent) {
//       return (
//         <div
//           key={item.id}
//           style={{
//             position: 'absolute',
//             left: `${startPosition}px`,
//             top: `${dotTop}px`,
//             zIndex: 3 }}
//         >
//           <div
//             role="button"
//             tabIndex={0}
//             style={{
//               backgroundColor: itemColor,
//               color: 'white',
//               padding: '2px 6px',
//               borderRadius: '12px',
//               fontSize: '0.6rem',
//               fontWeight: 'bold',
//               whiteSpace: 'nowrap',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
//               border: '2px solid #fff',
//               cursor: 'pointer',
//             }}
//             onClick={(e) => {
//               e.stopPropagation();
//               window.location.href = `/project/${projectId}/event/${item.id}`;
//             }}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' || e.key === ' ') {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 window.location.href = `/project/${projectId}/event/${item.id}`;
//               }
//             }}
//           >
//             {new Date(item.plannedStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//             {' - '}
//             {item.name}
//             {' - '}
//             {new Date(item.plannedEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//             {isCompleted && <span style={{ marginLeft: '4px' }}>✓</span>}
//           </div>
//         </div>
//       );
//     }

//     const leftPosition = Math.min(startPosition, endPosition);
//     const width = Math.abs(endPosition - startPosition);

//     return (
//       <div key={item.id}>
//         <div style={{
//           position: 'absolute',
//           left: `${leftPosition}px`,
//           top: `${itemTop - 1}px`,
//           width: `${width}px`,
//           height: '4px',
//           backgroundColor: itemColor,
//           opacity: 0.7,
//           zIndex: 2,
//           borderRadius: '2px' }}
//         />
//         <div style={{
//           position: 'absolute',
//           left: `${startPosition}px`,
//           top: `${dotTop}px`,
//           zIndex: 3 }}
//         >
//           <div
//             style={{
//               backgroundColor: itemColor,
//               color: 'white',
//               padding: '2px 6px',
//               borderRadius: '12px',
//               fontSize: '0.6rem',
//               fontWeight: 'bold',
//               whiteSpace: 'nowrap',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
//               border: '2px solid #fff',
//               cursor: 'pointer' }}
//             onClick={(e) => {
//               e.stopPropagation();
//               window.location.href = `/project/${projectId}/event/${item.id}`;
//             }}
//           >
//             {item.name}
//             {isCompleted && <span style={{ marginLeft: '4px' }}>✓</span>}
//           </div>
//         </div>
//         <div style={{ position: 'absolute',
//           left: `${endPosition}px`,
//           top: `${dotTop}px`,
//           zIndex: 3 }}
//         >
//           <div style={{
//             backgroundColor: itemColor,
//             color: 'white',
//             padding: '2px 6px',
//             borderRadius: '12px',
//             fontSize: '0.6rem',
//             fontWeight: 'bold',
//             whiteSpace: 'nowrap',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
//             border: '2px solid #fff' }}
//           >
//             {new Date(item.plannedEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div
//       className="event-graph"
//       style={{
//         position: 'relative',
//         height: `${containerHeight}px`,
//         margin: '5px 0',
//         overflow: 'visible',
//       }}
//     >
//       <div style={{ width: '5760px', position: 'relative', height: '100%' }}>
//         {eventLevels.map(({ event, level }) => renderItem(event, level))}
//       </div>
//     </div>
//   );
// };

// Timeline Component (Middle Line)
const Timeline = () => {
  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return (
    <div
      className="timeline-line"
      style={{
        position: 'relative',
        height: '600px',
        width: '5760px',
      }}
    >
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

      {/* Today Pointer - positioned at center (2880px = 50% of 5760px) */}
      <div
        style={{
          position: 'absolute',
          left: '2880px',
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
    </div>
  );
};

// IssueGraph Component (Lower Half)
// const IssueGraph = ({ issues, projectId, utils }: { issues: Issue[], projectId: string, utils: any }) => {
//   const filteredIssues = issues.filter(issue => issue.status !== 'CLOSED');
//   const issueLevels = utils.getLevels(filteredIssues.map(issue => ({
//     id: issue.id,
//     name: issue.remedy,
//     projectId: issue.projectId,
//     plannedStart: issue.firstRaised,
//     plannedEnd: issue.updatedAt,
//     completed: issue.status === 'CLOSED',
//     isIssue: true,
//   })));

//   const containerHeight = 340;

//   const renderItem = (item: any, level: number) => {
//     const startPosition = utils.getEventPosition(item.plannedStart);
//     const endPosition = utils.getEventPosition(item.plannedEnd);
//     const itemColor = '#ffc107';
//     const durationInDays = (new Date(item.plannedEnd)
//       .getTime() - new Date(item.plannedStart).getTime()) / (1000 * 60 * 60 * 24);
//     // Issues should be positioned downward from top of container (340px container height)
//     // Place issues from top downward: (level * spacing)
//     const spacing = 50; // increased spacing to prevent cramping
//     const itemTop = (level + 1) * spacing;
//     const dotTop = itemTop - 9;

//     const currentDate = new Date();
//     const eventEndDate = new Date(item.plannedEnd);
//     const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, currentDate.getDate());
//     const isOldEvent = eventEndDate <= twoMonthsAgo;

//     if (durationInDays <= 5 || isOldEvent) {
//       return (
//         <div
//           key={item.id}
//           style={{
//             position: 'absolute',
//             left: `${startPosition}px`,
//             top: `${dotTop}px`,
//             zIndex: 3 }}
//         >
//           <div
//             role="button"
//             tabIndex={0}
//             style={{
//               backgroundColor: itemColor,
//               color: 'white',
//               padding: '2px 6px',
//               borderRadius: '12px',
//               fontSize: '0.6rem',
//               fontWeight: 'bold',
//               whiteSpace: 'nowrap',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
//               border: '2px solid #fff',
//               cursor: 'pointer',
//             }}
//             onClick={(e) => {
//               e.stopPropagation();
//               window.location.href = `/project/${projectId}/issue/${item.id}`;
//             }}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' || e.key === ' ') {
//                 e.preventDefault();
//                 e.stopPropagation();
//                 window.location.href = `/project/${projectId}/issue/${item.id}`;
//               }
//             }}
//           >
//             {new Date(item.plannedStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//             {' - '}
//             {item.name}
//             {' - '}
//             {new Date(item.plannedEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//           </div>
//         </div>
//       );
//     }

//     const leftPosition = Math.min(startPosition, endPosition);
//     const width = Math.abs(endPosition - startPosition);

//     return (
//       <div key={item.id}>
//         <div style={{ position: 'absolute',
//           left: `${leftPosition}px`,
//           top: `${itemTop - 1}px`,
//           width: `${width}px`,
//           height: '4px',
//           backgroundColor: itemColor,
//           opacity: 0.7,
//           zIndex: 2,
//           borderRadius: '2px' }}
//         />
//         <div style={{ position: 'absolute',
//           left: `${startPosition}px`,
//           top: `${dotTop}px`,
//           zIndex: 3 }}
//         >
//           <div
//             style={{ backgroundColor: itemColor,
//               color: 'white',
//               padding: '2px 6px',
//               borderRadius: '12px',
//               fontSize: '0.6rem',
//               fontWeight: 'bold',
//               whiteSpace: 'nowrap',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
//               border: '2px solid #fff',
//               cursor: 'pointer' }}
//             onClick={(e) => {
//               e.stopPropagation();
//               window.location.href = `/project/${projectId}/issue/${item.id}`;
//             }}
//           >
//             {item.name}
//           </div>
//         </div>
//         <div style={{
//           position: 'absolute',
//           left: `${endPosition}px`,
//           top: `${dotTop}px`,
//           transform: 'translateX(-50%)',
//           zIndex: 3 }}
//         >
//           <div style={{
//             backgroundColor: itemColor,
//             color: 'white',
//             padding: '2px 6px',
//             borderRadius: '12px',
//             fontSize: '0.6rem',
//             fontWeight: 'bold',
//             whiteSpace: 'nowrap',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
//             border: '2px solid #fff' }}
//           >
//             {new Date(item.plannedEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div
//       className="issue-graph"
//       style={{
//         position: 'relative',
//         height: `${containerHeight}px`,
//         margin: '5px 0',
//         overflow: 'visible',
//       }}
//     >
//       <div style={{ width: '5760px', position: 'relative', height: '100%' }}>
//         {issueLevels.map(({ event, level }) => renderItem(event, level))}
//       </div>
//     </div>
//   );
// };

// Main EventTimeline Component
const EventTimeline = ({ events, issues, projectId }: EventTimelineProps) => {
  const utils = useTimelineUtils(events, issues);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timelineContainerRef.current) {
      // Scroll to center (today's position at 2880px) minus half the container width
      const scrollPosition = 2880 - (timelineContainerRef.current.clientWidth / 2);
      timelineContainerRef.current.scrollLeft = Math.max(0, scrollPosition);
    }
  }, []);

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
        <Timeline />
      </div>
    </Container>
  );
};

export default EventTimeline;
