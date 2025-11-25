# backRimg/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils.backRimg import remove_bg
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from pathlib import Path
from django.conf import settings
import os

class RemoveBGAPIView(APIView):

    def post(self, request, *args, **kwargs):

        # If both cases: single or multiple uploads
        files = request.FILES.getlist('image')

        if not files:
            return Response({"error": "No image uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        output_urls = []  # list for multiple results

        for uploaded_file in files:

            # Save temporarily inside media/temp/
            temp_path = default_storage.save(
                f"temp/{uploaded_file.name}",
                ContentFile(uploaded_file.read())
            )
            temp_full_path = Path(settings.MEDIA_ROOT) / temp_path

            # Create output directory media/remove_bg_results/
            output_dir = Path(settings.MEDIA_ROOT) / "remove_bg_results"
            output_dir.mkdir(parents=True, exist_ok=True)

            # Call background removal helper
            output_path = remove_bg(str(temp_full_path), str(output_dir))

            # Delete temp file to save space
            if os.path.exists(temp_full_path):
                os.remove(temp_full_path)

            # Extract the filename only
            filename = Path(output_path).name

            # Correct media URL: /media/remove_bg_results/filename.png
            relative_url = settings.MEDIA_URL + "remove_bg_results/" + filename

            # Convert to full absolute URL
            absolute_url = request.build_absolute_uri(relative_url)

            # Add to results list
            output_urls.append(absolute_url)

        # If only one image was uploaded, return single URL
        if len(output_urls) == 1:
            return Response({"url": output_urls[0]}, status=status.HTTP_200_OK)

        # Else multiple
        return Response({"urls": output_urls}, status=status.HTTP_200_OK)
