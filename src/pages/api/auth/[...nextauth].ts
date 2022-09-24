import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { prisma } from '../../../server/db/client';

const credentialsProvider = CredentialsProvider({
  // The name to display on the sign in form (e.g. 'Sign in with...')
  name: 'Username',
  // The credentials is used to generate a suitable form on the sign in page.
  // You can specify whatever fields you are expecting to be submitted.
  // e.g. domain, username, password, 2FA token, etc.
  // You can pass any HTML attribute to the <input> tag through the object.
  credentials: {
    username: {
      label: 'Username',
      type: 'text',
      placeholder: 'Input your username',
    },
  },
  async authorize(credentials) {
    if (!credentials?.username) return null;

    const existingUser = await prisma.user.findUnique({
      where: {
        name: credentials.username,
      },
    });
    if (existingUser) return existingUser;

    const newUser = await prisma.user.create({
      data: {
        name: credentials.username,
      },
    });
    return newUser;
  },
});

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  providers: [credentialsProvider],
};

export default NextAuth(authOptions);
