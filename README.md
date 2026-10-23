# Era Beats - Music Streaming App

A full-stack music streaming web app built with the MERN stack. Admins upload songs and users sign up to listen to them.

**Live Demo:** https://era-beats-5cjf.vercel.app

## Features

- Admin can upload and manage songs
- Users can sign up, log in and stream songs (users cannot upload)
- Role-based access: separate permissions for Admin and User
- Responsive UI with a mobile sidebar drawer

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Deployment:** Vercel

## Run Locally

1. Clone the repo
   ```
   git clone https://github.com/Vishant688/EraBeats.git
   cd EraBeats
   ```
2. Install dependencies and start the backend
   ```
   npm install
   node server.js
   ```
3. Start the frontend
   ```
   cd frontend
   npm install
   npm run dev
   ```
4. Create a `.env` file with your MongoDB connection string (for example `MONGO_URI=your_connection_string`).

## Author

Vishant Rawat - [LinkedIn](https://www.linkedin.com/in/vishant-rawat-4948b9292) | [GitHub](https://github.com/Vishant688)
