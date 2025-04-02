from flask import Flask, render_template, request, send_file, redirect, url_for, flash, jsonify
import os
import logging
from werkzeug.utils import secure_filename
from converters.img_to_pdf import convert_img_to_pdf
from converters.pdf_to_img import convert_pdf_to_img
from converters.pdf_to_word import convert_pdf_to_word
from converters.html_to_pdf import convert_html_to_pdf
from converters.pdf_to_pptx import convert_pdf_to_pptx
from converters.word_to_pdf import convert_word_to_pdf
import time
import shutil
from flask_cors import CORS

# Configure logging with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.secret_key = os.environ.get('SECRET_KEY', 'supersecretkey')

# Define folders for file uploads and results
UPLOAD_FOLDER = os.path.abspath("uploads")
RESULT_FOLDER = os.path.abspath("results")

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    "pdf": ["pdf"],
    "image": ["png", "jpg", "jpeg"],
    "html": ["html", "htm"],
    "word": ["docx", "doc"]
}

def ensure_directories():
    """Create necessary directories if they don't exist"""
    try:
        for folder in [UPLOAD_FOLDER, RESULT_FOLDER]:
            if not os.path.exists(folder):
                os.makedirs(folder)
                logger.info(f"Created directory: {folder}")
        return True
    except Exception as e:
        logger.error(f"Failed to create directories: {str(e)}")
        return False

def allowed_file(filename, file_type):
    """Check if the file extension is allowed"""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS.get(file_type, [])

def clean_old_files():
    """Clean up old files from uploads and results folders"""
    for folder in [UPLOAD_FOLDER, RESULT_FOLDER]:
        if not os.path.exists(folder):
            continue
        for filename in os.listdir(folder):
            filepath = os.path.join(folder, filename)
            try:
                if os.path.isfile(filepath) and os.path.getmtime(filepath) < (time.time() - 3600):
                    os.remove(filepath)
                    logger.info(f"Removed old file: {filepath}")
            except Exception as e:
                logger.error(f"Error cleaning up file {filepath}: {str(e)}")

def safe_convert(convert_func, input_path, output_path):
    """Safely execute conversion function with error handling"""
    try:
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input file not found: {input_path}")
        
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Perform the conversion
        convert_func(input_path, output_path)
        
        if not os.path.exists(output_path):
            raise FileNotFoundError(f"Conversion failed to create output file: {output_path}")
            
        return True
    except Exception as e:
        logger.error(f"Conversion error: {str(e)}")
        raise

@app.route("/")
def index():
    return render_template("index1.html")

@app.route("/convert", methods=["POST"])
def convert():
    filepath = None
    output_path = None
    
    try:
        # Ensure directories exist
        if not ensure_directories():
            return jsonify({"error": "Failed to create necessary directories"}), 500

        # Validate file upload
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        file_type = request.form.get("file_type")
        conversion_type = request.form.get("conversion_type")

        # Validate file and parameters
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not file_type or not conversion_type:
            return jsonify({"error": "Missing conversion parameters"}), 400

        if not allowed_file(file.filename, file_type):
            return jsonify({"error": f"Invalid file type. Allowed types for {file_type}: {', '.join(ALLOWED_EXTENSIONS[file_type])}"}), 400

        # Clean up old files
        clean_old_files()

        # Secure filename and create paths
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save uploaded file
        logger.info(f"Saving uploaded file to: {filepath}")
        file.save(filepath)

        # Prepare output filename and path
        output_filename = f"converted_{filename}"
        if conversion_type in ["pdf_to_word"]:
            output_filename = output_filename.rsplit(".", 1)[0] + ".docx"
        elif conversion_type in ["img_to_pdf", "html_to_pdf", "word_to_pdf"]:
            output_filename = output_filename.rsplit(".", 1)[0] + ".pdf"
        elif conversion_type == "pdf_to_img":
            output_filename = output_filename.rsplit(".", 1)[0] + ".png"
        elif conversion_type == "pdf_to_pptx":
            output_filename = output_filename.rsplit(".", 1)[0] + ".pptx"

        output_path = os.path.join(RESULT_FOLDER, output_filename)
        logger.info(f"Output path set to: {output_path}")

        # Perform conversion based on type
        if conversion_type == "img_to_pdf":
            safe_convert(convert_img_to_pdf, filepath, output_path)
        elif conversion_type == "pdf_to_img":
            safe_convert(convert_pdf_to_img, filepath, output_path)
        elif conversion_type == "pdf_to_word":
            safe_convert(convert_pdf_to_word, filepath, output_path)
        elif conversion_type == "html_to_pdf":
            safe_convert(convert_html_to_pdf, filepath, output_path)
        elif conversion_type == "pdf_to_pptx":
            safe_convert(convert_pdf_to_pptx, filepath, output_path)
        elif conversion_type == "word_to_pdf":
            safe_convert(convert_word_to_pdf, filepath, output_path)
        else:
            return jsonify({"error": "Invalid conversion type"}), 400

        logger.info(f"Conversion successful: {filepath} to {output_path}")

        return send_file(
            output_path,
            as_attachment=True,
            download_name=output_filename
        )

    except FileNotFoundError as e:
        logger.error(f"File not found error: {str(e)}")
        return jsonify({"error": str(e)}), 404

    except Exception as e:
        logger.error(f"Conversion error: {str(e)}")
        return jsonify({"error": f"Conversion failed: {str(e)}"}), 500

    finally:
        # Clean up uploaded file
        try:
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"Removed uploaded file: {filepath}")
        except Exception as e:
            logger.error(f"Error cleaning up file {filepath}: {str(e)}")

