from django.contrib import admin
from .models import Movie, Show, Booking


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    """
    Admin configuration for Movie model.
    """
    list_display = ('title', 'duration_minutes', 'genre', 'rating', 'release_date', 'created_at')
    list_filter = ('genre', 'rating', 'release_date', 'created_at')
    search_fields = ('title', 'genre', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'duration_minutes', 'genre', 'rating')
        }),
        ('Details', {
            'fields': ('description', 'release_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Show)
class ShowAdmin(admin.ModelAdmin):
    """
    Admin configuration for Show model.
    """
    list_display = ('movie', 'screen_name', 'date_time', 'total_seats', 'available_seats', 'price')
    list_filter = ('screen_name', 'date_time', 'movie__genre', 'created_at')
    search_fields = ('movie__title', 'screen_name')
    ordering = ('date_time',)
    readonly_fields = ('created_at', 'updated_at', 'available_seats', 'booked_seat_numbers')
    
    fieldsets = (
        ('Show Information', {
            'fields': ('movie', 'screen_name', 'date_time')
        }),
        ('Capacity & Pricing', {
            'fields': ('total_seats', 'available_seats', 'price')
        }),
        ('Booking Status', {
            'fields': ('booked_seat_numbers',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def available_seats(self, obj):
        """Display available seats count."""
        return obj.available_seats
    available_seats.short_description = 'Available Seats'


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """
    Admin configuration for Booking model.
    """
    list_display = ('id', 'user', 'show', 'seat_number', 'status', 'created_at')
    list_filter = ('status', 'show__movie', 'show__screen_name', 'created_at')
    search_fields = ('user__username', 'user__email', 'show__movie__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('user', 'show', 'seat_number', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        """Make user and show readonly after creation."""
        if obj:  # Editing an existing object
            return self.readonly_fields + ('user', 'show', 'seat_number')
        return self.readonly_fields

    def has_delete_permission(self, request, obj=None):
        """Only allow deletion if booking is cancelled."""
        if obj and obj.status == 'booked':
            return False
        return super().has_delete_permission(request, obj)