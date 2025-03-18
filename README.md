# Email Sentiment Analyzer

This project is a full-stack web application that analyzes the sentiment of user-submitted reviews using VADER sentiment analysis. Users can input their email along with a review, and the system will calculate a sentiment score. If the score is above 70, the system sends an automated response.

## Features
- Analyze sentiment of text using VADER
- Store analyzed emails and scores in MongoDB
- Display previous analyses
- Automatically send replies for high sentiment scores
- Frontend built with React (Vite) and TailwindCSS
- Backend built with Node.js and Express

## Tech Stack
### Frontend:
- React (Vite)
- Axios
- Framer Motion (for animations)

### Backend:
- Node.js (Express)
- MongoDB (Mongoose)
- VADER Sentiment Analysis
- Nodemailer (for sending emails)

## Setup Instructions
### 1️⃣ Clone the Repository
```sh
git clone YOUR_GITHUB_REPO_URL
cd projectName
```

### 2️⃣ Backend Setup
```sh
cd backend
npm install
```

#### Create a `.env` file in the `backend/` directory with:
```
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

```sh
node server.js
```
The backend will run on `http://localhost:5000`

### 3️⃣ Frontend Setup
```sh
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`

## API Endpoints
### Analyze Sentiment
**POST** `/analyze`
```json
{
  "email": "user@example.com",
  "emailText": "This is an amazing product!"
}
```
_Response:_
```json
{
  "score": 85
}
```

### Get All Analyzed Emails
**GET** `/emails`
_Response:_
```json
[
  {
    "email": "user@example.com",
    "emailText": "This is an amazing product!",
    "sentimentScore": 85
  }
]
```

## Deployment
- Frontend can be deployed using **Vercel** or **Netlify**
- Backend can be deployed using **Render** or **Heroku**
