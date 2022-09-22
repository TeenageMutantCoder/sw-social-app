import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

const Navbar = () => {
  const { status } = useSession();
  return (
    <nav className="navbar">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          Social App
        </Link>
      </div>
      <div className="flex-none">
        {status === 'authenticated' && (
          <button className="btn" onClick={() => signOut()}>
            Sign out
          </button>
        )}
        {status === 'unauthenticated' && (
          <button className="btn" onClick={() => signIn()}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
