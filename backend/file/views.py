import os
import time
from django.conf import settings
from django.http import JsonResponse, FileResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from .converters.word_to_pdf import convert_word_to_pdf
from .converters.pdf_to_word import convert_pdf_to_word
from .converters.pdf_to_pptx import convert_pdf_to_pptx
from .converters.pdf_to_img import convert_pdf_to_img
from .converters.img_to_pdf import convert_img_to_pdf
from .converters.html_to_pdf import convert_html_to_pdf

# Allowed file extensions by file type
ALLOWED_EXTENSIONS = {
    "pdf": ["pdf"],
    "image": ["png", "jpg", "jpeg"],
    "html": ["html", "htm"],
    "word": ["docx"],
}

def allowed_file(filename, file_type):
    extension = filename.split('.')[-1].lower()
    allowed = ALLOWED_EXTENSIONS.get(file_type, [])
    return extension in allowed

# Define upload and result folders (adjust as necessary)
UPLOAD_FOLDER = os.path.join(settings.BASE_DIR, "uploads")
RESULT_FOLDER = os.path.join(settings.BASE_DIR, "results")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

def clean_old_files():
    """Remove files older than an hour."""
    folders = [os.path.join(settings.BASE_DIR, "uploads"), os.path.join(settings.BASE_DIR, "results")]
    for folder in folders:
        for filename in os.listdir(folder):
            filepath = os.path.join(folder, filename)
            try:
                if os.path.isfile(filepath) and os.path.getmtime(filepath) < (time.time() - 3600):
                    os.remove(filepath)
            except Exception as e:
                print(f"Error cleaning {filepath}: {e}")

@csrf_exempt  # If not using CSRF tokens; better to handle CSRF appropriately in production
def convert_file_view(request):
    if request.method == "GET":
        # Optionally, render a template for testing.
        return render(request, "file/index.html")
    elif request.method == "POST":
        # Debug log: print posted values
        print("POST data:", request.POST)
        if "file" not in request.FILES:
            return JsonResponse({"error": "No file uploaded"}, status=400)
        file = request.FILES["file"]
        file_type = request.POST.get("file_type")
        conversion_type = request.POST.get("conversion_type")
        print("file_type:", file_type, "conversion_type:", conversion_type)
        if file.name == "":
            return JsonResponse({"error": "No file selected"}, status=400)
        if not file_type or not conversion_type:
            return JsonResponse({"error": "Missing conversion parameters"}, status=400)
        if not allowed_file(file.name, file_type):
            allowed = ", ".join(ALLOWED_EXTENSIONS.get(file_type, []))
            return JsonResponse({"error": f"Invalid file type. Allowed: {allowed}"}, status=400)
        try:
            clean_old_files()
            filename = os.path.basename(file.name)  # Basic secure filename
            upload_path = os.path.join(UPLOAD_FOLDER, filename)
            with open(upload_path, "wb+") as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            # Define output filename (using conversion type’s ending part)
            extension = conversion_type.split('_')[-1]
            output_filename = f"converted_{os.path.splitext(filename)[0]}.{extension}"
            output_path = os.path.join(RESULT_FOLDER, output_filename)
            
            # Debug log conversion type
            print("Performing conversion:", conversion_type)
            # Perform conversion based on type
            if conversion_type == "image_to_pdf":
                convert_img_to_pdf(upload_path, output_path)
            elif conversion_type == "pdf_to_img":
                convert_pdf_to_img(upload_path, output_path)
            elif conversion_type == "pdf_to_word":
                convert_pdf_to_word(upload_path, output_path)
            elif conversion_type == "html_to_pdf":
                convert_html_to_pdf(upload_path, output_path)
            elif conversion_type == "pdf_to_pptx":
                convert_pdf_to_pptx(upload_path, output_path)
            elif conversion_type == "word_to_pdf":
                convert_word_to_pdf(upload_path, output_path)
            else:
                return JsonResponse({"error": "Invalid conversion type"}, status=400)
            # Return the converted file as a response
            response = FileResponse(open(output_path, "rb"), as_attachment=True, filename=output_filename)
            return response
        except Exception as e:
            print("Conversion error:", str(e))
            return JsonResponse({"error": f"Conversion failed: {str(e)}"}, status=500)
        finally:
            # Clean up the uploaded file
            try:
                if os.path.exists(upload_path):
                    os.remove(upload_path)
            except Exception as err:
                print(f"Error cleaning upload file: {err}")
