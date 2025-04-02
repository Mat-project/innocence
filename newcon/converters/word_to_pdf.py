from docx import Document
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import docx2txt

def convert_word_to_pdf(input_path, output_path):
    # Extract text from Word document
    text = docx2txt.process(input_path)
    
    # Create PDF
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter
    
    # Split text into lines and write to PDF
    y = height - 40  # Start from top of page
    for line in text.split('\n'):
        if y <= 40:  # If we're at the bottom of the page
            c.showPage()  # Start a new page
            y = height - 40  # Reset y position
        
        c.drawString(40, y, line)
        y -= 15  # Move down for next line
    
    c.save()
