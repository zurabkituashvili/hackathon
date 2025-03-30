from django.urls import path
from . import views


urlpatterns = [
    path('', views.generate_text, name='generate_chat_response'),
    path('api/get-courses/', views.get_user_courses_data, name='get_user_courses_data'),
    path('api/courses/<int:course_id>/chapters/', views.get_course_chapters, name='get_course_chapters'),
    path('api/add-course/', views.generate_course, name ='get_course_chapters'),

    path('api/<int:chapter_id>/<str:msg_content>/send-mesage/', views.send_message, name='send_message')
]
