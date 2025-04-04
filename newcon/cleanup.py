import os
import time
import logging
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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