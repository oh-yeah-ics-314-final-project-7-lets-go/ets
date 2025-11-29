import { ProjectStatus } from '@prisma/client';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ExclamationTriangleFill, ExclamationOctagonFill, CheckCircleFill } from 'react-bootstrap-icons';

type StatusFor = 'project' | 'report';

const StatusTooltip = ({ status, type }: { status: ProjectStatus, type: StatusFor }) => {
  if (status === ProjectStatus.PENDING) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={(
          <Tooltip>
            This
            {' '}
            {type}
            {' '}
            is pending admin approval.
          </Tooltip>
)}
      >
        <ExclamationTriangleFill className="text-warning me-2" />
      </OverlayTrigger>
    );
  }
  if (status === ProjectStatus.DENIED) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={(
          <Tooltip>
            This
            {' '}
            {type}
            {' '}
            was denied by an admin.
          </Tooltip>
)}
      >
        <ExclamationOctagonFill
          className="text-danger me-2"
        />
      </OverlayTrigger>
    );
  }
  return (
    <OverlayTrigger
      placement="top"
      overlay={(
        <Tooltip>
          This
          {' '}
          {type}
          {' '}
          was approved by an admin.
        </Tooltip>
)}
    >
      <CheckCircleFill
        className="text-success me-2"
      />
    </OverlayTrigger>
  );
};

export default StatusTooltip;
