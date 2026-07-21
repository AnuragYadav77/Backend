# 🎬 Video Sharing Platform (Backend)

A robust backend API for a **video sharing platform** inspired by YouTube, built using **Node.js, Express.js, and MongoDB**. The application supports video uploads, user authentication, subscriptions, playlists, tweets, likes, comments, and many other social features.

---

## 🚀 Features

### 👤 User Management
- User Registration & Login
- JWT Authentication (Access & Refresh Tokens)
- Secure Password Hashing with bcrypt
- Logout from current device
- Change Password
- Update Account Details
- Update Avatar & Cover Image
- User Profile Management

### 📹 Video Features
- Upload Videos
- Delete Videos
- Update Video Details
- Publish / Unpublish Videos
- Watch Videos
- View History
- Dashboard Statistics

### ❤️ Social Features
- Like / Unlike Videos
- Like Comments
- Like Tweets
- Add Comments
- Delete Comments
- Reply Support (if implemented)

### 📝 Tweet Feature
- Create Tweet
- Update Tweet
- Delete Tweet
- View User Tweets

### 📂 Playlist
- Create Playlist
- Update Playlist
- Delete Playlist
- Add Videos to Playlist
- Remove Videos from Playlist
- View Playlist

### 🔔 Subscription System
- Subscribe to Channels
- Unsubscribe
- View Subscriber Count
- View Subscribed Channels

### 📊 Dashboard
- Channel Statistics
- Total Views
- Total Subscribers
- Total Videos
- User Dashboard APIs

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Backend Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Cloudinary | Media Storage |
| Multer | File Upload |
| Cookie Parser | Cookie Handling |
| CORS | Cross-Origin Requests |

---

# 📁 Project Structure

```
src/
│
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── db/
├── constants/
├── app.js
└── index.js
```

---

# 🔐 Authentication

Authentication is implemented using:

- Access Token
- Refresh Token
- HTTP Only Cookies
- JWT Authentication

Protected routes require a valid access token.

---

# 📦 Installation

Clone the repository

```bash
git clone https://github.com/AnuragYadav77/Backend.git
```

Go inside the project

```bash
cd Backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file in the root directory.

Example:

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CORS_ORIGIN=http://localhost:3000
```

Run the server

```bash
npm run dev
```

Server runs at

```
http://localhost:8000
```

---

---

# 🏗️ Database Schema

The complete database schema and relationship diagram for this project can be viewed here:

**Eraser Model Diagram:**  
https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj

This diagram illustrates the relationships between all major collections including:

- 👤 Users
- 📹 Videos
- 💬 Comments
- ❤️ Likes
- 📝 Tweets
- 📂 Playlists
- 🔔 Subscriptions

It provides a high-level overview of the application's data model and how different entities interact.

---

# 📡 API Endpoints

## User

- Register
- Login
- Logout
- Refresh Access Token
- Change Password
- Update Account
- Get Current User
- Update Avatar
- Update Cover Image
- Watch History

## Videos

- Upload Video
- Get Video
- Get All Videos
- Update Video
- Delete Video
- Toggle Publish Status

## Comments

- Add Comment
- Update Comment
- Delete Comment
- Get Video Comments

## Likes

- Toggle Video Like
- Toggle Comment Like
- Toggle Tweet Like
- Get Liked Videos

## Tweets

- Create Tweet
- Update Tweet
- Delete Tweet
- Get User Tweets

## Playlist

- Create Playlist
- Update Playlist
- Delete Playlist
- Add Video
- Remove Video
- Get Playlist

## Subscription

- Subscribe Channel
- Unsubscribe Channel
- Get Subscribers
- Get Subscribed Channels

## Dashboard

- Channel Stats
- Channel Videos

---

# ☁️ File Uploads

Media files are stored using **Cloudinary**.

Supported uploads:

- User Avatar
- Cover Image
- Video Files
- Video Thumbnail

---

# 🧪 Testing

The APIs can be tested using:

- Postman

---

# 🔒 Security

- JWT Authentication
- Password Hashing using bcrypt
- HTTP Only Cookies
- Input Validation
- Protected Routes
- MongoDB Aggregation Pipelines

---

# 📚 Concepts Used

- REST API
- MVC Architecture
- MongoDB Aggregation
- Authentication & Authorization
- Middleware
- File Upload Handling
- Cookie Based Authentication
- Cloud Storage Integration
- Error Handling
- Async/Await
- Custom API Response
- Custom Error Handling

---

# 📸 Future Improvements

- Notifications
- Search Functionality
- Video Recommendations
- Real-time Chat
- Live Streaming
- Video Processing Queue
- Email Verification
- Forgot Password
- Admin Dashboard

---

# 👨‍💻 Author

**Anurag Yadav**

GitHub: https://github.com/AnuragYadav77

---

# ⭐ Show your support

If you found this project useful, consider giving it a ⭐ on GitHub.
