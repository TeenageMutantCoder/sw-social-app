import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { useSession, signIn, signOut } from "next-auth/react";

const Home: NextPage = () => {
  const { data } = useSession();

  if (data) {
    return (
      <>
        <p>Signed in as {JSON.stringify(data)}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
};

export default Home;
