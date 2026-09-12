import pdfplumber
import json
import sys

def extract_questions(pdf_path):
    questions = []
    
    with pdfplumber.open(pdf_path) as pdf:
        # Tables start on page 49 (index 48) and go up to 63 (index 62)
        for i in range(48, 63):
            page = pdf.pages[i]
            tables = page.extract_tables()
            
            for table in tables:
                for row in table:
                    if not row or not row[0]:
                        continue
                        
                    # Skip header row
                    if row[0].strip() == "Pos":
                        continue
                        
                    try:
                        pos = row[0].strip()
                        item_id = row[1].strip() if row[1] else ""
                        construct = row[2].strip() if row[2] else ""
                        english_q = row[3].strip() if row[3] else ""
                        telugu_q = row[4].strip() if row[4] else ""
                        scoring_dir = row[5].strip() if row[5] else ""
                        
                        if not pos.isdigit():
                            continue
                            
                        # Clean up text by removing newline characters within sentences
                        english_q = " ".join(english_q.split())
                        telugu_q = " ".join(telugu_q.split())
                        
                        questions.append({
                            "pos": int(pos),
                            "itemId": item_id,
                            "construct": construct,
                            "englishStem": english_q,
                            "teluguStem": telugu_q,
                            "type": "CONTEXT" if "CTX" in item_id else "SCORED"
                        })
                    except Exception as e:
                        print(f"Error parsing row: {row}. Error: {e}")
                        
    return questions

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    output_path = sys.argv[2]
    
    questions = extract_questions(pdf_path)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
        
    print(f"Extracted {len(questions)} questions to {output_path}")
