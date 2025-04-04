import fitz  # PyMuPDF
from PIL import Image
import io
import os

def convert_pdf_to_img(input_path, output_path):
    """Convert PDF to images with high quality"""
    try:
        # Open PDF document
        pdf_document = fitz.open(input_path)
        
        # Get number of pages
        num_pages = len(pdf_document)
        
        if num_pages == 1:
            # Single page PDF - save directly as image
            page = pdf_document[0]
            
            # Set a high zoom factor for better quality
            zoom = 2.0
            mat = fitz.Matrix(zoom, zoom)
            
            # Get the pixmap with higher resolution
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PIL Image for better quality control
            img_data = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            # Save with high quality
            img_data.save(output_path, quality=95)
        else:
            # Multiple pages - create a directory for images
            base_path = os.path.splitext(output_path)[0]
            os.makedirs(base_path, exist_ok=True)
            
            for page_num in range(num_pages):
                page = pdf_document[page_num]
                
                # Set a high zoom factor for better quality
                zoom = 2.0
                mat = fitz.Matrix(zoom, zoom)
                
                # Get the pixmap with higher resolution
                pix = page.get_pixmap(matrix=mat)
                
                # Convert to PIL Image
                img_data = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                
                # Save each page as a separate high-quality image
                page_path = os.path.join(base_path, f"page_{page_num + 1}.png")
                img_data.save(page_path, quality=95)
            
            # For compatibility with single-page logic, copy first page to output_path
            first_page_path = os.path.join(base_path, "page_1.png")
            if os.path.exists(first_page_path):
                img = Image.open(first_page_path)
                img.save(output_path, quality=95)
        
        pdf_document.close()
        return True
        
    except Exception as e:
        raise Exception(f"Error converting PDF to image: {str(e)}")
