from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResumeViewSet

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume') # 'resumes' será o prefixo de URL

urlpatterns = [
    path('', include(router.urls)), 
]