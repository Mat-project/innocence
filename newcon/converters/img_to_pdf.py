from fpdf import FPDF
from PIL import Image

def convert_img_to_pdf(input_path, output_path):
    image = Image.open(input_path)
    pdf = FPDF()
    pdf.add_page()
    pdf.image(input_path, 0, 0, 210, 297)  # A4 Size
    pdf.output(output_path)
