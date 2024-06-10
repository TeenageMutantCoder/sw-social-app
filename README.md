# Social app

This is a social media web app that I am working on to develop my full-stack skills.

## How to use

### From web

Visit [https://social.stevon.dev/](https://social.stevon.dev/)

### From source

1. Clone the repository using `git clone git@github.com:TeenageMutantCoder/sw-social-app.git` or `git clone https://github.com/TeenageMutantCoder/sw-social-app`
2. Change to the repository directory using `cd sw-social-app`
3. Make a copy of [env.example](env.example) and rename it to `.env` using `cp env.example .env` (if using a Unix-based system) or `copy env.example .env` (if using Windows)
4. For the easiest setup, update the db provider (line 9) in [prisma\schema.prisma](prisma\schema.prisma) to be `"sqlite"`. Otherwise, edit the `DATABASE_URL` in your `.env` file to be the connection string for your PostgreSQL database
5. Install needed dependencies with `npm install`
6. Create/update database with `npx prisma db push`
7. Run the development server using `npm run dev`

## Tech stack

This project was bootstrapped using [create-t3-app](https://create.t3.gg/). That means that the main technologies used are:

- [Tailwind CSS](https://tailwindcss.com/)
- [tRPC](https://trpc.io/)
- [Next.JS](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)

I also included some other helpful libraries such as [React Hook Form](https://react-hook-form.com/).

## MVP

Here are the features that I will definitely add:

- [x] Name-based user auth (simpler to add and to use, at least for a portfolio project that is not meant to be a production app)
- [x] Post (text) creation, editing, and deletion
- [x] Likes on posts and comments
- [x] Comments (text) on posts (creation, editing, deleting)

## Future Improvements

Here are other things that I may add in the future:

- [ ] Algorithm for displaying new content
- [ ] More sophisticated user auth
- [ ] Friends list
- [ ] Direct private messaging
- [ ] Increased profile customization
- [ ] Search for posts/comments/users
- [ ] Save a user's favorite posts/comments
- [ ] Block users
- [ ] Multimedia posts
- [ ] Multimedia comments
- [ ] Rich-text support
- etc.
