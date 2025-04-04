from PIL import Image
from fpdf import FPDF
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_img_to_pdf(input_path, output_path):
    """Convert image to PDF using a simple, reliable approach"""
    try:
        logger.info(f"Starting image to PDF conversion: {input_path} -> {output_path}")
        
        # Open and verify the image
        img = Image.open(input_path)
        logger.info(f"Image opened successfully: {img.format}, mode={img.mode}, size={img.size}")
        
        # Convert image to RGB if needed
        if img.mode == "RGBA":
            logger.info("Converting RGBA image to RGB")
            img = img.convert('RGB')
        
        # Get image dimensions in pixels
        width_px, height_px = img.size
        logger.info(f"Image dimensions: {width_px}x{height_px} pixels")
        
        # Create a PDF with FPDF
        pdf = FPDF()
        pdf.add_page()
        
        # Calculate dimensions to fit on page while maintaining aspect ratio
        # FPDF uses mm for dimensions
        page_width_mm = 210  # A4 width in mm
        page_height_mm = 297  # A4 height in mm
        
        # Calculate scaling to fit on page (with margins)
        width_ratio = (page_width_mm - 20) / width_px
        height_ratio = (page_height_mm - 20) / height_px
        ratio = min(width_ratio, height_ratio)
        
        # Calculate new dimensions in mm
        width_mm = width_px * ratio
        height_mm = height_px * ratio
        
        # Calculate position to center the image
        x_mm = (page_width_mm - width_mm) / 2
        y_mm = (page_height_mm - height_mm) / 2
        
        # Save the image to a temporary file if it's not already in a compatible format
        temp_path = input_path
        if img.format not in ['JPEG', 'PNG']:
            temp_path = os.path.splitext(input_path)[0] + "_temp.jpg"
            logger.info(f"Converting image to JPEG: {temp_path}")
            img.save(temp_path, "JPEG")
        
        # Add the image to the PDF
        logger.info(f"Adding image to PDF at position ({x_mm}, {y_mm}) with size {width_mm}x{height_mm} mm")
        pdf.image(temp_path, x=x_mm, y=y_mm, w=width_mm, h=height_mm)
        
        # Output the PDF
        logger.info(f"Saving PDF to: {output_path}")
        pdf.output(output_path)
        
        # Clean up temporary file if created
        if temp_path != input_path and os.path.exists(temp_path):
            logger.info(f"Removing temporary file: {temp_path}")
            os.remove(temp_path)
        
        logger.info("Image to PDF conversion completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error in image to PDF conversion: {str(e)}")
        raise Exception(f"Failed to convert image to PDF: {str(e)}")
