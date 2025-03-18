import os
import platform
import subprocess
import fitz
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import tempfile
import pytesseract
from pdf2docx import Converter

def convert_pdf_to_word(input_path, output_path):
    """Convert PDF to Word document using pdf2docx library."""
    try:
        # Use pdf2docx which handles text, layout and basic formatting
        cv = Converter(input_path)
        cv.convert(output_path)
        cv.close()
        return True
    except Exception as e:
        print(f"Error converting PDF to Word: {e}")
        
        # Simple fallback - create a basic docx file
        try:
            from docx import Document
            doc = Document()
            doc.add_paragraph("PDF conversion failed. Please try again with a different file.")
            doc.save(output_path)
            return True
        except:
            raise