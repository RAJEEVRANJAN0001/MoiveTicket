"""
Django management command to populate the database with sample data.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from movies.models import Movie, Show


class Command(BaseCommand):
    help = 'Populate database with sample movies and shows'

    def handle(self, *args, **options):
        # Create sample movies
        movies_data = [
            {
                'title': 'Avengers: Endgame',
                'duration_minutes': 181,
                'genre': 'Action',
                'rating': 8.4,
                'description': 'The Avengers assemble once more to reverse Thanos actions and save the universe.',
            },
            {
                'title': 'The Dark Knight',
                'duration_minutes': 152,
                'genre': 'Action',
                'rating': 9.0,
                'description': 'Batman faces his greatest psychological and physical tests when the Joker wreaks havoc.',
            },
            {
                'title': 'Inception',
                'duration_minutes': 148,
                'genre': 'Sci-Fi',
                'rating': 8.8,
                'description': 'A thief who steals corporate secrets through dream-sharing technology.',
            },
            {
                'title': 'The Lion King',
                'duration_minutes': 118,
                'genre': 'Animation',
                'rating': 8.5,
                'description': 'A young lion prince flees his kingdom only to learn the true meaning of responsibility.',
            },
            {
                'title': 'Parasite',
                'duration_minutes': 132,
                'genre': 'Thriller',
                'rating': 8.6,
                'description': 'A poor family schemes to become employed by a wealthy family.',
            },
        ]

        movies = []
        for movie_data in movies_data:
            movie, created = Movie.objects.get_or_create(
                title=movie_data['title'],
                defaults=movie_data
            )
            movies.append(movie)
            if created:
                self.stdout.write(f'Created movie: {movie.title}')
            else:
                self.stdout.write(f'Movie already exists: {movie.title}')

        # Create sample shows
        screens = ['IMAX Screen 1', 'Premium Screen 2', 'Standard Screen 3', 'Dolby Atmos 4']
        base_time = timezone.now() + timedelta(hours=2)
        
        show_count = 0
        for i, movie in enumerate(movies):
            for j in range(3):  # 3 shows per movie
                show_time = base_time + timedelta(days=j, hours=i*2)
                screen = screens[j % len(screens)]
                
                show, created = Show.objects.get_or_create(
                    movie=movie,
                    screen_name=screen,
                    date_time=show_time,
                    defaults={
                        'total_seats': 100 if 'IMAX' in screen else 80,
                        'price': 350.00 if 'IMAX' in screen else 300.00 if 'Premium' in screen else 250.00,
                    }
                )
                
                if created:
                    show_count += 1
                    self.stdout.write(f'Created show: {movie.title} at {screen} on {show_time}')

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(movies)} movies and {show_count} shows')
        )