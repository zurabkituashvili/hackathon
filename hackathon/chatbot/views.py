import os
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from google import genai
from google.genai import types


# Send request to generate answer based on input
@csrf_exempt
def generate_text(request):
    if request.method == 'POST':
        user_input = request.POST.get('user_input', '') # Get user input from the request
        try:
            client = genai.Client(
                api_key=os.environ.get("GEMINI_API_KEY"),
            )

            model = "gemini-2.0-flash"
            contents = [
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
            return JsonResponse({'generated_text': response.candidates[0].content.parts[0].text})
            # HttpResponse(response.candidates[0].content.parts[0].text)
        except Exception as e:
            return e
    else:
        return render(request, 'chat_template.html') # Or your API endpoint logic

