"""
URL configuration for pharmacare project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .views import *

urlpatterns = [
    path('', home),
    path('login.html', login_page),
    path('registration.html', register_page),
    path('register', register_view),
    path('login', login_view),
    path('profile_api', profile_api),
    path('update-profile', update_profile),
    path('logout', logout_view),
    path('dashboard.html', dashboard),
    path('profile.html', profile),
    path('total-medicines.html', total_medicines),
    path('soon-expiring.html', soon_expiring),
    path('billing.html', billing),
    path('admin/users', admin_users_api),
    path('admin/users/<str:email>', admin_delete_user),
    path('admin/users/<str:email>/subscription', admin_update_subscription),
    path('admin.html', admin_panel),


    path('', include('accounts.urls')),
    path('', include('inventory.urls')),
    path('', include('billing.urls')),
]