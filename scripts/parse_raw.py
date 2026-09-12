import re
import json

def parse_raw():
    with open("scripts/seed_data/raw_table_text.txt", "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    questions = []
    current_q = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Match a new row starting
        match = re.match(r'^(\d{2})\s+([A-Z]+-\d{2})\s+([A-Za-z]+)\s+(.+)', line)
        if match:
            if current_q:
                questions.append(current_q)
                
            pos = int(match.group(1))
            item_id = match.group(2)
            construct = match.group(3)
            rest = match.group(4)
            
            current_q = {
                "pos": pos,
                "itemId": item_id,
                "construct": construct,
                "lines": [rest]
            }
        elif current_q:
            current_q["lines"].append(line)
            
    if current_q:
        questions.append(current_q)
        
    final_questions = []
    
    for q in questions:
        english_words = []
        telugu_words = []
        
        for line in q["lines"]:
            # Remove the "Positive ( )" and "Unscored Filter" strings
            line = line.replace("Positive (", "").replace(")", "").replace("Unscored", "").replace("Filter", "")
            
            # Split the line into English and Telugu based on character blocks
            # Words containing Telugu chars go to Telugu, others go to English
            words = line.split()
            for word in words:
                if re.search(r'[\u0C00-\u0C7F]', word):
                    telugu_words.append(word)
                else:
                    # check if it's just punctuation, if so, it might belong to either.
                    # but if it has letters it's english
                    if re.search(r'[a-zA-Z]', word):
                        english_words.append(word)
                    else:
                        # just punctuation or numbers. We'll append to both and clean up later, or just english
                        english_words.append(word)
                        telugu_words.append(word)
                        
        english_stem = " ".join(english_words).strip()
        telugu_stem = " ".join(telugu_words).strip()
        
        # Clean up punctuation spacing
        english_stem = re.sub(r'\s+([?,.!])', r'\1', english_stem)
        telugu_stem = re.sub(r'\s+([?,.!])', r'\1', telugu_stem)
        
        final_questions.append({
            "pos": q["pos"],
            "itemId": q["itemId"],
            "construct": q["construct"],
            "englishStem": english_stem,
            "teluguStem": telugu_stem,
            "type": "CONTEXT" if "CTX" in q["itemId"] else "SCORED"
        })
        
    with open("scripts/seed_data/questions_final.json", "w", encoding="utf-8") as f:
        json.dump(final_questions, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(final_questions)} questions.")

if __name__ == "__main__":
    parse_raw()
