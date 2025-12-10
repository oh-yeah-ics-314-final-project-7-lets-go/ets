"""
Add titles to existing issues in the dataset
"""

import json
import os
from typing import Dict, List
from ai_parser import AIParser

class IssueTitleGenerator:
    def __init__(self):
        """Initialize title generator"""
        self.parser = AIParser()
    
    def generate_title(self, description: str, remedy: str) -> str:
        """Generate a concise title for an issue"""
        title_prompt = f"""
Given this issue description and remedy, create a concise title (3-6 words) that captures the main concern:

Description: {description}
Remedy: {remedy}

Return ONLY the title text, no additional formatting or explanation.
Examples:
- "Schedule Management Practices"
- "Data Extraction Costs"
- "Interface Coordination Risk"
- "Testing Methodology Alignment"
"""
        
        try:
            response = self.parser.client.chat.completions.create(
                model=self.parser.model,
                messages=[
                    {
                        "role": "user",
                        "content": title_prompt
                    }
                ],
                max_tokens=20,
                temperature=0.1
            )
            
            title = response.choices[0].message.content.strip()
            # Clean up the title (remove quotes, extra formatting)
            title = title.replace('"', '').replace("'", '').strip()
            
            return title
            
        except Exception as e:
            print(f"Error generating title: {e}")
            # Fallback: use first few words of description
            words = description.split()[:4]
            return ' '.join(words)
    
    def add_titles_to_dataset(self, input_path: str, output_path: str):
        """Add titles to all issues in the dataset"""
        print(f"Loading dataset from: {input_path}")
        
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        issues = data.get('issues', [])
        print(f"Found {len(issues)} issues to process")
        
        # Process each issue to add title
        for i, issue in enumerate(issues):
            if 'title' not in issue or not issue.get('title'):
                print(f"Generating title for issue {i+1}/{len(issues)}")
                
                description = issue.get('description', '')
                remedy = issue.get('remedy', '')
                
                title = self.generate_title(description, remedy)
                issue['title'] = title
                
                print(f"  Title: {title}")
        
        # Save updated dataset
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Updated dataset saved to: {output_path}")

if __name__ == "__main__":
    generator = IssueTitleGenerator()
    
    input_file = "parsed_jsons/atg_csea_complete_dataset.json"
    output_file = "parsed_jsons/atg_csea_complete_dataset.json"  # Overwrite the same file
    
    if os.path.exists(input_file):
        generator.add_titles_to_dataset(input_file, output_file)
    else:
        print(f"Input file not found: {input_file}")