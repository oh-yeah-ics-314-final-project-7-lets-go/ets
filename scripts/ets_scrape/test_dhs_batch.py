"""
Test script for DHS batch processor - processes just 3 files first
"""

from dhs_batch_processor import DHSBatchProcessor
import os

def test_dhs_processor():
    """Test the DHS batch processor with a few files"""
    processor = DHSBatchProcessor()
    
    # Get all PDF files
    all_pdfs = processor.get_dhs_pdfs()
    print(f"Found {len(all_pdfs)} DHS IV&V PDF files")
    
    # Test with just the first 3 files
    test_pdfs = all_pdfs[:3]
    
    print(f"\nTesting with first 3 files:")
    for i, pdf_path in enumerate(test_pdfs, 1):
        print(f"  {i}. {os.path.basename(pdf_path)}")
    
    # Temporarily modify the processor to only process these files
    original_get_pdfs = processor.get_dhs_pdfs
    processor.get_dhs_pdfs = lambda: test_pdfs
    
    # Process the test files
    consolidated_data = processor.process_all_reports()
    
    if consolidated_data:
        # Save test results
        output_path = "parsed_jsons/dhs_test_dataset.json"
        processor.save_consolidated_json(consolidated_data, output_path)
        print(f"\nTest completed successfully!")
        print(f"Total files found: {len(all_pdfs)}")
        return True
    else:
        print("Test failed - no data extracted")
        return False

if __name__ == "__main__":
    success = test_dhs_processor()
    if success:
        print("✅ Ready to process all DHS reports")
    else:
        print("❌ Need to fix issues before processing all files")