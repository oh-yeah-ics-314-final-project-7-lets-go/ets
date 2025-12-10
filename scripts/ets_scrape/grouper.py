#!/usr/bin/env python3
"""
PDF Grouper
Groups PDFs in downloads/ by their first 12 characters into subdirectories
"""

import os
import shutil
from pathlib import Path

def group_pdfs():
    """Group PDFs by first 12 characters of filename"""
    downloads_dir = Path('downloads')
    
    if not downloads_dir.exists():
        print("Downloads directory doesn't exist!")
        return
    
    # Get all PDF files
    pdf_files = list(downloads_dir.glob('*.pdf'))
    
    if not pdf_files:
        print("No PDF files found in downloads directory")
        return
    
    print(f"Found {len(pdf_files)} PDF files")
    
    groups = {}
    for pdf_file in pdf_files:
        prefix = pdf_file.name[:8]
        
        if prefix not in groups:
            groups[prefix] = []
        groups[prefix].append(pdf_file)
    
    print(f"Found {len(groups)} groups:")
    for prefix, files in groups.items():
        print(f"  {prefix}: {len(files)} files")
    
    # Create directories and move files
    for prefix, files in groups.items():
        group_dir = downloads_dir / prefix
        group_dir.mkdir(exist_ok=True)
        
        print(f"\nMoving files to {prefix}/:")
        for pdf_file in files:
            new_path = group_dir / pdf_file.name
            
            # Skip if file already exists in destination
            if new_path.exists():
                print(f"  Skipping {pdf_file.name} (already exists)")
                continue
            
            shutil.move(str(pdf_file), str(new_path))
            print(f"  Moved: {pdf_file.name}")
    
    print("\nGrouping complete!")

if __name__ == "__main__":
    group_pdfs()