# 🎬 CinemaBook Frontend

A modern, cinematic React frontend for the Movie Ticket Booking System.

## 🚀 Features

- **Modern UI/UX**: Dark cinematic theme with smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile
- **JWT Authentication**: Secure login/signup with token management
- **Real-time Booking**: Interactive seat selection with live availability
- **Booking Management**: View and cancel bookings with ease
- **Error Handling**: Graceful error handling with user-friendly messages
- **Toast Notifications**: Real-time feedback for user actions

## 🛠 Tech Stack

- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Framer Motion**: Smooth animations and transitions
- **Zustand**: Lightweight state management for authentication
- **Axios**: HTTP client for API communication
- **React Hot Toast**: Beautiful toast notifications
- **Lucide React**: Modern icon library

## 📋 Prerequisites

- Node.js 16 or higher
- npm or yarn
- Backend API running on `http://127.0.0.1:8000`

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

The `.env` file is already configured for local development:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

### 3. Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## 📱 Pages & Features

### 🏠 Home Page
- Hero section with cinematic design
- Feature highlights
- Call-to-action buttons
- Responsive layout

### 🔐 Authentication
- **Login**: Username/password with JWT token handling
- **Signup**: Complete registration form with validation
- **Auto-redirect**: Seamless navigation after authentication

### 🎬 Movies
- **Movie Grid**: Responsive card layout
- **Search**: Real-time search by title and genre
- **Movie Details**: Title, duration, rating, genre
- **Show Navigation**: Direct links to showtimes

### 🎫 Show Details & Booking
- **Show Selection**: Choose from available showtimes
- **Seat Map**: Interactive visual seat selection
- **Real-time Updates**: Live seat availability
- **Booking Confirmation**: Detailed booking summary
- **Secure Booking**: JWT-protected booking process

### 📋 My Bookings
- **Booking History**: Complete list of user bookings
- **Status Tracking**: Active vs cancelled bookings
- **Cancel Functionality**: Easy booking cancellation
- **Statistics**: Booking summary and stats

## 🎨 Design System

### Colors
- **Primary**: Red gradient (`#ef4444` to `#dc2626`)
- **Gold Accent**: `#f59e0b` for highlights
- **Dark Theme**: Custom dark grays (`#0a0a0a` to `#262626`)

### Typography
- **Display Font**: Poppins (headings and logos)
- **Body Font**: Inter (content and UI text)

### Components
- **Buttons**: Primary, secondary, and ghost variants
- **Cards**: Hover effects and consistent styling
- **Inputs**: Dark theme with focus states
- **Seats**: Color-coded availability system

## 🔌 API Integration

### Authentication Flow
1. User submits login credentials
2. Frontend sends request to `/api/login/`
3. Backend returns JWT tokens
4. Frontend stores tokens and sets auth headers
5. Subsequent requests include `Authorization: Bearer {token}`

### Booking Flow
1. User selects movie and show
2. Interactive seat map displays availability
3. User selects desired seat
4. Booking request sent to `/api/shows/{id}/book/`
5. Real-time seat updates and confirmation

### Error Handling
- **401 Unauthorized**: Auto-redirect to login
- **Network Errors**: User-friendly error messages
- **Validation Errors**: Field-specific error display
- **Retry Logic**: Automatic retry for transient failures

## 🚀 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (irreversible)
npm run eject
```

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
REACT_APP_API_BASE_URL=https://your-api-domain.com
REACT_APP_API_URL=https://your-api-domain.com/api
```

### Static Hosting
The build folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## 🔒 Security Features

- **JWT Token Management**: Secure storage and automatic refresh
- **Protected Routes**: Authentication-required pages
- **Input Validation**: Client-side validation with backend verification
- **XSS Prevention**: Sanitized user inputs
- **CORS Handling**: Proper cross-origin request setup

## 🎭 Animations & UX

### Page Transitions
- Smooth fade-in animations for page loads
- Staggered animations for lists and grids
- Loading states with skeleton screens

### Interactive Elements
- Hover effects on buttons and cards
- Scale animations for user interactions
- Smooth color transitions

### Feedback Systems
- Toast notifications for actions
- Loading spinners for async operations
- Confirmation modals for destructive actions

## 🐛 Troubleshooting

### Common Issues

**Backend Connection Error**
```bash
# Make sure backend is running
cd ../backend
python manage.py runserver
```

**Port Already in Use**
```bash
# Use different port
npm start -- --port 3001
```

**Dependencies Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Movie Booking System assignment.

---

**Enjoy your cinematic booking experience! 🍿**