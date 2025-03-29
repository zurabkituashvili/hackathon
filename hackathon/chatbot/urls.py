from django.urls import path
from . import views


urlpatterns = [
    path('api/chat/', views.generate_text, name='generate_chat_response')
]
