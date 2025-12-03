'use client';

import { deleteUser } from '@/lib/dbActions';
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { PersonDashFill } from 'react-bootstrap-icons';
import swal from 'sweetalert';

const DeleteUserForm = ({ id } : { id: number }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = async () => {
    await deleteUser(id);
    await swal(
      'Success',
      'The user was deleted.',
      'success',
    );
    setShowDeleteModal(false);
  };

  return (
    <>
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fw-bold text-danger">Are you sure you want to delete this user?</p>
          <p className="text-muted">
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
      <form
        action={() => setShowDeleteModal(true)}
      >
        <Button variant="danger" size="sm" type="submit">
          <PersonDashFill />
          {' '}
          Delete
        </Button>
      </form>
    </>
  );
};

export default DeleteUserForm;
