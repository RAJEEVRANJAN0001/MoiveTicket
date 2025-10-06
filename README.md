# 🎬 Movie Ticket Booking — Fullstack Demo

This repository contains a fullstack movie ticket booking demo: a Django REST backend and a React frontend. It supports JWT authentication, seat booking (mock or real), booking cancellation, and a demo mode for frontend-only deployments.

This README focuses on how to run the project locally (backend + frontend), how to build the frontend for production, and notes about the demo configuration used for deploying without a live backend.

---

## Quick Links

- Backend: `backend/` (Django + DRF)
- Frontend: `frontend/` (React)
- Demo & deployment notes: environment variables and `frontend/.env.production`

---

## Features

- JWT-based authentication (signup/login)
- Movie CRUD (admin only)
- Show scheduling and seat pricing
- Seat booking with simple conflict handling (DB-level checks in backend)
- View and cancel bookings
- Optional frontend-only demo mode (no backend required) that uses OMDB for movie posters/titles

## Tech stack

- Backend: Python, Django, Django REST Framework
- Frontend: React (Create React App), Axios, Zustand, Tailwind CSS
- DB: SQLite for development (Postgres recommended for production)

## Prerequisites

- Node.js and npm (for frontend)
- Python 3.10+ and pip (for backend)

## Local development — Backend (quick)

1. Create and activate a Python virtualenv

```bash
python -m venv venv
source venv/bin/activate
```

2. Install dependencies and migrate

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py populate_data     # optional sample data command (if present)
```

3. Run the backend

```bash
python manage.py runserver
```

API base: http://127.0.0.1:8000/

Swagger UI (if enabled): http://127.0.0.1:8000/swagger/

## Local development — Frontend (quick)

1. Install frontend dependencies

```bash
cd frontend
npm install
```

2. Development server

```bash
npm start
```

The React app will run on http://localhost:3000 by default.

## Frontend environment variables

Create a `.env` (for local dev) or use `.env.production` for production builds. Important variables used in the frontend:

- `REACT_APP_API_BASE_URL` — backend API base (e.g. `http://127.0.0.1:8000/api`)
- `REACT_APP_DEMO_MODE` — set to `true` to run the frontend in demo/mock mode (no backend required)
- `REACT_APP_OMDB_API_KEY` — optional OMDB API key to fetch real movie posters/titles in demo mode

Example `.env` snippet:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api
REACT_APP_DEMO_MODE=false
REACT_APP_OMDB_API_KEY=b48416e9
```

Notes:
- When `REACT_APP_DEMO_MODE=true` the frontend uses mock endpoints and can be deployed without the backend.
- OMDB key is optional; if set, demo mode will fetch richer movie metadata.

## Build & Production (frontend)

Build the frontend for production:

```bash
cd frontend
npm run build
```

This produces a `build/` folder ready to serve as static files. The project already includes a `vercel.json` to support SPA routing when deploying to Vercel.

## Deploying to Vercel (recommended for frontend-only demo)

1. Set `REACT_APP_DEMO_MODE=true` in the Vercel project environment variables (or commit a `.env.production` with that value — not recommended for secrets).
2. (Optional) Set `REACT_APP_OMDB_API_KEY` in Vercel env if you want real posters.
3. Push to your Git provider and link the repo to Vercel. The included `vercel.json` routes should ensure client-side routing works.

## API examples (backend)

1. Register a user

```bash
curl -X POST http://127.0.0.1:8000/api/signup/ \
  -H "Content-Type: application/json" \
  -d '{"username":"moviefan","email":"fan@movies.com","password":"securepass123","password_confirm":"securepass123"}'
```

2. Login

```bash
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"moviefan","password":"securepass123"}'
```

3. Book a seat (authenticated)

```bash
curl -X POST http://127.0.0.1:8000/api/shows/1/book/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"seat_number": 5}'
```

4. Get my bookings

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://127.0.0.1:8000/api/my-bookings/
```

## Troubleshooting

- If frontend signup shows "Signup failed", confirm `REACT_APP_API_BASE_URL` is set correctly and the backend is reachable.
- For odd currency/price issues, ensure the frontend `helpers` utilities haven't been modified to apply unexpected conversions.
- If deploying frontend-only, enable `REACT_APP_DEMO_MODE=true`. The app will use mock endpoints and will work without the backend.

## Contributing & notes

- This repo contains both frontend and backend code. Please open PRs against `main`.
- Add unit tests where possible and keep API contract changes coordinated between frontend and backend.

## License

This project includes a `LICENSE` file at the repo root. Follow the license terms for reuse.

---

If you'd like, I can also:

- Add a short `frontend/README.md` with dev and build steps specific to the React app
- Add a `Makefile` or scripts to start both services together (devproxy)

Tell me which you'd prefer next and I will implement it.

## Reviewer Mapping (one-page)

Quick file map for an external reviewer to verify assignment requirements.

- Backend root: `backend/` — Django project and API implementation.

- Models
  - `backend/movies/models.py` — Movie, Show, Booking models. Note: `Booking.Meta.unique_together = ('show','seat_number')` prevents duplicate seat bookings; `Booking.clean()` enforces seat bounds.
    - Locations: `backend/movies/models.py` (136 lines)
      - `class Movie` starts at line 6
      - `class Show` starts at line 36
      - `class Booking` starts at line 80
      - `Booking.clean()` at line 122
      - `Booking.save()` at line 133

- Serializers (validation & transactional booking)
  - `backend/movies/serializers.py` — `SeatBookingSerializer.create()` uses `transaction.atomic()` and `select_for_update()` to safely create bookings; validators prevent invalid/over-range seats.
    - Locations: `backend/movies/serializers.py` (247 lines)
      - `SeatBookingSerializer` starts at line 175
      - `create(self, validated_data)` (user creation) appears at line 43

