import type { ReactNode } from 'react';
import Navbar from './navbar';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="px-6">
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
