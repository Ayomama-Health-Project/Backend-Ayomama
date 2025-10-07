# Ayomama Backend API 🤱🏽

## Overview

A robust Node.js Express backend for the Ayomama maternal health application, leveraging Mongoose for MongoDB data management and integrating AI (Groq) and communication services (Twilio, Nodemailer). This API provides essential functionalities for user management, appointment scheduling, AI-powered health assistance, and community health worker (CHW) operations, aiming to support expecting and new mothers.

## Features

- **User Authentication & Authorization**: Secure registration, login, logout, and password management (including OTP-based reset) for general users and Community Health Workers (CHWs).
- **Maternal Health Vitals Tracking**: Allows users to record antenatal vital updates (blood pressure, temperature, weight, blood level, prescribed/avoided drugs) and receive AI-generated supportive feedback.
- **AI Chat Assistant**: An intelligent chatbot, "Favour," provides supportive, culturally sensitive, and personalized guidance on pregnancy, childbirth, and maternal wellbeing in multiple languages.
- **Appointment Management**: Users can schedule, view, update, and delete hospital visits with detailed information on hospital, doctor, date, and time.
- **Automated Reminders**: Proactive SMS and email reminders for upcoming appointments to ensure mothers don't miss vital check-ups.
- **Nearby Hospital Search**: Integrates with geo-location services (OpenCage, Overpass API) to help users find nearby hospitals based on their coordinates.
- **Community Health Worker (CHW) Module**: Enables CHWs to register, manage their profiles, assign patients, and log patient visits.
- **User Profile Management**: Users can update their personal information, language preferences, and emergency contacts.

## Getting Started

### Installation

To get a copy of this project up and running on your local machine, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Ayomama-Health-Project/Backend-Ayomama.git
    ```
2.  **Navigate to the project directory**:
    ```bash
    cd Backend-Ayomama
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Set up Environment Variables**:
    Create a `.env` file in the root directory and populate it with the required variables (see `Environment Variables` section below).

5.  **Start the Server**:
    For development with hot-reloads:
    ```bash
    npm run dev
    ```
    For production:
    ```bash
    npm start
    ```

### Environment Variables

All required environment variables must be configured in a `.env` file in the project root.

| Variable              | Description                                         | Example                             |
| :-------------------- | :-------------------------------------------------- | :---------------------------------- |
| `PORT`                | Port on which the server will run                   | `3000`                              |
| `MONGO_URI`           | MongoDB connection string                           | `mongodb://localhost:27017/ayomama` |
| `JWT_SECRET`          | Secret key for signing JWTs                         | `your_jwt_secret_key`               |
| `EMAIL_HOST`          | Host for the SMTP server (Nodemailer)               | `smtp.gmail.com`                    |
| `EMAIL_PORT`          | Port for the SMTP server                            | `587`                               |
| `EMAIL_SECURE`        | `true` if SSL/TLS, `false` otherwise                | `false`                             |
| `EMAIL_USER`          | Email address for sending emails                    | `your_email@example.com`            |
| `EMAIL_PASS`          | Password for the email account                      | `your_email_password`               |
| `ACCOUNT_SID`         | Twilio Account SID                                  | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`   |
| `AUTH_TOKEN`          | Twilio Auth Token                                   | `your_twilio_auth_token`            |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (e.g., `+1234567890`)           | `+15017122661`                      |
| `OPENCAGE_API_KEY`    | OpenCage Data API key for geocoding                 | `your_opencage_api_key`             |
| `GROQ_API_KEY`        | Groq API key for AI chat assistant                  | `your_groq_api_key`                 |
| `NODE_ENV`            | Node.js environment (`development` or `production`) | `development`                       |

## API Documentation

The API is designed to support both general users and Community Health Workers (CHWs) with dedicated endpoints where necessary. Authentication is required for most endpoints.

### Base URL

The primary base URL for most user-centric endpoints is `http://localhost:3000/api`.
For Community Health Worker (CHW) authentication and related actions, the base URL is `http://localhost:3000/api/auth_chw`.
For CHW-specific patient actions, the base URL is `http://localhost:3000/api/patient`.

### Authentication

