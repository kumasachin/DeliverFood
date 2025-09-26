# DeliverFood - Food Delivery Application

A modern food delivery application built with React (frontend) and Node.js/Express (backend) in a monorepo structure.

## 🏗️ Monorepo Structure

```
deliverfood-monorepo/
├── apps/
│   ├── frontend/          # React TypeScript application
│   └── backend/           # Node.js Express API server
├── package.json           # Root package.json with workspaces
└── render.yaml            # Render deployment configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install all dependencies
npm install

# Start development servers
npm run dev
```

### Individual Services

```bash
# Frontend only
cd apps/frontend && npm start

# Backend only
cd apps/backend && npm run start:dev
```

## 📦 Apps

### Frontend (`apps/frontend`)

- **Framework:** React 19 with TypeScript
- **UI Library:** Material-UI (MUI)
- **State Management:** React Context
- **Routing:** React Router
- **HTTP Client:** Axios
- **Development Server:** http://localhost:3001

### Backend (`apps/backend`)

- **Framework:** Node.js with Express
- **Database:** SQLite (development) / PostgreSQL (production)
- **Authentication:** JWT tokens
- **API Documentation:** RESTful endpoints
- **Development Server:** http://localhost:3000

## 🔧 Available Scripts

### Root Level

```bash
npm run dev      # Start all services in development
npm run build    # Build all services
npm start        # Start all services in production
```

### Frontend Scripts

```bash
cd apps/frontend
npm start         # Start development server
npm run build     # Build for production
npm test          # Run tests
npm run storybook # Start Storybook
```

### Backend Scripts

```bash
cd apps/backend
npm run start:dev # Start with hot reload
npm start         # Start production server
```

## 🌐 API Endpoints

### Authentication

- `POST /tokens` - Login
- `POST /registrations` - Register new user

### Restaurants

- `GET /restaurants` - List all restaurants

### Meals

- `GET /meals` - List all meals

### Orders

- `GET /orders` - List user orders

### Coupons

- `GET /coupons` - List available coupons

### Users

- `GET /users` - List users

## 🚀 Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Deploy the `apps/frontend` folder
3. Set environment variables:
   - `REACT_APP_API_BASE_URL` - Your backend API URL

### Render (Full Stack)

1. Use the `render.yaml` configuration file
2. Deploy both services separately
3. Frontend will automatically connect to backend

### Manual Deployment

```bash
# Build frontend
cd apps/frontend && npm run build

# Start backend
cd apps/backend && npm start
```

## 🔒 Environment Variables

### Frontend (.env)

```
REACT_APP_API_BASE_URL=http://localhost:3000
PORT=3001
```

### Backend

```
PORT=3000
NODE_ENV=development
```

## 📝 Development Notes

- Frontend runs on port 3001, backend on port 3000
- CORS is enabled for cross-origin requests
- JWT tokens are used for authentication
- Mock data is provided for development
- SQLite database for development (can be upgraded to PostgreSQL for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
   Customers are able to see the list of Restaurants

### Meals

Owners are able to create, edit or delete Meals for each of his Restaurants
Customers are able to see the least of the Meals for each Restaurant

### Orders

Owners are able to check the list of Orders, get details of a single Order, check and change their status, and see the status history.
Customers are able to create new Orders, get details of a single Order, see the status history, and change the last status of the order to "Received"

### Coupons

Owners are able to create, edit or delete discount Coupons for each Restaurant
Customers are able to get the list of Coupons for an Restaurant and retrieve them on their Orders

## UI

The ui folder consists on a boilerplate with a set of pages so you can use as an start point to build your application. Source code was build using MaterialUI. You can use it entirely, partially or just for inspiration if you want to create your own UI from scratch. Feel free to use any other technology of your choice to build your project.
