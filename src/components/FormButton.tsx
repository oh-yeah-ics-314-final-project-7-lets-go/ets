'use client';

import React from 'react';
import { Button } from 'react-bootstrap';

interface FormButtonProps extends React.ComponentProps<typeof Button> {
  variant: 'primary' | 'cancel';
}

const FormButton: React.FC<FormButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => (
  <Button
    {...props}
    className={`form-btn ${variant === 'cancel' ? 'form-btn-cancel' : ''} ${className}`}
  >
    {children}
  </Button>
);

export default FormButton;
