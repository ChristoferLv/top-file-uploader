# File Uploader

A file storage and sharing app built as part of [The Odin Project Node.js](https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs) course. It combines authentication, file uploads, folders, and share links using Express and Prisma.

## Objective

The goal of this project was to practice:
- Handling multipart file uploads
- Building authenticated flows with sessions
- Managing folders and file relationships
- Using Prisma with PostgreSQL
- Organizing a larger Node.js app into routes, controllers, and database layers

## What is it?

A small cloud-style file manager where users can:
- Sign up and log in
- Upload files
- Organize files into folders
- Download and delete files
- Share folders through generated links

## How to Use

1. Open the project folder.
2. Install dependencies:

```bash
npm install
```

3. Configure your environment variables using `.env.example` as a reference.
4. Make sure the Prisma database is ready for local development.
5. Start the development server:

```bash
npm run dev
```

6. Open the browser at `http://localhost:3000`.

## Features

- **File upload**: users can upload files to the application
- **Folder management**: folders can be created, renamed, and deleted
- **Download and delete actions**: files can be retrieved or removed
- **Share links**: folders can be shared using public links
- **Session-based auth**: login state is stored with server-side sessions
- **Prisma-backed storage**: file, folder, and session data are managed through Prisma and PostgreSQL

## Project Structure

- `index.js`: Express app bootstrap and middleware setup
- `authUtils.js`: Passport and authentication helpers
- `routes/`: auth, file, and folder routes
- `controllers/`: request handlers for auth, files, and folders
- `db/` and `lib/`: database and Prisma helpers
- `prisma/`: schema and Prisma-related files
- `views/`: EJS templates
- `public/`: static assets

## Technologies Used

- Node.js
- Express
- EJS
- PostgreSQL
- Prisma
- Passport
- Passport Local
- express-validator
- express-session
- Multer
- bcryptjs

---

Project developed following: [The Odin Project - File Uploader](https://www.theodinproject.com/lessons/nodejs-file-uploader)

📍 **Main repository with all projects**: [ChristoferLv/TheOdinProject](https://github.com/ChristoferLv/TheOdinProject)
