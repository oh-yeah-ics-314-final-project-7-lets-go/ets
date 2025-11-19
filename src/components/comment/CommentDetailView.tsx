'use client';

import { useState } from 'react';
import { Comment, Project } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { deleteComment } from '@/lib/dbActions';
import { Modal, Button } from 'react-bootstrap';

interface CommentDetailViewProps {
  comment: Comment & { author: { firstName: string; lastName: string } };
  project: Project;
}

const CommentDetailView = ({ comment, project }: CommentDetailViewProps) => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDeleteClick = () => setShowConfirm(true);

  const confirmDelete = async () => {
    await deleteComment(comment.id);
    setShowConfirm(false);
    router.push(`/projects/${project.id}`);
  };

  const handleBackToProject = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="container mt-4">
      {/* Header / Breadcrumb */}
      <div className="row mb-4">
        <div className="col">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={handleBackToProject}
                >
                  {project.name}
                </button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Comment #
                {comment.id}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Comment Details Card */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                Comment #
                {comment.id}
              </h4>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDeleteClick}
              >
                <i className="bi bi-trash" />
                Delete
              </button>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6 className="text-muted">Author</h6>
                <p className="mb-0">
                  {comment.author
                    ? `${comment.author.firstName} ${comment.author.lastName}`
                    : 'Unknown'}
                </p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted">Content</h6>
                <p className="mb-0">{comment.content}</p>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted">Created At</h6>
                  <p className="mb-0">{formatDate(comment.createdAt)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted">Last Updated</h6>
                  <p className="mb-0">{formatDate(comment.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Comment Information</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">Project</small>
                <div>{project.name}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Comment ID</small>
                <div>{comment.id}</div>
              </div>
              <div className="mb-3">
                <small className="text-muted">Days Since Creation</small>
                <div>
                  {Math.ceil(
                    (new Date().getTime() - new Date(comment.createdAt).getTime()) / (1000 * 60 * 60 * 24),
                  )}
                  {' '}
                  days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Confirm Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this comment? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommentDetailView;
