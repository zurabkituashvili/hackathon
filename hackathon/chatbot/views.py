from datetime import date
import os
from datetime import date

import dotenv
# from google import genai
import google.generativeai as genai2
import jwt
from django.conf import settings
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from google import genai
from google.genai import types
from google.genai.types import ModelContent, UserContent, GenerateContentConfig
from pydantic import BaseModel
import json

from .apps import ChatbotConfig
from .models import Course, Chapters, ChapterHistory, LearningFiles


class GeminiResponse(BaseModel):
    chapterName: str


dotenv.load_dotenv()

chat_sessions = dict()

API_KEY = os.getenv('GEMINI_API_KEY')
genai2.configure(api_key=API_KEY)
model = genai2.GenerativeModel("gemini-2.0-flash")


# Send request to generate answer based on input
@csrf_exempt
def generate_text(request):
    if request.method == 'POST':
        user_input = request.POST.get('user_input', '')  # Get user input from the request
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
            generate_content_config = {
                'response_mime_type': 'application/json',
                'response_schema': list[str]
            }
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
        return render(request, 'chat_template.html')  # Or your API endpoint logic


@csrf_exempt
def get_user_courses_data(request):
    # Assuming the JWT is passed in the Authorization header as a Bearer token
    authorization_header = request.META.get('HTTP_AUTHORIZATION')

    if not authorization_header or not authorization_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization header with JWT token is missing'}, status=401)

    token = authorization_header[7:]  # Extract the token part

    try:
        payload = jwt.decode(token, settings.SECRET_KEY,
                             algorithms=['HS256'])  # Replace with your actual secret key and algorithm
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
            completed_chapters_count = Chapters.objects.filter(completed=True, course=course).count()

            courses_data.append({
                'id': course.id,
                'name': course.Name,
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
                'completed': chapter.completed,
            })

        return JsonResponse({'chapters': chapters_data})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_chapter_history(history):
    #history = ChapterHistory.objects.filter(chapter=chapter).order_by('id').values()

    res = []

    for h in history:
        if h['role'] == 'user':
            res.append(UserContent(parts=[{'text': h['content']}]))
        else:
            res.append(ModelContent(parts=[{'text': h['content']}]))

    return res

@csrf_exempt
def send_message(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        chapter = get_object_or_404(Chapters, id=data['chapter_id'])
        chathistory = ChapterHistory.objects.filter(chapter=chapter).order_by("id").values()
        course = get_object_or_404(Course, id=chapter.course.id)
        material = LearningFiles.objects.filter(course=course)
        client = genai.Client(api_key=API_KEY)

        system_instructions_1 = os.getenv("SYS_INSTRUCTIONS_1")

        contents = [
            types.Part.from_text(text=system_instructions_1),
            types.Part.from_uri(file_uri=material[0].file_uri, mime_type='application/pdf')
        ]

        history = get_chapter_history(chathistory)
        history.append(UserContent(parts=[{'text': data['msg']}]))

        contents.extend(history)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
        )

        userInput = ChapterHistory(chapter=chapter, content=data['msg'], role='user')
        modelResponse = ChapterHistory(chapter=chapter, content=response.text, role='model')
        userInput.save()
        modelResponse.save()


        return JsonResponse({'response': response.text, 'is_quiz': 0})


@csrf_exempt
def generate_course(request):
    if request.method == 'POST':
        file = request.FILES["file"]
        print(file)

        course_name = request.POST.get('course_name')

        authorization_header = request.META.get('HTTP_AUTHORIZATION')
        if not authorization_header or not authorization_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header with JWT token is missing'}, status=401)

        token = authorization_header[7:]  # Extract the token part
        payload = jwt.decode(token, settings.SECRET_KEY,
                             algorithms=['HS256'])  # Replace with your actual secret key and algorithm
        user_id = payload.get('user_id')  # Assuming your JWT payload contains 'user_id'
        if not user_id:
            return JsonResponse({'error': 'Invalid JWT payload: user_id not found'}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        if not file:
            return JsonResponse({'error': 'file pizdu'}, status=404)
        if not course_name:
            return JsonResponse({'error': 'course name pizdu'}, status=404)

        client = genai.Client(
            api_key=API_KEY,
        )

        file_name = default_storage.save(file.name, file)

        filepath = default_storage.path(file_name)

        uploaded_file = client.files.upload(
            file=filepath
        )

        system_instructions_2 = os.getenv("SYS_INSTRUCTIONS_2")
        contents = [
            types.Part.from_text(text=system_instructions_2),
            uploaded_file
        ]
        generate_content_config = {
            'response_mime_type': 'application/json',
            'response_schema': list[GeminiResponse]
        }

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=generate_content_config,
        )

        chapter_names = response.parsed

        course = Course(user=user, Name=course_name, created_at=date.today())
        course.save()

        material = LearningFiles(course=course, file_uri=uploaded_file.uri)
        material.save()

        res = []

        for chapter_name in chapter_names:
            chapter = Chapters(course=course, Name=chapter_name.chapterName, completed=False)
            chapter.save()

            # history = [
            #     {
            #         'role': 'model',
            #         'parts': [{'text': f'{os.getenv("SYS_INSTRUCTIONS_1")}'}]
            #     },
            #     {
            #         'role': 'model',
            #         'parts': types.Part.from_uri(file_uri=uploaded_file.uri, mime_type='application/json')
            #     },
            #     {
            #         'role': 'model',
            #         'parts': [
            #             {'text': f'This conversation should only cover {chapter_name.chapterName} and nothing else. First ask the user simplest question on this topic/chapter.'}
            #         ]
            #     },
            # ]

            # chat_sessions[chapter.id] = chat
            # res.update({'id': chapter.id, 'chapterName': chat})
            res.append({'id': chapter.id, 'chapterName': chapter_name.chapterName})

        return JsonResponse({'chapters': res})
