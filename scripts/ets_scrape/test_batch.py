"""
Test script to verify batch processor setup
"""

from batch_processor import ATGBatchProcessor
import os

def test_setup():
    """Test the batch processor setup"""
    processor = ATGBatchProcessor()
    
    # Test PDF discovery
    pdf_files = processor.get_atg_pdfs()
    print(f"Found {len(pdf_files)} ATG CSEA PDF files:")
    
    for i, pdf_path in enumerate(pdf_files[:5]):  # Show first 5
        print(f"  {i+1}. {os.path.basename(pdf_path)}")
    
    if len(pdf_files) > 5:
        print(f"  ... and {len(pdf_files) - 5} more files")
    
    # Test PDF conversion on first file (without AI processing)
    if pdf_files:
        first_pdf = pdf_files[0]
        print(f"\nTesting PDF conversion on: {os.path.basename(first_pdf)}")
        
        try:
            images = processor.parser.converter.pdf_to_images(first_pdf, max_pages=10)
            print(f"Successfully converted {len(images)} pages")
        except Exception as e:
            print(f"Error converting PDF: {e}")
    
    return len(pdf_files)

if __name__ == "__main__":
    pdf_count = test_setup()
    print(f"\nSetup test complete. Ready to process {pdf_count} ATG CSEA reports.")