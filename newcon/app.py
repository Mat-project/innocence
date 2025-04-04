import os
import time
import logging
import traceback
import threading
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Import converters
from converters.img_to_pdf import convert_img_to_pdf
from converters.pdf_to_img import convert_pdf_to_img
from converters.pdf_to_word import convert_pdf_to_word
from converters.html_to_pdf import convert_html_to_pdf
from converters.pdf_to_pptx import convert_pdf_to_pptx
from converters.word_to_pdf import convert_word_to_pdf

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)
logger = logging.getLogger(__name__)

# Define folders for uploads and results
UPLOAD_FOLDER = os.path.abspath("uploads")
RESULT_FOLDER = os.path.abspath("results")

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    "pdf": ["pdf"],
    "image": ["png", "jpg", "jpeg"],
    "html": ["html", "htm"],
    "word": ["docx", "doc"]
}

# File cleanup service
class FileCleanupService:
    def __init__(self, directories, max_age_seconds=3600, check_interval_seconds=300):
        self.directories = directories
        self.max_age_seconds = max_age_seconds
        self.check_interval_seconds = check_interval_seconds
        self.stop_event = threading.Event()
        self.thread = None
    
    def start(self):
        """Start the cleanup service in a background thread"""
        if self.thread is not None:
            logger.warning("Cleanup service already running")
            return
            
        self.stop_event.clear()
        self.thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self.thread.start()
        logger.info(f"File cleanup service started. Monitoring: {', '.join(self.directories)}")
    
    def stop(self):
        """Stop the cleanup service"""
        if self.thread is None:
            logger.warning("Cleanup service not running")
            return
            
        self.stop_event.set()
        self.thread.join(timeout=10.0)
        self.thread = None
        logger.info("File cleanup service stopped")
    
    def _cleanup_loop(self):
        """Background thread that periodically cleans up old files"""
        while not self.stop_event.is_set():
            try:
                self.cleanup_once()
            except Exception as e:
                logger.error(f"Error during cleanup: {str(e)}")
                
            # Wait for the next interval or until stopped
            self.stop_event.wait(self.check_interval_seconds)
    
    def cleanup_once(self):
        """Clean up old files in the monitored directories once"""
        now = time.time()
        cleaned_count = 0
        
        for directory in self.directories:
            if not os.path.exists(directory) or not os.path.isdir(directory):
                logger.warning(f"Directory does not exist: {directory}")
                continue
                
            logger.info(f"Checking for old files in: {directory}")
            
            for filename in os.listdir(directory):
                filepath = os.path.join(directory, filename)
                
                # Skip directories
                if not os.path.isfile(filepath):
                    continue
                    
                # Check file age
                file_age = now - os.path.getmtime(filepath)
                
                if file_age > self.max_age_seconds:
                    try:
                        os.remove(filepath)
                        cleaned_count += 1
                        logger.info(f"Removed old file: {filepath} (age: {file_age:.1f} seconds)")
                    except Exception as e:
                        logger.error(f"Failed to remove file {filepath}: {str(e)}")
        
        logger.info(f"Cleanup completed: {cleaned_count} files removed")

# Initialize Flask app with CORS
app = Flask(__name__)
CORS(app, resources={
    r"/*": {"origins": "*", "supports_credentials": True}
})
app.secret_key = os.environ.get('SECRET_KEY', 'supersecretkey')

# Make sure these directories exist
for folder in [UPLOAD_FOLDER, RESULT_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)
        logger.info(f"Created directory: {folder}")

# Initialize cleanup service
cleanup_service = FileCleanupService(
    directories=[UPLOAD_FOLDER, RESULT_FOLDER],
    max_age_seconds=3600,  # Keep files for 1 hour
    check_interval_seconds=300  # Check every 5 minutes
)

def allowed_file(filename, file_type):
    """Check if the file extension is allowed for the given file type"""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS.get(file_type, [])

