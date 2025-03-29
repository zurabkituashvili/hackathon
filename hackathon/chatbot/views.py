import os
import dotenv
import jwt
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.conf import settings
from .models import Course, Chapters, ChapterHistory
from google import genai
from google.genai import types
import dotenv

dotenv.load_dotenv()

dotenv.load_dotenv()

# Send request to generate answer based on input
@csrf_exempt
def generate_text(request):
    if request.method == 'POST':
        user_input = request.POST.get('user_input', '') # Get user input from the request
        try:
            client = genai.Client(
                api_key=os.getenv("GEMINI_API_KEY"),
            )

            model = "gemini-2.0-flash"
            system_instructions_1 = os.getenv("SYS_INSTRUCTIONS_1")
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=system_instructions_1),
                    ],
                ),
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=user_input),
                    ],
                ),
            ]
            generate_content_config = types.GenerateContentConfig(
                response_mime_type="text/plain",
            )
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            print(response.candidates[0].content.parts[0].text)
            return JsonResponse({
                'generated_text': response.candidates[0].content.parts[0].text,
                'is_quiz': 0
            })
            # HttpResponse(response.candidates[0].content.parts[0].text)
        except Exception as e:
            return e
    else:
        return render(request, 'chat_template.html') # Or your API endpoint logic

@csrf_exempt
def get_user_courses_data(request):
    # Assuming the JWT is passed in the Authorization header as a Bearer token
    authorization_header = request.META.get('HTTP_AUTHORIZATION')

    if not authorization_header or not authorization_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization header with JWT token is missing'}, status=401)

    token = authorization_header[7:]  # Extract the token part

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256']) # Replace with your actual secret key and algorithm
        user_id = payload.get('user_id')  # Assuming your JWT payload contains 'user_id'
        if not user_id:
            return JsonResponse({'error': 'Invalid JWT payload: user_id not found'}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        courses = Course.objects.filter(user=user)
        courses_data = []

        for course in courses:
            total_chapters = Chapters.objects.filter(course=course).count()
            completed_chapters_count = Chapters.objects.filter(comleted=True, course=course).count()

            courses_data.append({
                'id': course.id,
                'name': course.Name,
                'description': course.Description,
                'total_chapters_count': total_chapters,
                'completed_chapters_count': completed_chapters_count,
            })

        return JsonResponse({'courses': courses_data})

    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'JWT token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid JWT token'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt

def get_course_chapters(request, course_id):
    try:
        course = get_object_or_404(Course, id=course_id)
        chapters = Chapters.objects.filter(course=course).order_by('id')

        chapters_data = []
        for chapter in chapters:
            chapters_data.append({
                'id': chapter.id,
                'name': chapter.Name,
                'completed':chapter.completed,
            })

        return JsonResponse({'chapters': chapters_data})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

