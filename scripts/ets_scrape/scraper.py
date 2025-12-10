#!/usr/bin/env python3
"""
ETS Hawaii PDF Scraper
Extracts PDF links from target.html and downloads them
"""

import os
import re
import requests
from bs4 import BeautifulSoup
import time
from pathlib import Path

def extract_pdf_links(html_file):
    """Extract all PDF links from the HTML file"""
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    pdf_links = []
    for link in soup.find_all('a', href=True):
        href = link['href']
        if href.endswith('.pdf'):
            pdf_links.append({
                'url': href,
                'title': link.get_text(strip=True)
            })
    
    return pdf_links

def sanitize_filename(filename):
    """Sanitize filename for safe filesystem storage"""
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '-', filename)
    # Limit length
    if len(filename) > 200:
        filename = filename[:200]
    return filename

def download_pdf(url, filename, download_dir):
    """Download a single PDF file"""
    filepath = os.path.join(download_dir, filename)
    
    # Skip if file already exists
    if os.path.exists(filepath):
        print(f"Skipping (already exists): {filename}")
        return True
    
    try:
        print(f"Downloading: {filename}")
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Downloaded: {filename}")
        return True
        
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
        return False

def main():
    """Main scraper function"""
    # Create downloads directory
    download_dir = 'downloads'
    Path(download_dir).mkdir(exist_ok=True)
    
    # Extract PDF links from HTML file
    print("Extracting PDF links from target.html...")
    pdf_links = extract_pdf_links('target.html')
    print(f"Found {len(pdf_links)} PDF links")
    
    # Download each PDF
    successful = 0
    failed = 0
    
    for i, pdf_info in enumerate(pdf_links, 1):
        url = pdf_info['url']
        title = pdf_info['title']
        
        # Create filename from title or URL
        if title:
            filename = sanitize_filename(title) + '.pdf'
        else:
            filename = url.split('/')[-1]
        
        print(f"\n[{i}/{len(pdf_links)}]")
        
        if download_pdf(url, filename, download_dir):
            successful += 1
        else:
            failed += 1
        
        # Rate limiting - be respectful
        time.sleep(1)
    
    print(f"\n=== Download Complete ===")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"Total: {len(pdf_links)}")

if __name__ == "__main__":
    main()