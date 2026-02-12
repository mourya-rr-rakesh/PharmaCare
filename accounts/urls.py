from django.urls import path
from .views import register, login_view, logout_view, profile

urlpatterns = [
    path('register.html', register, name='api_register'),
    path('login.html', login_view, name='api_login'),
    path('logout.html', logout_view, name='api_logout'),
    path('profile.html', profile, name='api_profile'),
]
