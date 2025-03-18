import os
from PIL import Image

def convert_img_to_pdf(input_path, output_path):
    """Convert image to PDF."""
    try:
        from PIL import Image
        from reportlab.pdfgen import canvas
        
        # Open image and get dimensions
        img = Image.open(input_path)
        img_width, img_height = img.size
        
        # Set up PDF with appropriate dimensions
        c = canvas.Canvas(output_path, pagesize=(img_width, img_height))
        c.drawImage(input_path, 0, 0, width=img_width, height=img_height)
        c.save()
        return True
    except Exception as e:
        print(f"Error converting image to PDF: {e}")
        raise
