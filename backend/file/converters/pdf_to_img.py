import fitz  # PyMuPDF
import os
import zipfile
from PIL import Image
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def convert_pdf_to_img(input_path, output_dir):
    """Convert PDF to image(s)."""
    try:
        from pdf2image import convert_from_path
        
        # Check if output_dir is a file path and convert to directory path
        if not os.path.isdir(output_dir):
            output_dir_name = os.path.splitext(output_dir)[0]
            os.makedirs(output_dir_name, exist_ok=True)
            output_dir = output_dir_name
        else:
            os.makedirs(output_dir, exist_ok=True)
        
        # Open the PDF
        pdf_document = fitz.open(input_path)
        
        # If single page, return just an image
        if pdf_document.page_count == 1:
            page = pdf_document[0]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better quality
            
            # Determine output path
            base_name = os.path.basename(input_path)
            base_name_no_ext = os.path.splitext(base_name)[0]
            output_path = os.path.join(output_dir, f"{base_name_no_ext}.png")
            
            # Save the image
            pix.save(output_path)
            return output_path
            
        # If multiple pages, create a ZIP file with all images
        else:
            zip_path = f"{output_dir}.zip"
            with zipfile.ZipFile(zip_path, 'w') as zip_file:
                for page_num, page in enumerate(pdf_document):
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img_bytes = pix.tobytes("png")
                    
                    # Add the image to the ZIP
                    img_filename = f"page_{page_num+1}.png"
                    zip_file.writestr(img_filename, img_bytes)
                    
            return zip_path
            
    except Exception as e:
        print(f"Error converting PDF to image: {e}")
        
        # Fallback - create a placeholder image
        try:
            # Create a blank image with text
            img = Image.new('RGB', (800, 600), color = (255, 255, 255))
            from PIL import ImageDraw, ImageFont
            d = ImageDraw.Draw(img)
            d.text((10,10), "PDF conversion to image failed.", fill=(0,0,0))
            d.text((10,30), f"Original file: {os.path.basename(input_path)}", fill=(0,0,0))
            img.save(output_dir)
            return True
        except:
            raise e