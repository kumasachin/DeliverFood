# 🍕 DeliverFood - Complete Food Delivery Platform

A full-featured food delivery application built with modern web technologies. Features role-based access for restaurant owners and customers, complete order management, coupon system, and real-time order tracking.

## 🌐 Live Demo

🚀 **[View Live Application](https://deliver-food-frontend-9nowp4zgt-sachin-kumars-projects-1cd28c0d.vercel.app/signin)**

**Test Accounts:**
- **Customer:** Login with any email/password (mock authentication)
- **Owner:** Login with email containing "owner" (e.g., owner@test.com)

## ✨ Features

### 👥 User Management
- **Role-based Authentication**: Customer and Owner roles with different permissions
- **JWT Authentication**: Secure token-based authentication system
- **User Registration & Login**: Complete authentication flow
- **Profile Management**: User account management

### 🏪 Restaurant Management (Owners Only)
- **Restaurant CRUD**: Create, read, update, delete restaurants
- **Multi-restaurant Support**: Owners can manage multiple restaurants
- **Location Integration**: Restaurant coordinates for delivery calculations
- **Restaurant Dashboard**: Comprehensive management interface

### 🍽️ Meal Management (Owners Only)
- **Meal CRUD**: Full menu management per restaurant
- **Pricing**: Dynamic pricing system
- **Categorization**: Organize meals by restaurant
- **Menu Display**: Customer-facing menu browsing

### 🛒 Order Management
- **Order Creation**: Seamless ordering process for customers
- **Order Tracking**: Real-time order status updates
- **Order History**: Complete order history for users
- **Status Management**: Order lifecycle management (pending → preparing → ready → delivered)
- **Order Details**: Comprehensive order information

### 🎫 Coupon System
- **Coupon Creation**: Restaurant owners can create discount coupons
- **Coupon Management**: Full CRUD operations for coupons
- **Discount Application**: Automatic discount calculation
- **Restaurant-specific**: Coupons tied to specific restaurants

### 📊 Dashboard & Analytics
- **Owner Dashboard**: Restaurant performance metrics
- **Customer Dashboard**: Order history and preferences
- **Order Analytics**: Sales and order statistics
- **Real-time Updates**: Live order status tracking

### 🎨 Modern UI/UX
- **Material-UI Design**: Professional, responsive design
- **Mobile-First**: Optimized for all devices
- **Intuitive Navigation**: Easy-to-use interface
- **Loading States**: Smooth user experience with loading indicators
- **Error Handling**: Comprehensive error boundaries and messaging

## 🏗️ Architecture

### Monorepo Structure
```
deliverfood-monorepo/
├── apps/
│   ├── frontend/          # React TypeScript SPA
│   │   ├── src/
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── pages/         # Page components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── contexts/      # React Context providers
│   │   │   ├── services/      # API service layer
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── utils/         # Utility functions
│   │   ├── public/            # Static assets
│   │   └── package.json
│   └── backend/           # Node.js Express API
│       ├── src/
│       │   ├── commands/      # CLI commands
│       │   ├── web/           # Express server & routes
│       │   └── model/         # Data models (future DB)
│       └── package.json
├── package.json           # Root workspace configuration
└── render.yaml            # Production deployment config
```

## �️ Tech Stack

### Frontend
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - Component library and design system
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Context** - State management
- **React Hook Form** - Form handling
- **Storybook** - Component documentation
- **Cypress** - End-to-end testing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **CORS** - Cross-origin resource sharing
- **SQLite** - Development database
- **PostgreSQL** - Production database (configurable)

### DevOps & Deployment
- **Vercel** - Frontend deployment
- **Render** - Backend deployment
- **npm workspaces** - Monorepo management
- **ESLint** - Code linting
- **Prettier** - Code formatting

## � Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/kumasachin/DeliverFood.git
cd DeliverFood

# Install all dependencies
npm install

# Start development servers (both frontend & backend)
npm run dev

# Or start services individually:
# Frontend only: cd apps/frontend && npm start
# Backend only: cd apps/backend && npm run start:dev
```

### Environment Configuration

Create `.env` file in `apps/frontend/`:
```bash
REACT_APP_API_BASE_URL=http://localhost:3000
PORT=3001
```

## 📱 User Roles & Permissions

### 👤 Customer Role
- Browse restaurants and menus
- Place orders
- Track order status
- View order history
- Apply coupons
- Manage profile

### 👨‍🍳 Owner Role
- All customer permissions plus:
- Create/manage restaurants
- Add/edit/delete meals
- Create/manage coupons
- View restaurant analytics
- Manage orders (status updates)
- Block/unblock customers

## 🌐 API Documentation

### Authentication Endpoints
```http
POST /tokens              # User login
POST /registrations       # User registration
```

### Restaurant Endpoints
```http
GET  /restaurants         # List all restaurants
POST /restaurants         # Create restaurant (owners only)
PUT  /restaurants/:id     # Update restaurant (owners only)
DELETE /restaurants/:id   # Delete restaurant (owners only)
```

### Meal Endpoints
```http
GET  /meals               # List all meals
POST /meals               # Create meal (owners only)
PUT  /meals/:id           # Update meal (owners only)
DELETE /meals/:id         # Delete meal (owners only)
```

### Order Endpoints
```http
GET  /orders              # List user orders
POST /orders              # Create new order
GET  /orders/:id          # Get order details
PUT  /orders/:id/status   # Update order status
```

### Coupon Endpoints
```http
GET  /coupons             # List available coupons
POST /coupons             # Create coupon (owners only)
PUT  /coupons/:id         # Update coupon (owners only)
DELETE /coupons/:id       # Delete coupon (owners only)
```

### User Management
```http
GET  /users               # List users (admin only)
PUT  /users/:id/block     # Block/unblock user (owners only)
```

## 🚀 Production Deployment

### Vercel (Frontend)
1. Connect `kumasachin/DeliverFood` repository
2. Set root directory: `apps/frontend`
3. Add environment variable: `REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com`
4. Deploy automatically

### Render (Backend)
1. Use Blueprint deployment with `render.yaml`
2. Both services deploy automatically
3. Frontend connects to backend via environment variables

### Production URLs
- **Frontend**: `https://deliver-food-frontend-9nowp4zgt-sachin-kumars-projects-1cd28c0d.vercel.app`
- **Backend**: `https://deliverfood-backend.onrender.com` (deploy with Render)

## 🧪 Testing

### Unit Tests
```bash
cd apps/frontend
npm test
```

### E2E Tests
```bash
cd apps/frontend
npm run cypress
```

### Component Stories
```bash
cd apps/frontend
npm run storybook
```

## 📊 Database Schema

### Users
- `uuid`: Primary key
- `email`: Unique email address
- `password`: Hashed password
- `role`: 'customer' | 'owner'
- `created_at`: Timestamp

### Restaurants
- `uuid`: Primary key
- `title`: Restaurant name
- `description`: Restaurant description
- `cuisine`: Cuisine type
- `owner_uuid`: Foreign key to users
- `coordinates`: Lat/lng coordinates
- `created_at`: Timestamp

### Meals
- `uuid`: Primary key
- `title`: Meal name
- `description`: Meal description
- `price`: Meal price
- `restaurant_uuid`: Foreign key to restaurants
- `created_at`: Timestamp

### Orders
- `uuid`: Primary key
- `user_uuid`: Foreign key to users
- `restaurant_uuid`: Foreign key to restaurants
- `status`: Order status
- `total`: Order total
- `created_at`: Timestamp

### Order Items
- `uuid`: Primary key
- `order_uuid`: Foreign key to orders
- `meal_uuid`: Foreign key to meals
- `quantity`: Item quantity
- `price`: Item price

### Coupons
- `uuid`: Primary key
- `code`: Coupon code
- `discount`: Discount percentage
- `restaurant_uuid`: Foreign key to restaurants
- `created_at`: Timestamp

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **CORS Protection**: Configured for allowed origins
- **Input Validation**: Joi schema validation
- **Role-based Access**: Permission-based API access
- **SQL Injection Protection**: Parameterized queries

## 📈 Performance Optimizations

- **Code Splitting**: React lazy loading
- **Image Optimization**: Optimized static assets
- **Caching**: Browser caching strategies
- **Compression**: Gzip compression
- **CDN**: Static asset delivery
- **Database Indexing**: Optimized queries

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commits
- Maintain code coverage >80%
- Follow ESLint rules

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Material-UI for the excellent component library
- React team for the amazing framework
- Express.js for the robust web framework
- All contributors and maintainers

---

**Built with ❤️ for seamless food delivery experiences**
