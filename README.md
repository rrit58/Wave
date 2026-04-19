Component,Technology,Why this specific choice?
Frontend,Next.js 15 (App Router),"Best for SEO, Routing, and rendering the UI fast."
Backend,Node.js + Express,The industry king for WebSockets (Socket.io). It handles thousands of open chat connections easily.
Language,TypeScript,"Shared types between Frontend & Backend (e.g., User interface) prevents bugs."
Database,PostgreSQL,"Best for ""Relational"" data (Friends, Groups, Posts). Much better structure than MongoDB."
ORM,Prisma,Makes talking to the Database easy. It auto-generates TypeScript types from your DB schema.
Auth,Clerk,"Handles Login/Sign-up UI, Sessions, and security for you. Saves you 2 weeks of work."
Real-Time,Socket.io,For Chat & Notifications.
Video,PeerJS (WebRTC),For the Video Calls (Peer-to-Peer).
AI,MediaPipe (Client-Side),Runs in the browser to detect hands instantly without lagging the server.