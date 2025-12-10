"""
Batch processor for DHS IV&V Reports
Processes all reports and generates a single consolidated JSON
"""

import os
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from ai_parser import AIParser

class DHSBatchProcessor:
    def __init__(self):
        """Initialize DHS batch processor"""
        self.parser = AIParser()
        self.dhs_path = "downloads/DHS IV&V Rep/"
        
    def get_dhs_pdfs(self) -> List[str]:
        """Get list of all DHS IV&V PDF files"""
        pdf_files = []
        dhs_dir = Path(self.dhs_path)
        
        if dhs_dir.exists():
            for pdf_file in dhs_dir.glob("*.pdf"):
                pdf_files.append(str(pdf_file))
        
        # Sort chronologically
        pdf_files.sort()
        return pdf_files
        
    def extract_project_info(self, pdf_path: str) -> Optional[Dict]:
        """Extract project information from a single PDF (preferably most recent)"""
        print(f"Extracting project info from: {pdf_path}")
        
        # Convert PDF to images (first 10 pages only)
        images = self.parser.converter.pdf_to_images(pdf_path, max_pages=10)
        
        if not images:
            print(f"Failed to convert PDF: {pdf_path}")
            return None
            
        # Create project-focused prompt
        project_prompt = """
You are analyzing an Independent Verification and Validation (IV&V) report for a Hawaii DHS project.

Extract ONLY the project information and return a valid JSON object with this structure:

{
  "project": {
    "name": "string",
    "description": "string", 
    "originalContractAward": 0.0,
    "status": "PENDING|DENIED|APPROVED"
  }
}

Focus on:
- Executive Summary
- Background section (usually page 3)
- Project overview information
- Look for DHS project names like "DHS Modernization", "KOLEA", or other DHS system names

IMPORTANT:
1. Extract financial amounts without $ signs or commas
2. Use exact enum values for status
3. Return ONLY the JSON object, no additional text
"""
        
        # Prepare messages for OpenAI
        messages = [
            {
                "role": "user", 
                "content": [
                    {
                        "type": "text",
                        "text": project_prompt
                    }
                ]
            }
        ]
        
        # Add images
        for image in images:
            image_base64 = self.parser.converter.image_to_base64(image)
            messages[0]["content"].append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{image_base64}",
                    "detail": "high"
                }
            })
            
        try:
            response = self.parser.client.chat.completions.create(
                model=self.parser.model,
                messages=messages,
                max_tokens=2000,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            
            # Extract JSON
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                data = json.loads(json_str)
                return data.get("project", {})
            
        except Exception as e:
            print(f"Error extracting project info: {e}")
            
        return None
        
    def extract_report_data(self, pdf_path: str) -> Optional[Dict]:
        """Extract report-specific data (reports, issues, events) from a PDF"""
        print(f"Processing report: {os.path.basename(pdf_path)}")
        
        # Convert PDF to images (first 10 pages only) 
        images = self.parser.converter.pdf_to_images(pdf_path, max_pages=10)
        
        if not images:
            print(f"Failed to convert PDF: {pdf_path}")
            return None
            
        # Create report-focused prompt (no project info)
        report_prompt = """
You are analyzing an Independent Verification and Validation (IV&V) report for a Hawaii DHS project.

Extract the report data and return ONLY a valid JSON object with this structure:

{
  "report": {
    "yearCreate": 2024,
    "monthCreate": "JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER",
    "paidUpToNow": 0.0,
    "progress": 0.0,
    "status": "PENDING|DENIED|APPROVED"
  },
  "issues": [
    {
      "title": "string",
      "description": "string",
      "remedy": "string",
      "severity": "HIGH|MEDIUM|LOW", 
      "likelihood": "HIGH|MEDIUM|LOW",
      "status": "OPEN|CLOSED"
    }
  ],
  "events": [
    {
      "name": "string",
      "description": "string",
      "plannedStart": "2024-01-01T00:00:00Z",
      "plannedEnd": "2024-01-01T00:00:00Z", 
      "completed": false,
      "actualStart": "2024-01-01T00:00:00Z",
      "actualEnd": "2024-01-01T00:00:00Z"
    }
  ]
}

Focus on:
- Executive Summary
- Background (page 3)
- IV&V Dashboard (page 4) 
- IV&V Summary (page 5)

IMPORTANT:
1. Extract ALL issues and events mentioned
2. For issues, create a concise title (3-6 words) summarizing the main concern
3. For financial amounts, extract numbers only (no $ signs or commas)
4. For progress percentages, use decimal format (0.75 for 75%)
5. For dates, use ISO format (YYYY-MM-DDTHH:mm:ssZ)
6. Use exact enum values
7. Return ONLY the JSON object, no additional text
"""
        
        # Prepare messages for OpenAI
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text", 
                        "text": report_prompt
                    }
                ]
            }
        ]
        
        # Add images
        for image in images:
            image_base64 = self.parser.converter.image_to_base64(image)
            messages[0]["content"].append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{image_base64}",
                    "detail": "high"
                }
            })
            
        try:
            response = self.parser.client.chat.completions.create(
                model=self.parser.model,
                messages=messages,
                max_tokens=4000,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            
            # Extract JSON
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                data = json.loads(json_str)
                
                # Validate data
                validated = self.parser.validate_extracted_data(data)
                return {
                    "report": validated.get("report", {}),
                    "issues": validated.get("issues", []),
                    "events": validated.get("events", [])
                }
                
        except Exception as e:
            print(f"Error processing {pdf_path}: {e}")
            
        return None
        
    def process_all_reports(self) -> Dict:
        """Process all DHS IV&V reports and return consolidated data"""
        pdf_files = self.get_dhs_pdfs()
        print(f"Found {len(pdf_files)} DHS IV&V PDF files")
        
        if not pdf_files:
            print("No PDF files found!")
            return {}
            
        # Extract project info from the most recent file
        project_info = self.extract_project_info(pdf_files[-1])  # Last file (most recent)
        
        if not project_info:
            print("Failed to extract project information")
            return {}
            
        # Initialize consolidated data structure
        consolidated_data = {
            "project": project_info,
            "reports": [],
            "issues": [],
            "events": []
        }
        
        # Process each report
        for pdf_path in pdf_files:
            report_data = self.extract_report_data(pdf_path)
            
            if report_data:
                # Add report to reports array
                if "report" in report_data:
                    consolidated_data["reports"].append(report_data["report"])
                
                # Add issues to consolidated issues
                if "issues" in report_data:
                    consolidated_data["issues"].extend(report_data["issues"])
                
                # Add events to consolidated events  
                if "events" in report_data:
                    consolidated_data["events"].extend(report_data["events"])
            else:
                print(f"Failed to process: {os.path.basename(pdf_path)}")
                
        print(f"Processing complete:")
        print(f"- Project: {project_info.get('name', 'Unknown')}")
        print(f"- Reports: {len(consolidated_data['reports'])}")
        print(f"- Issues: {len(consolidated_data['issues'])}")
        print(f"- Events: {len(consolidated_data['events'])}")
        
        return consolidated_data
        
    def save_consolidated_json(self, data: Dict, output_path: str):
        """Save consolidated data to JSON file"""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print(f"Consolidated data saved to: {output_path}")

if __name__ == "__main__":
    processor = DHSBatchProcessor()
    
    # Process all DHS IV&V reports
    consolidated_data = processor.process_all_reports()
    
    if consolidated_data:
        # Save to output file
        output_path = "parsed_jsons/dhs_ivv_complete_dataset.json"
        processor.save_consolidated_json(consolidated_data, output_path)
    else:
        print("No data to save")