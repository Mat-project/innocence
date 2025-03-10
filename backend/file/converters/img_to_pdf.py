import os
from fpdf import FPDF
from PIL import Image

def convert_img_to_pdf(input_path, output_path):
    try:
        with Image.open(input_path) as image:
            if image.mode != "RGB":
                image = image.convert("RGB")
        pdf = FPDF(unit="mm", format="A4")
        pdf.add_page()
        margin = 10
        max_width = 210 - 2 * margin
        pdf.image(input_path, x=margin, y=margin, w=max_width)
        pdf.output(output_path, "F")
    except Exception as e:
        raise Exception(f"Image to PDF conversion error: {str(e)}")
