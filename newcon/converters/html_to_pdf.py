import pdfkit

def convert_html_to_pdf(input_path, output_path):
    # Read HTML content from file
    with open(input_path, 'r', encoding='utf-8') as file:
        html_content = file.read()
    
    # Convert HTML to PDF
    pdfkit.from_string(html_content, output_path)
