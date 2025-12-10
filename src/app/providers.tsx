'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/context/ThemeContext';
import AppTheme from '@/components/dashboard/shared-theme/AppTheme';

type Props = {
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

const Providers = ({ children }: Props) => (
  <ThemeProvider>
    <AppTheme>
      <SessionProvider>
        {children}
      </SessionProvider>
    </AppTheme>
  </ThemeProvider>
);

export default Providers;
