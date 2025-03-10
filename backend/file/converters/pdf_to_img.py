import fitz  # PyMuPDF

def convert_pdf_to_img(input_path, output_path):
    pdf_document = fitz.open(input_path)
    page = pdf_document[0]  # Get the first page
    pix = page.get_pixmap()
    pix.save(output_path)
    pdf_document.close()
