'use client';

import { Comment, Project } from '@prisma/client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { deleteComment, editComment } from '@/lib/dbActions';
import {
  Modal, Button, Card, CardHeader, Col, Row, CardBody, ListGroup, ListGroupItem, FormSelect } from 'react-bootstrap';
import { Pencil, Trash } from 'react-bootstrap-icons';
import AddCommentForm from './comment/AddCommentForm';

interface CommentTableProps {
  project: Project;
  comments: (Comment & {
    author: {
      firstName: string;
      lastName: string;
    };
  })[];
}

const CommentTable = ({ project, comments = [] }: CommentTableProps) => {
  const { data } = useSession();

  const userId = (data?.user as { id?: string })?.id;
  const isETS = (data?.user as { randomKey: string })?.randomKey === 'ETS';

  const [filter, setFilter] = useState<string>('LATEST');

  // STATE for Editing & Deleting
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const getFilteredComments = () => {
    let filtered = [...comments];

    if (filter === 'LATEST') {
      filtered = filtered
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    } else if (filter === 'ALL') {
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    // Finally return sorted oldest → newest for display
    return filtered.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  };

  const sortedComments = getFilteredComments();

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditedContent(comment.content);
  };

  const saveEdit = async (comment: Comment) => {
    await editComment({
      ...comment,
      content: editedContent,
    });

    setEditingId(null);
  };

  const askDelete = (id: number) => {
    setCommentToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (commentToDelete) {
      await deleteComment(commentToDelete);
    }
    setShowConfirm(false);
  };

  return (
    <Row className="mt-4">
      <Col>
        <Card>
          <CardHeader className="d-flex gap-2 align-items-center">
            <h3 className="mb-0">Comments</h3>
            <div className="ms-auto d-flex align-items-center gap-2">
              <FormSelect
                size="sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="LATEST">Latest 5</option>
                <option value="ALL">Show All</option>
              </FormSelect>
            </div>
            <Button
              onClick={() => setShowCommentDialog(!showCommentDialog)}
              variant="outline-primary"
              size="sm"
            >
              {showCommentDialog ? 'Hide Comment Dialog' : 'Add Comment'}
            </Button>
          </CardHeader>

          <CardBody>
            {showCommentDialog && <AddCommentForm project={project} />}
            <ListGroup>
              {sortedComments.length > 0 ? (
                sortedComments.map((comment) => {
                  const isAuthor = userId === comment.authorId.toString();

                  return (
                    <ListGroupItem key={comment.id}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1 pe-3">
                          <small className="text-muted">
                            <b className="me-1">
                              {comment.author.firstName}
                              {' '}
                              {comment.author.lastName}
                            </b>
                            {' '}
                            Created:
                            {' '}
                            {formatDate(comment.createdAt)}
                            {' '}
                            | Updated:
                            {' '}
                            {formatDate(comment.updatedAt)}
                          </small>
                          {editingId === comment.id ? (
                            <>
                              <textarea
                                className="form-control mt-2"
                                rows={3}
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                              />

                              <div className="d-flex gap-2 mt-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  type="button"
                                  onClick={() => saveEdit(comment)}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <p className="mb-0 mt-1">
                              {comment.content}
                            </p>
                          )}
                        </div>

                        <div className="d-flex flex-row gap-2 align-self-start">
                          {isAuthor && editingId !== comment.id && (
                            <Button
                              variant="warning"
                              title="Edit"
                              type="button"
                              size="sm"
                              onClick={() => startEdit(comment)}
                            >
                              <Pencil />
                            </Button>
                          )}

                          {(isETS || isAuthor) && (
                            <Button
                              type="button"
                              title="Delete"
                              variant="danger"
                              size="sm"
                              onClick={() => askDelete(comment.id)}
                            >
                              <Trash />
                            </Button>
                          )}
                        </div>
                      </div>
                    </ListGroupItem>
                  );
                })
              ) : (
                <ListGroupItem className="text-center text-muted">No comments found.</ListGroupItem>
              )}
            </ListGroup>
          </CardBody>
        </Card>
      </Col>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>Are you sure you want to delete this comment? This action cannot be undone.</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default CommentTable;
