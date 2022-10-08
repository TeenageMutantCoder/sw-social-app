import { useSession, signIn, signOut } from 'next-auth/react';
import Button from './button';
import Link from 'next/link';

const ctaButtonClassNames =
  'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800';

const Navbar = () => {
  const { status } = useSession();
  return (
    <nav className="bg-white px-2 sm:px-4 py-2.5 dark:bg-gray-900 sticky w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <Link
          href="/"
          className="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
        >
          Social App
        </Link>
        <div className="flex md:order-2">
          {status === 'authenticated' && (
            <Button className={ctaButtonClassNames} onClick={() => signOut()}>
              Sign out
            </Button>
          )}
          {status === 'unauthenticated' && (
            <Button className={ctaButtonClassNames} onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
