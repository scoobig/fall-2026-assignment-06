# Articles & Comments SPA

**Course:** Software Engineering
**Topic:** Single Page Applications, React, & REST API Integration
**Tech Stack:** React, TypeScript, Vite (client) · Express, Kysely, PostgreSQL (server)
**Total Points:** 20 Points

---

## Overview

For this project, you will build a **Single Page Application (SPA)** in React that consumes a fully-implemented REST API for managing articles and their comments.

The backend server is provided for you in the `server/` directory. Your job is to create a `client/` directory containing a React application that lets users:

- Browse a list of all articles
- Read a single article and its comments
- Create, edit, and delete articles
- Create, edit, and delete comments on an article

All navigation and data updates must happen **without full page reloads**. This is the defining characteristic of a Single Page Application.

> **Note:** You do **not** need to implement authentication, user accounts, or any backend changes. Focus entirely on React component design, state management, and communicating with the provided API.

---

## Project Structure

Your finished repository should look like this:

```text
fall-2026-assignment-06/
├── client/               # Your React SPA (you will create this)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page-level components (one per route)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/               # Provided Express API (do not modify)
│   ├── src/
│   ├── .env              # Created from .env.sample
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Step 1: Start the Database

The server requires a PostgreSQL database. A Docker Compose file is provided:

```bash
cd server
docker compose up -d
```

### Step 2: Configure the Server Environment

Copy the sample environment file and adjust if needed:

```bash
cp .env.sample .env
```

The defaults work out of the box if you used Docker Compose in Step 1.

### Step 3: Run Database Migrations

```bash
npm install
npm run migrate
```

### Step 4: Start the API Server

```bash
npm run dev
```

The API will be available at `http://localhost:8080`. You can verify it is running by visiting `http://localhost:8080/health`.

### Step 5: Scaffold Your React Client

Use vite to scaffold out a new frontend application in its own directory here at the project root. Remember to set the correct TypeScript version from the lecture video if you have issues!

### Step 6: Start the React Client

From the project root, with the API already running on port 8080:

```bash
cd client
npm install
npm run dev
```

The app is served at `http://localhost:5173` and talks to the API at `http://localhost:8080`. Navigation and updates stay on that page; nothing requires a full reload.

---

## API Reference

All routes are prefixed with `http://localhost:8080`.

### Articles

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/articles` | List all articles. Accepts `?title_contains=` query param. |
| `GET` | `/articles/:articleId` | Get a single article. |
| `POST` | `/articles` | Create an article. Body: `{ title, contents }` |
| `PUT` | `/articles/:articleId` | Update an article. Body: `{ title?, contents? }` |
| `DELETE` | `/articles/:articleId` | Delete an article (cascades to its comments). |

### Comments

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/articles/:articleId/comments` | List all comments for an article. |
| `GET` | `/articles/:articleId/comments/:commentId` | Get a single comment. |
| `POST` | `/articles/:articleId/comments` | Create a comment. Body: `{ body }` |
| `PUT` | `/articles/:articleId/comments/:commentId` | Update a comment. Body: `{ body }` |
| `DELETE` | `/articles/:articleId/comments/:commentId` | Delete a comment. |

---

## Requirements

### Articles

Use **React Router** for client-side navigation between views.

**Article List View**

- Fetches and displays all articles from `GET /articles` when the component mounts.
- Shows each article's title and a truncated preview of its contents.
- Provides a link/button on each article that navigates to that article's detail view.
- Includes a search input that filters articles by title using the `?title_contains=` query parameter. The search should re-fetch from the API (not filter locally).
- Includes a button to navigate to a "Create Article" form.

**Article Detail View**

- Fetches and displays the full article (`GET /articles/:articleId`).
- Displays the article's title and full contents.
- Includes an **Edit** button that either navigates to an edit form or reveals an inline edit form.
- Includes a **Delete** button that calls `DELETE /articles/:articleId`, then redirects the user back to the article list.
- Renders the Comments section (see below).

**Create & Edit Article Forms**

- **Create:** `POST /articles` with `{ title, contents }`, then redirect to the new article's detail view.
- **Edit:** Pre-populate fields with existing data, submit via `PUT /articles/:articleId`, then redirect to the updated article's detail view.
- Display a validation message if either field is left blank before submitting.

---

### Comments

All comment interactions must update the UI **without navigating away from the article page**.

**Comments List**

- Fetch and display all comments for the article from `GET /articles/:articleId/comments` when the article loads.
- Display each comment's body.
- Display a message like *"No comments yet."* when the list is empty.

**Add a Comment**

- Include a form below the comments list with a textarea for the comment body.
- On submit, call `POST /articles/:articleId/comments` with `{ body }`.
- Append the new comment to the displayed list without a full page reload.
- Clear the textarea after a successful submission.
- Show a validation message if the body is empty.

**Edit a Comment**

- Clicking **Edit** on a comment reveals an inline edit form pre-populated with the comment's current body.
- On submit, call `PUT /articles/:articleId/comments/:commentId` with `{ body }`.
- Update the comment in the list in place without a full page reload.
- Cancelling the edit restores the original read view.

**Delete a Comment**

- Each comment includes a **Delete** button that calls `DELETE /articles/:articleId/comments/:commentId`.
- Remove the comment from the displayed list without a full page reload.

---

## Grading Rubric

| Criterion | Points | Description |
|-----------|--------|-------------|
| Article List View | 2 | Lists articles fetched from the API; links to detail view; includes a "Create" entry point. |
| Title Search | 2 | Search input re-fetches from the API using `?title_contains=`; results update without a page reload. |
| Article Detail View | 2 | Displays full article; includes working Edit and Delete controls. |
| Create Article Form | 2 | Submits to the API; redirects on success; validates blank fields. |
| Edit Article Form | 2 | Pre-populates with existing data; submits update to API; redirects on success. |
| Comments List | 2 | Comments fetched and displayed within the Article Detail View; shows empty state message. |
| Add Comment | 2 | Form submits to the API; new comment appears in the list without a page reload; textarea clears; validates empty body. |
| Edit Comment | 2 | Inline edit form appears on click; submits update to API; comment updates in place; cancel restores original view. |
| Delete Comment | 2 | Delete button calls the API; comment is removed from the list without a page reload. |
| Consistent Styling | 2 | The application has a coherent visual style across all views. UI communicates state clearly (loading, empty, error). Interactive elements have appropriate hover/focus styles. |
| **Total** | **20** | |
