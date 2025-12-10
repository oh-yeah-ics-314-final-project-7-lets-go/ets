"""
AI-powered PDF Parser using GPT-4 Vision
Extracts structured data from IV&V reports
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Optional
import openai
from dotenv import load_dotenv
from pdf_converter import PDFConverter
from enums import Role, Severity, Likelihood, Status, ProjectStatus, Month

# Load environment variables
load_dotenv()

class AIParser:
    def __init__(self):
        """Initialize AI Parser with OpenAI client"""
        self.client = openai.OpenAI(
            api_key=os.getenv('OPENAI_API_KEY')
        )
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4o')
        self.converter = PDFConverter()
    
    def create_extraction_prompt(self):
        """Create structured prompt for data extraction"""
        return """
You are analyzing an Independent Verification and Validation (IV&V) report for a Hawaii ETS project. 

Extract the following information and return ONLY a valid JSON object with this exact structure:

{
  "project": {
    "name": "string",
    "description": "string",
    "originalContractAward": 0.0,
    "status": "PENDING|DENIED|APPROVED"
  },
  "report": {
    "yearCreate": 2024,
    "monthCreate": "JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER",
    "paidUpToNow": 0.0,
    "progress": 0.0,
    "status": "PENDING|DENIED|APPROVED"
  },
  "issues": [
    {
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

IMPORTANT EXTRACTION RULES:
1. For financial amounts, extract numbers only (no $ signs or commas)
2. For progress percentages, use decimal format (0.75 for 75%)
3. For dates, use ISO format (YYYY-MM-DDTHH:mm:ssZ)
4. If information is not available, use null for optional fields or reasonable defaults
5. Extract ALL issues and events mentioned in the document
6. Be precise with enum values - use exact matches from the list above
7. Focus on factual data, ignore boilerplate text

Return ONLY the JSON object, no additional text or explanation.
"""
    
    def parse_pdf(self, pdf_path: str) -> Optional[Dict]:
        """
        Parse a single PDF and extract structured data
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Extracted data as dictionary or None if failed
        """
        print(f"Parsing PDF: {pdf_path}")
        
        # Convert PDF to images
        images = self.converter.pdf_to_images(pdf_path)
        
        if not images:
            print(f"Failed to convert PDF: {pdf_path}")
            return None
        
        print(f"Converted to {len(images)} images")
        
        # Prepare messages for OpenAI
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": self.create_extraction_prompt()
                    }
                ]
            }
        ]
        
        # Add images to the message
        for i, image in enumerate(images):
            image_base64 = self.converter.image_to_base64(image)
            messages[0]["content"].append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{image_base64}",
                    "detail": "high"
                }
            })
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=4000,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            
            try:
                start_idx = content.find('{')
                end_idx = content.rfind('}') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = content[start_idx:end_idx]
                    data = json.loads(json_str)
                    
                    return self.validate_extracted_data(data)
                else:
                    print("No valid JSON found in response")
                    return None
                    
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print(f"Response content: {content}")
                return None
                
        except Exception as e:
            print(f"API call failed: {e}")
            return None
    
    def validate_extracted_data(self, data: Dict) -> Dict:
        """
        Validate and clean extracted data
        
        Args:
            data: Raw extracted data
            
        Returns:
            Cleaned and validated data
        """
        # Ensure required structure exists
        validated = {
            "project": data.get("project", {}),
            "report": data.get("report", {}),
            "issues": data.get("issues", []),
            "events": data.get("events", [])
        }
        
        # Validate enums and fix common issues
        project = validated["project"]
        if "status" in project:
            project["status"] = self.validate_enum(project["status"], ProjectStatus)
        
        report = validated["report"]
        if "monthCreate" in report:
            month_str = report["monthCreate"]
            if isinstance(month_str, str):
                month_enum = Month.from_string(month_str)
                if month_enum:
                    report["monthCreate"] = month_enum.value
        
        if "status" in report:
            report["status"] = self.validate_enum(report["status"], ProjectStatus)
        
        # Validate issues
        for issue in validated["issues"]:
            if "severity" in issue:
                issue["severity"] = self.validate_enum(issue["severity"], Severity)
            if "likelihood" in issue:
                issue["likelihood"] = self.validate_enum(issue["likelihood"], Likelihood)
            if "status" in issue:
                issue["status"] = self.validate_enum(issue["status"], Status)
        
        return validated
    
    def validate_enum(self, value: str, enum_class) -> str:
        """Validate enum value and return valid value or default"""
        if not value:
            return None
            
        value_upper = value.upper()
        
        # Check if value is valid
        for enum_item in enum_class:
            if enum_item.value == value_upper:
                return value_upper
        
        # Return first enum value as default
        return list(enum_class)[0].value
    
    def save_results(self, data: Dict, output_path: str):
        """
        Save extracted data to JSON file
        
        Args:
            data: Extracted data
            output_path: Path to save JSON file
        """
        # Add metadata
        # data["_metadata"] = {
        #     "extracted_at": datetime.now().isoformat(),
        #     "parser_version": "1.0",
        #     "model_used": self.model
        # }
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Results saved to: {output_path}")

if __name__ == "__main__":
    parser = AIParser()
    download = "downloads/"
    pdf_name = "ATG CSEA IV&/ATG CSEA IV&V Report May 2025.pdf"
    pdf_path = download + pdf_name
    
    
    if os.path.exists(pdf_path):
        result = parser.parse_pdf(pdf_path)
        
        if result:
            output_path =  "parsed_jsons/" + pdf_name.replace('.pdf', '_extracted.json')
            parser.save_results(result, output_path)
        else:
            print("Failed to extract data")
    else:
        print(f"PDF not found: {pdf_path}")