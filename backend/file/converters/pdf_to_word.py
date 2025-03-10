import fitz
from docx import Document
from docx.shared import Pt

def convert_pdf_to_word(input_path, output_path):
    pdf_document = fitz.open(input_path)
    doc = Document()
    
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        text = page.get_text()
        
        # Add text to Word document
        paragraph = doc.add_paragraph(text)
        paragraph.style.font.size = Pt(12)
    
    doc.save(output_path)
    pdf_document.close()
