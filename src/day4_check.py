import os
from PIL import Image
import pytesseract
import re
from pymongo import MongoClient
import fitz  # PyMuPDF
from datetime import datetime
import glob

# -----------------------
# Settings
# -----------------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017")
db = client["medscan"]
collection = db["lab_reports"]

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# -----------------------
# OCR Helper
# -----------------------
def ocr_image(image_path):
    img = Image.open(image_path).convert("L")
    img = img.resize((img.width * 2, img.height * 2))
    text = pytesseract.image_to_string(img)
    return text

def parse_lab_values(text):
    pattern = r'([A-Za-z\s]+):\s*([\d.]+)\s*([a-zA-Z/%µ]+)?'
    matches = re.findall(pattern, text)
    lab_results = []
    for match in matches:
        lab_results.append({
            "test": match[0].strip(),
            "value": float(match[1]),
            "unit": match[2] if match[2] else ""
        })
    return lab_results

# -----------------------
# Test OCR on sample image
# -----------------------
sample_image = os.path.join(UPLOAD_FOLDER, "sample_report.png")
if os.path.exists(sample_image):
    print("Testing OCR on image...")
    text = ocr_image(sample_image)
    print("Extracted text:\n", text)
    lab_values = parse_lab_values(text)
    print("Parsed lab values:", lab_values)
else:
    print(f"Place a sample image at {sample_image} to test OCR.")

# -----------------------
# Test OCR on sample PDF
# -----------------------
sample_pdf = os.path.join(UPLOAD_FOLDER, "sample_report.pdf")
if os.path.exists(sample_pdf):
    print("\nTesting OCR on PDF...")
    doc = fitz.open(sample_pdf)
    os.makedirs("images_temp", exist_ok=True)
    all_text = ""
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=200)
        image_path = os.path.join("images_temp", f"page_{i+1}.png")
        pix.save(image_path)
        all_text += ocr_image(image_path) + "\n"
    lab_values_pdf = parse_lab_values(all_text)
    print("Parsed lab values from PDF:", lab_values_pdf)

    # Save to MongoDB
    report = {
        "patient_name": "TestPDF",
        "report_date": datetime.now(),
        "lab_values": lab_values_pdf,
        "source_file": "sample_report.pdf"
    }
    collection.insert_one(report)
    print("Saved PDF report to MongoDB.")

    # Cleanup
    for img_file in glob.glob("images_temp/*.png"):
        os.remove(img_file)
else:
    print(f"Place a sample PDF at {sample_pdf} to test PDF OCR.")

# -----------------------
# Verify MongoDB entries
# -----------------------
print("\nChecking MongoDB lab_reports collection...")
reports = list(collection.find({"patient_name": "TestPDF"}, {"_id": 0}))
if reports:
    print("Found reports:", reports)
else:
    print("No TestPDF reports found in MongoDB.")
