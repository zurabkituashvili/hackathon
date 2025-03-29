from django.urls import path
from .api_views import RegisterView, LoginView, DashboardView

urlpatterns = [
    path('api/register/', RegisterView.as_view(), name='api-register'),
    path('api/login/', LoginView.as_view(), name='api-login'),
    path('api/dashboard/', DashboardView.as_view(), name='api-dashboard'),
]
