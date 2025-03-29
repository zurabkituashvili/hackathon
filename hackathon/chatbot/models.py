from django.db import models
from django.contrib.auth.models import User


class Course(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    Name = models.CharField(max_length=255)
    Description = models.TextField()
    created_at = models.DateField()
    weeks = models.IntegerField()

class Chapters(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE) # course_id_fk
    Name = models.CharField(max_length=255)
    # order = models.IntegerField(null=True, blank=True)
    completed = models.BooleanField(default=False)

class LearningFiles(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE) # course_id_fk
    file_uri = models.CharField(max_length=255)

class ChapterHistory(models.Model):
    chapter = models.ForeignKey(Chapters, on_delete=models.CASCADE) # chapter_id_fk
    file_uri = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    role = models.CharField(max_length=255)
    completion_date = models.DateField(null=True, blank=True)
    number_of_completions = models.IntegerField(null=True, blank=True)
    first_quiz_date = models.DateField(null=True, blank=True)

class Quiz(models.Model):
    chapter = models.ForeignKey(Chapters, on_delete=models.CASCADE) # chapter_id_fk
    question = models.TextField()
    answer = models.TextField()
    evaluation = models.TextField()