All protected routes require a JSON Web Token (JWT) passed in the `Authorization` header as a `Bearer` token.
Example: `Authorization: Bearer <your_access_token>`

### Endpoints

#### User Authentication and Management

#### POST /api/auth/register

Registers a new user.

**Request**:

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePassword123"
}
```

**Response**:

```json
{
  "message": "User registered successfully",
  "success": true,
  "data": {
    "_id": "65b267c7e90e7a2b9c7b13e9",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "createdAt": "2024-01-25T12:00:00.000Z",
    "updatedAt": "2024-01-25T12:00:00.000Z"
  }
}
```

**Errors**:

- 400: name, email and password are required
- 409: User already exists
- 500: Internal server error

#### POST /api/auth/login

Logs in an existing user and returns an access token. The token is also set as an HTTP-only cookie.

**Request**:

```json
{
  "email": "jane.doe@example.com",
  "password": "SecurePassword123"
}
```

**Response**:

```json
{
  "message": "Login successful",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWIyNjdjN2U5MGU3YTJiOWM3YjEzZTkiLCJpYXQiOjE3MDY3MTY4MDAsImV4cCI6MTcwNjcyNDAwMH0...."
}
```

**Errors**:

- 400: email and password are required
- 401: Invalid email or password
- 500: Internal server error

#### POST /api/auth/logout

Logs out the current user by clearing the authentication token cookie. Requires authentication.

**Request**:
(No request body)

**Response**:

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Errors**:

- 401: Unauthorized: You must be logged in to access this route
- 500: Internal server error

#### POST /api/auth/reset

Requests a password reset by sending an OTP to the user's email.

**Request**:

```json
{
  "email": "jane.doe@example.com"
}
```

**Response**:

```json
{
  "message": "OTP sent to email",
  "success": true
}
```

**Errors**:

- 404: User not found
- 500: Internal server error

#### POST /api/auth/verify

Verifies the provided OTP and resets the user's password.

**Request**:

```json
{
  "email": "jane.doe@example.com",
  "otp": "1234",
  "newPassword": "NewSecurePassword456"
}
```

**Response**:

```json
{
  "message": "Password reset successful",
  "success": true
}
```

**Errors**:

- 404: User not found
- 400: Invalid OTP
- 400: OTP expired
- 500: Internal server error

#### GET /api/user/

Retrieves the profile of the currently authenticated user. Requires authentication.

**Request**:
(No request body)

**Response**:

```json
{
  "message": "User found",
  "success": true,
  "data": {
    "_id": "65b267c7e90e7a2b9c7b13e9",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+2348012345678",
    "address": "123 Main St, City",
    "preferredLanguages": "en",
    "contact": "",
    "emergencyContact": [
      {
        "name": "John Doe",
        "phone": "+2347098765432",
        "email": "john.doe.emergency@example.com",
        "relationship": "Husband",
        "_id": "65b267c7e90e7a2b9c7b13eb"
      }
    ],
    "createdAt": "2024-01-25T12:00:00.000Z",
    "updatedAt": "2024-01-25T12:00:00.000Z"
  }
}
```

**Errors**:

- 401: Unauthorized
- 404: User not found
- 500: Internal server error

#### PUT /api/user/update-language

Updates the language preference for the authenticated user. Requires authentication.

**Request**:

```json
{
  "preferredLanguages": "yo"
}
```

**Response**:

```json
{
  "message": "Language preference updated",
  "success": true,
  "data": {
    "_id": "65b267c7e90e7a2b9c7b13e9",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "preferredLanguages": "yo",
    "createdAt": "2024-01-25T12:00:00.000Z",
    "updatedAt": "2024-01-25T12:05:00.000Z"
  }
}
```

**Errors**:

- 401: Unauthorized
- 500: Internal server error

#### PUT /api/user/profile-info

Updates the profile information (name, address, last period date, contact, emergency contact) for the authenticated user. Requires authentication.

**Request**:

```json
{
  "name": "Jane R. Doe",
  "address": "456 Oak Ave, Town, State",
  "lastPeriodDate": "2023-12-01",
  "contact": "+2349011223344",
  "emergencyContact": [
    {
      "name": "Emergency Contact Name",
      "phone": "+2348012345678",
      "email": "emergency@example.com",
      "relationship": "Husband"
    }
  ]
}
```

**Response**:

```json
{
  "message": "Profile updated",
  "success": true,
  "data": {
    "_id": "65b267c7e90e7a2b9c7b13e9",
    "name": "Jane R. Doe",
    "address": "456 Oak Ave, Town, State",
    "lastPeriodDate": "2023-12-01T00:00:00.000Z",
    "contact": "+2349011223344",
    "emergencyContact": [
      {
        "name": "Emergency Contact Name",
        "phone": "+2348012345678",
        "email": "emergency@example.com",
        "relationship": "Husband",
        "_id": "65b267c7e90e7a2b9c7b13ec"
      }
    ],
    "createdAt": "2024-01-25T12:00:00.000Z",
    "updatedAt": "2024-01-25T12:10:00.000Z"
  }
}
```

**Errors**:

- 401: Unauthorized
- 500: Internal server error

#### GET /api/user/emergency-contact

Retrieves the emergency contact details for the authenticated user. Requires authentication.

**Request**:
(No request body)

**Response**:

```json
{
  "message": "Emergency contact for user",
  "success": true,
  "data": [
    {
      "name": "Emergency Contact Name",
      "phone": "+2348012345678",
      "email": "emergency@example.com",
      "relationship": "Husband",
      "_id": "65b267c7e90e7a2b9c7b13ec"
    }
  ]
}
```

**Errors**:

- 401: Unauthorized
- 404: User not found
- 500: Internal server error

#### Antenatal Vitals

#### POST /api/antenatal

Records new antenatal vital updates for the authenticated user and provides AI-generated feedback. Requires authentication.

**Request**:

```json
{
  "bloodPressure": "120/80",
  "temperature": 36.5,
  "weight": 65.2,
  "bloodLevel": 12.5,
  "prescribedDrugs": "Folic Acid, Iron Supplements",
  "drugsToAvoid": "Aspirin",
  "date": "2024-03-15T10:00:00.000Z"
}
```

**Response**:

```json
{
  "message": "Antenatal update saved successfully",
  "data": {
    "_id": "65f42c11a01b2c3d4e5f6789",
    "userId": "65b267c7e90e7a2b9c7b13e9",
    "bloodPressure": "120/80",
    "temperature": 36.5,
    "weight": 65.2,
    "bloodLevel": 12.5,
    "prescribedDrugs": "Folic Acid, Iron Supplements",
    "drugsToAvoid": "Aspirin",
    "date": "2024-03-15T10:00:00.000Z",
    "aiFeedback": "Hi Mama Jane! 💛 Your vitals look good today. Remember to keep taking your Folic Acid and Iron Supplements. Please avoid Aspirin. Keep up the great work! 😊",
    "createdAt": "2024-03-15T10:05:00.000Z",
    "updatedAt": "2024-03-15T10:05:00.000Z"
  }
}
```

**Errors**:

- 400: All fields are required
- 401: Unauthorized
- 500: Server error

#### AI Chat Assistant

#### POST /api/chat

Interacts with the AI chat assistant, Favour. Requires authentication.

**Request**:

```json
{
  "content": "I'm feeling a bit tired today. Is that normal?"
}
```

**Response** (streaming in production, direct JSON in development):

```json
{
  "success": true,
  "reply": "Hi Mama Jane! 💛 It's quite common to feel tired during pregnancy, especially in the first and third trimesters. Your body is working hard! Make sure to get plenty of rest and listen to your body. How are you feeling emotionally? Remember, I'm not a doctor, but I'm here to support you! 💕"
}
```

**Errors**:

- 400: Message is required
- 401: Unauthorized
- 500: Internal server error

#### Appointment Management

#### POST /api/visit/create_schedule

Schedules a new hospital visit for the authenticated user. Requires authentication.

**Request**:

```json
{
  "visitDate": "2024-04-20",
  "visitTime": "11:00",
  "duration": 60,
  "hospitalName": "General Hospital",
  "doctorName": "Dr. Adebola",
  "notes": "Follow-up on blood pressure."
}
```

**Response**:

```json
{
  "message": "Visit successfully scheduled 💛",
  "visit": {
    "_id": "65f42d8fa01b2c3d4e5f678a",
    "userId": "65b267c7e90e7a2b9c7b13e9",
    "reminderDateTime": "2024-04-20T11:00:00.000Z",
    "duration": 60,
    "hospitalName": "General Hospital",
    "doctorName": "Dr. Adebola",
    "notes": "Follow-up on blood pressure.",
    "sent": false,
    "createdAt": "2024-03-15T10:15:00.000Z",
    "updatedAt": "2024-03-15T10:15:00.000Z"
  }
}
```

**Errors**:

- 400: Visit date and time are required.
- 400: Invalid visitTime format. Use 'HH:mm' or a number (hours).
- 401: Unauthorized
- 500: Internal server error

#### GET /api/visit/get_visits

Retrieves all scheduled visits for the authenticated user. Requires authentication.

**Request**:
(No request body)

**Response**:

```json
{
  "visits": [
    {
      "_id": "65f42d8fa01b2c3d4e5f678a",
      "userId": "65b267c7e90e7a2b9c7b13e9",
      "reminderDateTime": "2024-04-20T11:00:00.000Z",
      "duration": 60,
      "hospitalName": "General Hospital",
      "doctorName": "Dr. Adebola",
      "notes": "Follow-up on blood pressure.",
      "sent": false,
      "createdAt": "2024-03-15T10:15:00.000Z",
      "updatedAt": "2024-03-15T10:15:00.000Z"
    }
  ]
}
```

**Errors**:

- 401: Unauthorized
- 500: Internal server error

#### GET /api/visit/get_visit/:id

Retrieves a specific scheduled visit by its ID for the authenticated user. Requires authentication.

**Request**:
(No request body)

**Response**:

```json
{
  "visit": {
    "_id": "65f42d8fa01b2c3d4e5f678a",
    "userId": "65b267c7e90e7a2b9c7b13e9",
    "reminderDateTime": "2024-04-20T11:00:00.000Z",
    "duration": 60,
    "hospitalName": "General Hospital",
    "doctorName": "Dr. Adebola",
    "notes": "Follow-up on blood pressure.",
    "sent": false,
    "createdAt": "2024-03-15T10:15:00.000Z",
    "updatedAt": "2024-03-15T10:15:00.000Z"
  }
}
```

**Errors**:

- 401: Unauthorized
- 404: Visit not found.
- 500: Internal server error

#### PUT /api/visit/update_visit/:id

Updates a specific scheduled visit by its ID for the authenticated user. Requires authentication.

**Request**:

```json
{
  "visitDate": "2024-04-21",
  "visitTime": "10:30",
  "notes": "Rescheduled for earlier check-up."
}
```

**Response**:

```json
{
  "message": "Visit updated successfully 💛",
  "visit": {
    "_id": "65f42d8fa01b2c3d4e5f678a",
    "userId": "65b267c7e90e7a2b9c7b13e9",
    "reminderDateTime": "2024-04-21T10:30:00.000Z",
    "duration": 60,
    "hospitalName": "General Hospital",
    "doctorName": "Dr. Adebola",
    "notes": "Rescheduled for earlier check-up.",
    "sent": false,
    "createdAt": "2024-03-15T10:15:00.000Z",
    "updatedAt": "2024-03-15T10:20:00.000Z"
  }
}
```

**Errors**:

- 400: Invalid visitTime format. Use 'HH:mm' or a number (hours).
- 400: Invalid visitDate or visitTime provided.
- 401: Unauthorized
- 404: Visit not found.
- 500: Internal server error

#### DELETE /api/visit/delete_visit/:id

Deletes a specific scheduled visit by its ID for the authenticated user. Requires authentication.

**Request**:
(No request body)

**Response**:

```json
{
  "message": "Visit deleted successfully 💛"
}
```

**Errors**:

- 401: Unauthorized
- 404: No visit scheduled.
- 500: Internal server error

#### Location Services

#### POST /api/hospitals

Finds nearby hospitals based on provided latitude, longitude, and an optional radius. Requires authentication.

**Request**:

```json
{
  "latitude": 6.5244,
  "longitude": 3.3792,
  "radius": 5000
}
```

**Response**:

```json
{
  "success": true,
  "message": "Nearby hospitals fetched successfully",
  "userLocation": "Lagos, Nigeria",
  "totalHospitals": 3,
  "data": [
    {
      "id": 12345,
      "name": "Lagos State General Hospital",
      "lat": 6.52,
      "lon": 3.38,
      "address": "1 Hospital Road, Lagos, Nigeria",
      "tags": {
        "amenity": "hospital",
        "name": "Lagos State General Hospital"
      }
    }
  ]
}
```

**Errors**:

- 400: Missing coordinates
- 401: Unauthorized
- 500: Internal server error

#### Automated Reminders

#### GET /api/reminder/run

Manually triggers the reminder job to send SMS and email notifications for upcoming appointments. This endpoint is typically handled by a background cron job but can be triggered manually for testing.

**Request**:
(No request body)

**Response**:

```json
{
  "message": "Reminders executed successfully",
  "count": 1
}
```

**Errors**:

- 500: Failed to run reminders

#### Community Health Worker (CHW) Management

#### POST /api/auth_chw/register_chw

Registers a new Community Health Worker (CHW).

**Request**:

```json
{
  "email": "chw.mary@example.com",
  "password": "CHWPassword123"
}
```

**Response**:

```json
{
  "message": "User successfully registered",
  "success": true,
  "data": {
    "_id": "65f42f74a01b2c3d4e5f678b",
    "email": "chw.mary@example.com",
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

**Errors**:

- 400: Input you name, email or password (Error message states "name" but controller only checks email/password)
- 400: This user already exist
- 500: Internal server error

#### POST /api/auth_chw/login_chw

Logs in a Community Health Worker (CHW) and returns an access token. The token is also set as an HTTP-only cookie.

**Request**:

```json
{
  "email": "chw.mary@example.com",
  "password": "CHWPassword123"
}
```

**Response**:

```json
{
  "message": "logged in successfully",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWIyNjdjN2U5MGU3YTJiOWM3YjEzZTkiLCJpYXQiOjE3MDY3MTY4MDAsImV4cCI6MTcwNjcyNDAwMH0...."
}
```

**Errors**:

- 400: email and password are required
- 404: Invalid email or password
- 500: Internal server error

#### GET /api/auth_chw/current_chw

Retrieves the profile of the currently authenticated CHW. Requires CHW authentication.

**Request**:
(No request body)

**Response**:

```json
{
  "message": "Current user fetched",
  "success": true,
  "data": {
    "_id": "65f42f74a01b2c3d4e5f678b",
    "fullName": "Mary Ezenwa",
    "email": "chw.mary@example.com",
    "phoneNumber": "+2349012345678",
    "state": "Lagos",
    "localGovernment": "Ikeja",
    "facilityName": "Ikeja Health Center",
    "facilityCode": "IHC001",
    "AssignedPatients": [],
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:35:00.000Z"
  }
}
```

**Errors**:

- 401: Unauthorized
- 500: Internal server error

#### PUT /api/auth_chw/chw_profile

Updates the profile information for the authenticated CHW. Requires CHW authentication.

**Request**:

```json
{
  "fullName": "Mary Ezenwa",
  "state": "Lagos",
  "localGovernment": "Ikeja",
  "facilityName": "Ikeja Health Center",
  "facilityCode": "IHC001"
}
```

**Response**:

```json
{
  "message": "Profile updated",
  "success": true,
  "data": {
    "_id": "65f42f74a01b2c3d4e5f678b",
    "fullName": "Mary Ezenwa",
    "email": "chw.mary@example.com",
    "state": "Lagos",
    "localGovernment": "Ikeja",
    "facilityName": "Ikeja Health Center",
    "facilityCode": "IHC001",
    "AssignedPatients": [],
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:35:00.000Z"
  }
}
```

**Errors**:

- 401: Unauthorized
- 500: Internal server error

#### POST /api/auth_chw/assign_patient

Assigns a patient to the authenticated CHW. Requires CHW authentication.

**Request**:

```json
{
  "patientId": "65f42e47a01b2c3d4e5f678c"
}
```

**Response**:

```json
{
  "message": "Patient assigned successfully"
}
```

**Errors**:

- 401: Unauthorized
- 404: CHW or Patient not found
- 500: Internal server error

#### Patient Visit Logging

#### POST /api/patient/log-visit

Logs a visit for a patient by a CHW. Note: The `chwId`, `antinentalVisitDate`, and `contact` fields are required by the `CHWVisit` schema but are not provided in the request body by this controller. This endpoint may encounter Mongoose validation errors until the schema or controller logic is adjusted.

**Request**:

```json
{
  "patientId": "65f42e47a01b2c3d4e5f678c",
  "pregnancyStage": "Second Trimester",
  "visitDate": "2024-03-15T11:00:00.000Z",
  "medicationList": "Paracetamol, Vitamin C",
  "riskStatus": "safe",
  "medicalHistory": "No prior complications",
  "patientInformation": "Patient is doing well, no complaints."
}
```

**Response**:
(If successful, despite schema mismatch for `CHWVisit`)

```json
{
  "message": "Visit logged successfully",
  "success": true,
  "data": {
    "_id": "65f430b2a01b2c3d4e5f678d",
    "patientId": "65f42e47a01b2c3d4e5f678c",
    "visitDate": "2024-03-15T11:00:00.000Z",
    "createdAt": "2024-03-15T10:40:00.000Z",
    "updatedAt": "2024-03-15T10:40:00.000Z",
    "__v": 0
  }
}
```

**Errors**:

- 401: Unauthorized (if CHW authentication is added)
- 500: Internal server error (most likely a Mongoose validation error due to missing required fields for `CHWVisit` such as `chwId`, `antinentalVisitDate`, `contact`).

## Technologies Used

| Category           | Technology                                                                                                                                                                                                                 |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**        | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)  |
| **Database**       | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=for-the-badge&logo=mongoose&logoColor=white)       |
| **Authentication** | ![Bcrypt.js](https://img.shields.io/badge/Bcrypt-5B2C6F?style=for-the-badge&logo=bcrypt&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)            |
| **AI/ML**          | ![Groq](https://img.shields.io/badge/Groq-00C7EC?style=for-the-badge&logo=groq&logoColor=white) ![AI SDK](https://img.shields.io/badge/AI%20SDK-000000?style=for-the-badge&logo=vercel&logoColor=white)                    |
| **Messaging**      | ![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white) ![Nodemailer](https://img.shields.io/badge/Nodemailer-0078D4?style=for-the-badge&logo=nodemailer&logoColor=white)    |
| **Geolocation**    | ![OpenCage](https://img.shields.io/badge/OpenCage-F66133?style=for-the-badge&logo=opencagedatageocoder&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-000000?style=for-the-badge&logo=axios&logoColor=white) |
| **Scheduling**     | ![Node Cron](https://img.shields.io/badge/Node%20Cron-000000?style=for-the-badge&logo=javascript&logoColor=F7DF1E)                                                                                                         |
| **Development**    | ![Dotenv](https://img.shields.io/badge/Dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black) ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=black)             |

## Contributing

We welcome contributions to enhance Ayomama Backend API! If you're interested in improving this project, please follow these guidelines:

- ✨ **Fork the repository**.
- 🌿 **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-description`.
- 💻 **Make your changes** and ensure they adhere to the existing code style.
- 🧪 **Write tests** for your changes, if applicable.
- ✅ **Commit your changes** with clear, concise messages: `git commit -m 'feat: Add new feature for X'` or `fix: Resolve bug in Y`.
- ⬆️ **Push your branch** to your forked repository: `git push origin feature/your-feature-name`.
- 📬 **Open a pull request** to the `main` branch of this repository, describing your changes in detail.

## License

This project is licensed under the [MIT License](LICENSE).

## Author Info

**Ayomama Health Project Team**

Feel free to connect with the team behind this project:

- **Twitter**: [Ayomama Twitter](https://x.com/Ayomama_ng)
- **Instagram**: [Ayomama Instagram](https://www.instagram.com/ayomama_ng/)
- **YouTube**: [Ayomama YouTube](https://www.youtube.com/@Ayomamahealth)

---

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
