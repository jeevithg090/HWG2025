#  All-in-One Tech Collaboration Platform


## Overview

This is a full-stack web application designed to bring together freelancers, tech communities, and event organizers on a single platform. Instead of switching between Upwork, Eventbrite, and chat apps like Discord or WhatsApp, users can now find gigs, host events, and collaborate in real-time — all in one place.



**This is a unified web-based platform** combining:
- A freelancing marketplace for tech gigs
- An event organizing module for hackathons, webinars, and meetups
- A real-time community system (chat, groups, DMs)

---

## 🚀 Key Features

### 🧑‍💻 Freelancing Module
- Create gig listings (startups/clients)
- Freelancers apply with proposals
- Profile creation and review system
- Dashboard for project tracking

### 📅 Event Management
- Create events with title, description, time, venue/online link
- Admin tools for attendee management
- List and browse hackathons, meetups, webinars

### 💬 Community + Chat System
- Real-time 1:1 and group chat (Socket.io or Firebase)
- Media sharing, announcements
- Public/private groups
- Real-time messaging

---

## 🧠 Bonus Features 
- 💳 Stripe/Razorpay for freelance payments
- 🔔 Event reminders (email/push)
- 🤖 AI-based gig suggestions
- 📊 Admin dashboard with analytics
- 📞 Voice/video calling (future scope)

---

## 🛠️ Tech Stack

Layer - Technologies Used                      
Frontend - Next.js + Tailwind CSS             
Backend - Node.js + Express.js                
Database - Postgres , MongoDB               
Authentication - JWT / Firebase Auth                    
Chat System  - Socket.io / Firebase Realtime DB       
Storage - Firebase Storage / AWS S3              
Hosting - Vercel (Frontend), Render/Railway (Backend) 

---

## 🖥 Steps to run

We have Dockerfile in every individual server and docker-compose file contains all the services and volumes that need to be run.

### Prerequisites

Make sure you have docker installed in your machine.
Then to run the repository, run following command in the source directory (the one with docker-compose file)

```bash
docker compose up -d
```
In case something breaks, use following command to take down all the containers and images and volume and re-run above command again


```bash
docker rm -f $(docker ps -aq)
docker rmi -f $(docker images -q)
docker system prune -a --volumes -f
docker volume rm -f $(docker volume ls -q)
```

To run frontend

```bash
cd packages/frontend
npm run build
npm run start
```


### Contributors

Made with ❤️ by our Hackathon Team.
