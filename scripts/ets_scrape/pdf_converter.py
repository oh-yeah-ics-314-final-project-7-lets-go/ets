"""
PDF to Image Converter
Converts PDF pages to images for GPT-4 Vision processing
"""

import fitz  # PyMuPDF
import base64
from io import BytesIO
from PIL import Image
import os
from pathlib import Path

class PDFConverter:
    def __init__(self, dpi=150, max_size=2048):
        """
        Initialize PDF converter
        
        Args:
            dpi: Resolution for image conversion (higher = better quality, higher cost)
            max_size: Maximum dimension to resize images (for API efficiency)
        """
        self.dpi = dpi
        self.max_size = max_size
    
    def pdf_to_images(self, pdf_path, max_pages=None):
        """
        Convert PDF to list of PIL Images
        
        Args:
            pdf_path: Path to PDF file
            max_pages: Maximum number of pages to process (None for all pages)
            
        Returns:
            List of PIL Image objects
        """
        images = []
        
        try:
            doc = fitz.open(pdf_path)
            
            # Determine how many pages to process
            pages_to_process = min(doc.page_count, max_pages) if max_pages else doc.page_count
            
            for page_num in range(pages_to_process):
                page = doc[page_num]
                
                # Convert to image
                mat = fitz.Matrix(self.dpi / 72, self.dpi / 72)
                pix = page.get_pixmap(matrix=mat)
                
                # Convert to PIL Image
                img_data = pix.tobytes("png")
                img = Image.open(BytesIO(img_data))
                
                # Resize if too large
                if max(img.size) > self.max_size:
                    img.thumbnail((self.max_size, self.max_size), Image.Resampling.LANCZOS)
                
                images.append(img)
            
            doc.close()
            
        except Exception as e:
            print(f"Error converting {pdf_path}: {e}")
            return []
        
        return images
    
    def image_to_base64(self, image):
        """
        Convert PIL Image to base64 string for API
        
        Args:
            image: PIL Image object
            
        Returns:
            Base64 encoded string
        """
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    def save_images(self, images, output_dir, basename):
        """
        Save images to disk (for debugging)
        
        Args:
            images: List of PIL Images
            output_dir: Directory to save images
            basename: Base filename (without extension)
        """
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        for i, img in enumerate(images):
            filename = f"{basename}_page_{i+1}.png"
            img.save(output_path / filename)
        
        print(f"Saved {len(images)} images to {output_dir}")
    
    def get_pdf_info(self, pdf_path):
        """
        Get basic info about PDF
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Dict with PDF metadata
        """
        try:
            doc = fitz.open(pdf_path)
            
            info = {
                'page_count': doc.page_count,
                'title': doc.metadata.get('title', ''),
                'author': doc.metadata.get('author', ''),
                'subject': doc.metadata.get('subject', ''),
                'creator': doc.metadata.get('creator', ''),
                'file_size': os.path.getsize(pdf_path)
            }
            
            doc.close()
            return info
            
        except Exception as e:
            print(f"Error getting PDF info for {pdf_path}: {e}")
            return {}