from django.urls import path
from . import views


urlpatterns = [
    path('api/chat/', views.generate_text, name='generate_chat_response'),
    path('api/get-courses/', views.get_user_courses_data, name='get_user_courses_data'),
    path('api/courses/<int:course_id>/chapters/', views.get_course_chapters, name='get_course_chapters'),
]
