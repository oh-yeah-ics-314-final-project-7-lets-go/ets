'use client';

import { PropsWithChildren } from 'react';
import { Alert } from 'react-bootstrap';

const Banner = ({ children, className, variant, dismissible }:
PropsWithChildren & {
  className: string;
  variant: string;
  dismissible?: boolean;
}) => (
  <Alert
    variant={variant}
    dismissible={dismissible ?? true}
    className={`fade show d-flex text-center rounded-start-0 rounded-end-0 ${className}`}
    role="alert"
  >
    <div className="mx-auto">{children}</div>
  </Alert>
);

Banner.defaultProps = {
  dismissible: true,
};

export default Banner;
