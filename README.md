# 🎬 Movie Ticket Booking System

A complete Django REST Framework-based movie ticket booking system with JWT authentication, Swagger documentation, and comprehensive booking management.

## 🚀 Features

- **User Authentication**: JWT-based signup/login system
- **Movie Management**: Complete CRUD operations for movies (Admin only)
- **Show Management**: Schedule shows with seat management (Admin only)
- **Seat Booking**: Real-time seat booking with conflict prevention and retry logic
- **Booking Management**: View and cancel bookings
- **Admin Interface**: Django admin for system management
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Concurrent Booking Safety**: Database-level constraint handling with retry mechanism

## 🛠 Tech Stack

- **Backend**: Python 3.10+, Django 4.2+
- **API Framework**: Django REST Framework 3.14+
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Documentation**: drf-yasg (Swagger/OpenAPI)
- **Database**: SQLite (development), PostgreSQL (production)
- **CORS**: django-cors-headers

## 📋 Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd movie_booking_project
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Database Setup

```bash
python manage.py migrate
python manage.py createsuperuser  # Create admin user
python manage.py populate_data     # Load sample data
```

### 5. Run the Server

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`
Swagger documentation at `http://127.0.0.1:8000/swagger/`

## 📚 API Documentation

**Base URL**: `http://127.0.0.1:8000/api/`

**Note**: All endpoints are prefixed with `/api/`

### Authentication Endpoints

#### Register User
```bash
POST /api/signup/
Content-Type: application/json

{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "Test",
    "last_name": "User"
}
```

#### Login User
```bash
POST /api/login/
Content-Type: application/json

{
    "username": "testuser",
    "password": "securepassword123"
}
```

**Response:**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
    }
}
```

### Movie Endpoints

#### Get All Movies
```bash
GET /api/movies/
# No authentication required
```

#### Get Movie Shows
```bash
GET /api/movies/{movie_id}/shows/
# No authentication required
```

### Booking Endpoints (Require JWT Authentication)

#### Book a Seat
```bash
POST /api/shows/{show_id}/book/
Authorization: Bearer {access_token}
Content-Type: application/json

{
    "seat_number": 5
}
```

#### Get My Bookings
```bash
GET /api/my-bookings/
Authorization: Bearer {access_token}
```

#### Cancel Booking
```bash
POST /api/bookings/{booking_id}/cancel/
Authorization: Bearer {access_token}
```

### Example curl Commands

```bash
# 1. Register a user
curl -X POST http://127.0.0.1:8000/api/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "moviefan",
    "email": "fan@movies.com",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "first_name": "Movie",
    "last_name": "Fan"
  }'

# 2. Login and get token
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "moviefan",
    "password": "securepass123"
  }'

# 3. Get all movies (no auth needed)
curl http://127.0.0.1:8000/api/movies/

# 4. Book a seat (replace TOKEN with actual access token)
curl -X POST http://127.0.0.1:8000/api/shows/1/book/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"seat_number": 5}'

# 5. View my bookings
curl http://127.0.0.1:8000/api/my-bookings/ \
  -H "Authorization: Bearer TOKEN"
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Database Setup

```bash
# Create and apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### 5. Load Sample Data (Optional)

```bash
python manage.py shell
```

```python
# Inside Django shell
from movies.models import Movie, Show
from django.utils import timezone
from datetime import timedelta

# Create sample movies
movie1 = Movie.objects.create(
    title="Avengers: Endgame",
    duration_minutes=181,
    genre="Action",
    rating=8.4,
    description="The Avengers assemble once more to reverse Thanos' actions."
)

movie2 = Movie.objects.create(
    title="The Dark Knight",
    duration_minutes=152,
    genre="Action",
    rating=9.0,
    description="Batman faces his greatest psychological and physical tests."
)

# Create sample shows
Show.objects.create(
    movie=movie1,
    screen_name="IMAX Screen 1",
    date_time=timezone.now() + timedelta(days=1),
    total_seats=100,
    price=350.00
)

Show.objects.create(
    movie=movie2,
    screen_name="Premium Screen 2",
    date_time=timezone.now() + timedelta(days=2),
    total_seats=80,
    price=300.00
)
```

### 6. Run the Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/`

## 📚 API Documentation

Access the interactive Swagger documentation at:
- **Swagger UI**: http://127.0.0.1:8000/swagger/
- **ReDoc**: http://127.0.0.1:8000/redoc/

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup/` | Register a new user |
| POST | `/api/login/` | Login and get JWT tokens |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies/` | List all movies |
| POST | `/api/movies/` | Create a new movie |
| GET | `/api/movies/{id}/` | Get movie details |
| PUT | `/api/movies/{id}/` | Update movie |
| DELETE | `/api/movies/{id}/` | Delete movie |
| GET | `/api/movies/{id}/shows/` | Get shows for a movie |

### Shows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shows/` | List all shows |
| POST | `/api/shows/` | Create a new show |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shows/{id}/book/` | Book a seat |
| POST | `/api/bookings/{id}/cancel/` | Cancel a booking |
| GET | `/api/my-bookings/` | Get user's bookings |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/` | Get user profile |
| PUT | `/api/profile/` | Update user profile |

## 🔐 Authentication Usage

### 1. Register a User

```bash
curl -X POST http://127.0.0.1:8000/api/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 2. Login and Get JWT Token

```bash
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepass123"
  }'
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### 3. Use Token for Authenticated Requests

```bash
curl -X POST http://127.0.0.1:8000/api/shows/1/book/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"seat_number": 5}'
```

## 📝 API Usage Examples

### Book a Seat

```bash
curl -X POST http://127.0.0.1:8000/api/shows/1/book/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"seat_number": 15}'
```

Response:
```json
{
  "message": "Seat booked successfully",
  "booking_id": 1,
  "seat_number": 15,
  "show_id": 1,
  "movie_title": "Avengers: Endgame",
  "show_datetime": "2023-12-25T19:00:00Z",
  "screen_name": "IMAX Screen 1"
}
```

### Cancel a Booking

```bash
curl -X POST http://127.0.0.1:8000/api/bookings/1/cancel/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get User's Bookings

```bash
curl -X GET http://127.0.0.1:8000/api/my-bookings/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

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