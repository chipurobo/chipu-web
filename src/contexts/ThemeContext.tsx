// DEPRECATED — theme switching has been removed. This file is kept only
// to avoid breaking any unexpected imports during the transition. Safe to
// delete.

import { ReactNode } from 'react';

export const ThemeProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

export const useTheme = () => ({ theme: 'light' as const, toggleTheme: () => {} });