@app.route("/api/convert", methods=["POST"])
def api_convert():
    filepath = None
    output_path = None
    
    try:
        # Log the request
        logger.info(f"Received conversion request: {request.form}")
        
        # Check if file is present
        if "file" not in request.files:
            logger.error("No file part in the request")
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files["file"]
        if file.filename == "":
            logger.error("No file selected")
            return jsonify({"error": "No file selected"}), 400
        
        # Get parameters
        file_type = request.form.get("file_type")
        conversion_type = request.form.get("conversion_type")
        
        if not file_type or not conversion_type:
            logger.error(f"Missing parameters: file_type={file_type}, conversion_type={conversion_type}")
            return jsonify({"error": "Missing file_type or conversion_type parameter"}), 400
        
        # Validate file type
        if not allowed_file(file.filename, file_type):
            logger.error(f"File type not allowed: {file.filename}, expected type: {file_type}")
            return jsonify({"error": f"File type not allowed for {file_type}"}), 400
        
        # Save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        logger.info(f"Saving uploaded file to {filepath}")
        file.save(filepath)
        
        # Prepare output filename based on conversion type
        output_filename = f"converted_{filename}"
        if conversion_type == "pdf_to_word":
            output_filename = f"{os.path.splitext(output_filename)[0]}.docx"
        elif conversion_type in ["img_to_pdf", "html_to_pdf", "word_to_pdf"]:
            output_filename = f"{os.path.splitext(output_filename)[0]}.pdf"
        elif conversion_type == "pdf_to_img":
            output_filename = f"{os.path.splitext(output_filename)[0]}.png"
        elif conversion_type == "pdf_to_pptx":
            output_filename = f"{os.path.splitext(output_filename)[0]}.pptx"
            
        output_path = os.path.join(RESULT_FOLDER, output_filename)
        logger.info(f"Output path: {output_path}")
        
        # Perform the conversion
        if conversion_type == "img_to_pdf":
            convert_img_to_pdf(filepath, output_path)
        elif conversion_type == "pdf_to_img":
            convert_pdf_to_img(filepath, output_path)
        elif conversion_type == "pdf_to_word":
            convert_pdf_to_word(filepath, output_path)
        elif conversion_type == "html_to_pdf":
            convert_html_to_pdf(filepath, output_path)
        elif conversion_type == "pdf_to_pptx":
            convert_pdf_to_pptx(filepath, output_path)
        elif conversion_type == "word_to_pdf":
            convert_word_to_pdf(filepath, output_path)
        else:
            logger.error(f"Unsupported conversion type: {conversion_type}")
            return jsonify({"error": f"Unsupported conversion type: {conversion_type}"}), 400
        
        # Verify output file exists
        if not os.path.exists(output_path):
            raise FileNotFoundError(f"Conversion did not produce output file: {output_path}")
            
        # Return download URL
        download_url = f"http://localhost:5000/download/{output_filename}"
        logger.info(f"Conversion successful: {filepath} -> {output_path}")
        logger.info(f"Download URL: {download_url}")
        
        return jsonify({
            "success": True,
            "file_url": download_url,
            "filename": output_filename
        })
        
    except Exception as e:
        logger.error(f"Conversion error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Conversion failed: {str(e)}"}), 500

@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    file_path = os.path.join(RESULT_FOLDER, filename)
    logger.info(f"Download request for file: {file_path}")
    
    if os.path.exists(file_path):
        logger.info(f"Serving file: {file_path}")
        response = send_file(
            file_path,
            as_attachment=True,
            download_name=filename
        )
        # Add CORS headers manually for this route
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    
    logger.error(f"File not found: {file_path}")
    return jsonify({"error": "File not found"}), 404

# Add a proper error handler
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}")
    logger.error(traceback.format_exc())
    return jsonify({"error": str(e)}), 500

@app.teardown_appcontext
def shutdown_cleanup_service(exception=None):
    """Stop the cleanup service when the app shuts down"""
    cleanup_service.stop()

if __name__ == "__main__":
    # Start the cleanup service
    cleanup_service.start()
    
    # Start the Flask app
    logger.info("Starting Flask app on http://localhost:5000")
    app.run(debug=True)