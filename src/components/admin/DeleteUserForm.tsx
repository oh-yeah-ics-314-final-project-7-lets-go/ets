'use client';

import { deleteUser } from '@/lib/dbActions';
import { Button } from 'react-bootstrap';
import { PersonDashFill } from 'react-bootstrap-icons';
import swal from 'sweetalert';

const DeleteUserForm = ({ id } : { id: number }) => (
  <form
    action={async () => {
      await deleteUser(id);
      await swal(
        'Success',
        'The user was deleted.',
        'success',
      );
    }}
  >
    <Button variant="danger" size="sm" type="submit">
      <PersonDashFill />
      {' '}
      Delete
    </Button>
  </form>
);

export default DeleteUserForm;