# --- Add these routes below your existing routes ---



@app.route("/download/<filename>")
def download_file(filename):
    # Serve the converted file from the results folder
    file_path = os.path.join(RESULT_FOLDER, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True, download_name=filename)
    else:
        return jsonify({"error": "File not found"}), 404

@app.route("/api/convert", methods=["POST"])
def api_convert():
    filepath = None
    output_path = None
    try:
        if not ensure_directories():
            return jsonify({"error": "Failed to create necessary directories"}), 500

        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        file_type = request.form.get("file_type")
        conversion_type = request.form.get("conversion_type")

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not file_type or not conversion_type:
            return jsonify({"error": "Missing conversion parameters"}), 400

        if not allowed_file(file.filename, file_type):
            allowed = ', '.join(ALLOWED_EXTENSIONS.get(file_type, []))
            return jsonify({"error": f"Invalid file type. Allowed: {allowed}"}), 400

        clean_old_files()

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        logger.info(f"Saving uploaded file to: {filepath}")
        file.save(filepath)

        # Prepare output filename based on conversion type
        output_filename = f"converted_{filename}"
        if conversion_type in ["pdf_to_word"]:
            output_filename = output_filename.rsplit(".", 1)[0] + ".docx"
        elif conversion_type in ["img_to_pdf", "html_to_pdf", "word_to_pdf"]:
            output_filename = output_filename.rsplit(".", 1)[0] + ".pdf"
        elif conversion_type == "pdf_to_img":
            output_filename = output_filename.rsplit(".", 1)[0] + ".png"
        elif conversion_type == "pdf_to_pptx":
            output_filename = output_filename.rsplit(".", 1)[0] + ".pptx"

        output_path = os.path.join(RESULT_FOLDER, output_filename)
        logger.info(f"Output path set to: {output_path}")

        # Run conversion
        if conversion_type == "img_to_pdf":
            safe_convert(convert_img_to_pdf, filepath, output_path)
        elif conversion_type == "pdf_to_img":
            safe_convert(convert_pdf_to_img, filepath, output_path)
        elif conversion_type == "pdf_to_word":
            safe_convert(convert_pdf_to_word, filepath, output_path)
        elif conversion_type == "html_to_pdf":
            safe_convert(convert_html_to_pdf, filepath, output_path)
        elif conversion_type == "pdf_to_pptx":
            safe_convert(convert_pdf_to_pptx, filepath, output_path)
        elif conversion_type == "word_to_pdf":
            safe_convert(convert_word_to_pdf, filepath, output_path)
        else:
            return jsonify({"error": "Invalid conversion type"}), 400

        logger.info(f"Conversion successful: {filepath} to {output_path}")

        # Return URL for downloading converted file
        file_url = url_for('download_file', filename=output_filename, _external=True)
        return jsonify({"file_url": file_url}), 200

    except FileNotFoundError as e:
        logger.error(f"File not found error: {str(e)}")
        return jsonify({"error": str(e)}), 404

    except Exception as e:
        logger.error(f"Conversion error: {str(e)}")
        return jsonify({"error": f"Conversion failed: {str(e)}"}), 500

    finally:
        try:
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"Removed uploaded file: {filepath}")
        except Exception as e:
            logger.error(f"Error cleaning up file {filepath}: {str(e)}")

if __name__ == "__main__":
    # Ensure directories exist on startup
    ensure_directories()
    # Start the Flask app
    app.run(debug=True)
