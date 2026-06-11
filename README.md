# Artisan Handicraft Marketplace

Full-stack MERN marketplace for buyers, artisans, and admins.

## Stack

- React, Redux Toolkit, Tailwind CSS, Axios
- Node.js, Express, Socket.io
- MongoDB with Mongoose
- JWT access and refresh tokens, bcrypt password hashing
- Multer and Cloudinary image uploads
- Razorpay primary payment order support, Stripe payment intent support
- Nodemailer email notifications

## Setup

1. Install dependencies:

   ```bash
   npm run install:all
   npm install
   ```

2. Create environment files:

   ```bash
   copy server\.env.example server\.env
   copy client\.env.example client\.env
   ```

3. Fill `server/.env` with MongoDB, JWT, Cloudinary, payment, and SMTP credentials.

4. Seed sample users/products:

   ```bash
   npm run seed
   ```

5. Run both apps:

   ```bash
   npm run dev
   ```

The React client runs on `http://localhost:5173` by default and the API runs on `http://localhost:5000`.

## Seed Logins

- Admin: `admin@artisan.test` / `password123`
- Buyers: `mira.buyer@artisan.test`, `rohan.buyer@artisan.test` / `password123`
- Artisans: `kabir@artisan.test`, `nila@artisan.test` / `password123`

## Key Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id/approve`
- `POST /api/orders`
- `PUT /api/orders/:id/status`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/reviews`
- `GET /api/admin/stats`
- `GET /api/chat/conversations`
