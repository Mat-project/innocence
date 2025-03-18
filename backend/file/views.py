import os
import time
from django.conf import settings
from django.http import JsonResponse, FileResponse, HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
""" from .converters.word_to_pdf import convert_word_to_pdf
from .converters.pdf_to_word import convert_pdf_to_word
from .converters.pdf_to_pptx import convert_pdf_to_pptx
from .converters.pdf_to_img import convert_pdf_to_img
from .converters.img_to_pdf import convert_img_to_pdf
from .converters.html_to_pdf import convert_html_to_pdf """
import zipfile
import tempfile
import shutil
import traceback
from .converters import html_to_pdf, img_to_pdf, pdf_to_img, pdf_to_pptx, pdf_to_word, word_to_pdf

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

@csrf_exempt
def convert_file_view(request):
    """Handle file conversion request."""
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are supported"}, status=405)
        
    if "file" not in request.FILES:
        return JsonResponse({"error": "No file uploaded"}, status=400)
        
    file = request.FILES["file"]
    file_type = request.POST.get("file_type")
    conversion_type = request.POST.get("conversion_type")
    
    # For debugging
    print(f"Received file: {file.name}, file_type: {file_type}, conversion_type: {conversion_type}")
    
    # Create temp directory
    temp_dir = tempfile.mkdtemp()
    input_path = os.path.join(temp_dir, file.name)
    
    try:
        # Save uploaded file
        with open(input_path, "wb+") as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        filename, ext = os.path.splitext(file.name)
        
        # Process based on conversion type
        if conversion_type == "image_to_pdf":
            output_path = os.path.join(temp_dir, f"{filename}.pdf")
            img_to_pdf.convert_img_to_pdf(input_path, output_path)
            content_type = "application/pdf"
            output_filename = f"{filename}.pdf"
            
        elif conversion_type == "pdf_to_img":
            # Use the directory version of the path for multi-page PDFs
            pdf_dir = os.path.join(temp_dir, filename)
            os.makedirs(pdf_dir, exist_ok=True)
            
            # Check if it's a multi-page PDF
            if is_multi_page_pdf(input_path):
                # Will return a ZIP file with all pages
                output_path = pdf_to_img.convert_pdf_to_img(input_path, pdf_dir)
                content_type = "application/zip"
                output_filename = f"{filename}.zip"
            else:
                # Single page PDF returns a single image
                output_path = pdf_to_img.convert_pdf_to_img(input_path, pdf_dir)
                content_type = "image/png"
                output_filename = f"{filename}.png"
            
        elif conversion_type == "pdf_to_word":
            output_path = os.path.join(temp_dir, f"{filename}.docx")
            pdf_to_word.convert_pdf_to_word(input_path, output_path)
            content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            output_filename = f"{filename}.docx"
            
        elif conversion_type == "html_to_pdf":
            output_path = os.path.join(temp_dir, f"{filename}.pdf")
            html_to_pdf.convert_html_to_pdf(input_path, output_path)
            content_type = "application/pdf"
            output_filename = f"{filename}.pdf"
            
        elif conversion_type == "pdf_to_pptx":
            output_path = os.path.join(temp_dir, f"{filename}.pptx")
            pdf_to_pptx.convert_pdf_to_pptx(input_path, output_path)
            content_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            output_filename = f"{filename}.pptx"
            
        elif conversion_type == "word_to_pdf":
            output_path = os.path.join(temp_dir, f"{filename}.pdf")
            word_to_pdf.convert_word_to_pdf(input_path, output_path)
            content_type = "application/pdf"
            output_filename = f"{filename}.pdf"
            
        else:
            return JsonResponse({"error": f"Unsupported conversion type: {conversion_type}"}, status=400)
        
        # Return the converted file
        response = FileResponse(open(output_path, "rb"), content_type=content_type)
        response["Content-Disposition"] = f'attachment; filename="{output_filename}"'
        
        return response
        
    except Exception as e:
        print(f"Conversion error: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)
        
    finally:
        # Cleanup will happen after response is sent
        import threading
        import time
        import shutil
        
        def delayed_cleanup():
            time.sleep(5)  # Wait to ensure response is sent
            try:
                if os.path.exists(input_path):
                    os.remove(input_path)
                if 'output_path' in locals() and os.path.exists(output_path):
                    os.remove(output_path)
                if os.path.exists(temp_dir):
                    # Use shutil.rmtree instead of os.rmdir for non-empty directories
                    shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception as e:
                print(f"Cleanup error: {e}")
                
        threading.Thread(target=delayed_cleanup).start()

# Add helper function to detect multi-page PDFs
def is_multi_page_pdf(pdf_path):
    """Check if a PDF has multiple pages."""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(pdf_path)
        return len(reader.pages) > 1
    except:
        # If PyPDF2 is not available, assume single page
        return False

# Add this test view
def test_view(request):
    return HttpResponse("File app is working!")