- Views / Endpoints
  - `backend/movies/views.py` — main endpoints:
    - `UserRegistrationView` → `POST /api/signup/`
    - `UserLoginView` → `POST /api/login/` (issues JWTs)
    - `MovieListView` & `MovieShowsView` → `/api/movies/` and `/api/movies/{id}/shows/`
    - `book_seat(request, show_id)` → `POST /api/shows/{id}/book/` (retry/backoff, DB locking)
    - `cancel_booking(request, booking_id)` → `POST /api/bookings/{id}/cancel/` (owner-only)
    - `UserBookingsView` → `GET /api/my-bookings/`

- URLs & Swagger
  - `backend/movies/urls.py` — API route registrations.
    - Locations: `backend/movies/urls.py` (24 lines) — signup path at line 6
  - `backend/movie_booking_project/urls.py` — Swagger routes (`/swagger/`, `/redoc/`) and root routing.
    - Locations: `backend/movie_booking_project/urls.py` (32 lines) — swagger UI route at line 29

- Auth & Config
  - `backend/movie_booking_project/settings.py` — `rest_framework_simplejwt` in `INSTALLED_APPS`, `REST_FRAMEWORK` default auth set to JWT, `SIMPLE_JWT` token settings, and `SWAGGER_SETTINGS` for Bearer auth.
    - Locations: `backend/movie_booking_project/settings.py` (172 lines)
      - `drf_yasg` in `INSTALLED_APPS` at line 34
      - `REST_FRAMEWORK` block starts at line 110
      - `SIMPLE_JWT` block starts at line 122

- Tests & README
  - `backend/movies/tests.py` — unit tests covering models, signup/login, booking flows (success, double-book, unauthenticated), and cancellation permissions.
    - Locations: `backend/movies/tests.py` (308 lines)
      - `AuthenticationAPITest` starts at line 129
      - `BookingAPITest` starts at line 196
  - This `README.md` — contains setup steps, example curl commands, and Swagger link.

- Frontend seat selector (partial UI)
  - `frontend/src/components/MultiSeatSelector.js` (259 lines)
    - `MultiSeatSelector` component definition at line 7

Use this map to quickly jump to the specific files/lines for verification. If you want literal line-number ranges for each symbol, tell me and I'll add them.

## 🛡 Business Rules

- **Unique Seat Booking**: Each seat can only be booked once per show
- **Seat Validation**: Seat numbers must be within the show's capacity
- **User Ownership**: Users can only cancel their own bookings
- **Concurrent Safety**: Database constraints prevent race conditions
- **Status Management**: Cancelled bookings free up seats for rebooking

## 🧪 Running Tests

```bash
# Run all tests
python manage.py test

# Run specific test modules
python manage.py test movies.tests.BookingAPITest
python manage.py test movies.tests.AuthenticationAPITest

# Run with verbose output
python manage.py test --verbosity=2
```

## 🔧 Admin Interface

Access the Django admin at: http://127.0.0.1:8000/admin/

Features:
- Movie management with filtering and search
- Show management with capacity tracking
- Booking oversight with status management
- User management

## 🚀 Production Deployment

### Environment Variables

Create a `.env` file:

```env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost:5432/moviebooking

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=3600
JWT_REFRESH_TOKEN_LIFETIME=604800
```

### Database Migration

For PostgreSQL:

```bash
pip install psycopg2-binary
python manage.py migrate
python manage.py collectstatic
```

### Gunicorn Setup

```bash
gunicorn movie_booking_project.wsgi:application --bind 0.0.0.0:8000
```

## 📊 Database Schema

### Movies
- `id`: Primary Key
- `title`: Movie title
- `duration_minutes`: Duration in minutes
- `genre`: Movie genre
- `rating`: Movie rating (0-10)
- `description`: Movie description
- `release_date`: Release date

### Shows
- `id`: Primary Key
- `movie`: Foreign Key to Movie
- `screen_name`: Theater screen name
- `date_time`: Show date and time
- `total_seats`: Total available seats
- `price`: Ticket price

### Bookings
- `id`: Primary Key
- `user`: Foreign Key to User
- `show`: Foreign Key to Show
- `seat_number`: Seat number (1-based)
- `status`: 'booked' or 'cancelled'
- **Constraint**: Unique together (show, seat_number)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   python manage.py runserver 8001
   ```

2. **Database Connection Issues**
   ```bash
   python manage.py migrate --run-syncdb
   ```

3. **JWT Token Expired**
   - Use the refresh token to get a new access token
   - Or login again to get new tokens

### Support

For issues and questions:
- Check the API documentation at `/swagger/`
- Review the test cases for usage examples
- Ensure all dependencies are properly installed

## 🎯 Future Enhancements

- Payment integration
- Email notifications
- Seat selection UI
- Show recommendations
- Booking history analytics
- Multi-theater support
- Dynamic pricing

Status note: the core backend features (authentication, movie/show models, booking APIs with JWT auth, Swagger docs, and booking safety) are implemented in this repository. The items below are annotated to clarify which are already present and which are planned.

- Payment integration — Planned (not implemented)
- Email notifications — Planned (not implemented)
- Seat selection UI — Partial / Implemented in frontend (`frontend/src/components/MultiSeatSelector.js`) — may need UI polish and integration with payment flows
- Show recommendations — Planned (not implemented)
- Booking history analytics — Planned (not implemented)
- Multi-theater support — Planned (not implemented)
- Dynamic pricing — Planned (not implemented)