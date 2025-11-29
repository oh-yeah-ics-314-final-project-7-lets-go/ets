'use client';

import { useState } from 'react';
import { Button, Badge, ProgressBar, Modal } from 'react-bootstrap';
import { Project } from '@prisma/client';
import Link from 'next/link';
import { formatCurrency, formatDateShort, getProgressVariant } from '@/lib/util';
import StatusTooltip from './StatusTooltip';
// import { deleteProject } from '@/lib/dbActions';

interface ProjectItemProps extends Project {
  creatorEmail: string;
  report: {
    progress: number;
    paidUpToNow: number;
  };
}

const ProjectItem = ({
  id,
  name,
  status,
  originalContractAward,
  report,
  updatedAt,
  creatorEmail,
}: ProjectItemProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    // await deleteProject(id);
    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const { paidUpToNow: totalPaidOut, progress } = report;

  // Calculate budget utilization
  const budgetUtilized = (totalPaidOut / originalContractAward) * 100;

  // Determine budget status
  const getBudgetStatus = () => {
    if (budgetUtilized > 100) {
      return <Badge bg="danger">Over Budget</Badge>;
    } if (budgetUtilized > 90) {
      return <Badge bg="warning">Near Limit</Badge>;
    }
    return <Badge bg="success">On Track</Badge>;
  };

  return (
    <>
      <tr style={{ cursor: 'pointer' }}>
        <td>
          <StatusTooltip {...{ status }} type="project" />
          <Link className="fw-bold text-black" href={`/project/${id}`}>
            {name}
          </Link>
        </td>
        <td>{formatCurrency(originalContractAward)}</td>
        <td>{formatCurrency(totalPaidOut)}</td>
        <td>
          <div style={{ minWidth: '120px' }}>
            <ProgressBar
              now={progress}
              label={`${progress.toFixed(1)}%`}
              variant={getProgressVariant(progress)}
              style={{ height: '20px' }}
            />
          </div>
        </td>
        <td>{getBudgetStatus()}</td>
        <td><small className="text-muted">{formatDateShort(updatedAt)}</small></td>
        <td>{creatorEmail}</td>
        <td onClick={(e) => e.stopPropagation()}>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" href={`/project/${id}/edit/`}>Edit</Button>
            <Button variant="outline-danger" size="sm" onClick={handleDeleteClick}>Delete</Button>
          </div>
        </td>
      </tr>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Project Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the project report for:</p>
          <p className="fw-bold text-danger">
            &quot;
            {name}
            &quot;
          </p>
          <p className="text-muted">
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Project
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProjectItem;
