import type { ReactNode } from 'react';
import Navbar from './navbar';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="px-6">{children}</div>
    </>
  );
};

export default Layout;
