import { ProjectStatus } from '@prisma/client';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ExclamationTriangleFill, ExclamationOctagonFill, CheckCircleFill } from 'react-bootstrap-icons';

const StatusTooltip = ({ status }: { status: ProjectStatus }) => {
  if (status === ProjectStatus.PENDING) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>This project is pending admin approval.</Tooltip>}
      >
        <ExclamationTriangleFill className="text-warning me-1" />
      </OverlayTrigger>
    );
  }
  if (status === ProjectStatus.DENIED) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>This project was denied by an admin.</Tooltip>}
      >
        <ExclamationOctagonFill
          className="text-danger me-1"
        />
      </OverlayTrigger>
    );
  }
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>This project was approved by an admin.</Tooltip>}
    >
      <CheckCircleFill
        className="text-success me-1"
      />
    </OverlayTrigger>
  );
};

export default StatusTooltip;
