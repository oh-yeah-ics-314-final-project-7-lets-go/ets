'use client';

import { resetPassword } from '@/lib/dbActions';
import { Button } from 'react-bootstrap';
import { PersonFillExclamation } from 'react-bootstrap-icons';
import swal from 'sweetalert';

const ResetPasswordForm = ({ id } : { id: number }) => (
  <form
    action={async () => {
      const newPassword = await resetPassword(id);
      await swal(
        'Success',
        `Please give the user the password for their account: ${newPassword}`,
        'success',
      );
    }}
  >
    <Button variant="warning" size="sm" type="submit">
      <PersonFillExclamation />
      {' '}
      Reset password
    </Button>
  </form>
);

export default ResetPasswordForm;
