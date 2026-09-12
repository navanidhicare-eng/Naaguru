import pdfplumber
import sys

def extract_text(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for i in range(48, 63):
            text += pdf.pages[i].extract_text() + "\n\n"
    return text

if __name__ == "__main__":
    text = extract_text(sys.argv[1])
    with open("scripts/seed_data/raw_table_text.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Done")
