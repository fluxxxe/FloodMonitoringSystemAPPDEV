from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(80)
        self.cell(30, 10, 'AppDev: DRF Backend Submission', border=0, align='C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

pdf = PDF()
pdf.add_page()
pdf.set_font("helvetica", "B", 12)
pdf.cell(0, 10, "1. Backend Repository URL (Branch: submission-final)", ln=True)
pdf.set_font("helvetica", "", 10)
pdf.cell(0, 10, "https://github.com/rodriguezkylejohndel1564-coder/backend---DRF/tree/submission-final", ln=True)
pdf.ln(10)

pdf.set_font("helvetica", "B", 12)
pdf.cell(0, 10, "2. Sample API Request/Response (HTTPie Results)", ln=True)
pdf.set_font("courier", "", 9)
results = """
# Getting Water Level Data
HTTP/1.1 200 OK
[
  {
    "id": 1,
    "locationName": "Cagayan De Oro River",
    "currentLevel": "8.00",
    "maxLevel": "10.00",
    "status": "Danger",
    "trend": "Rising",
    "lastUpdated": "2026-04-13T01:59:13Z"
  },
  {
    "id": 2,
    "locationName": "Bigaan River",
    "currentLevel": "4.10",
    "maxLevel": "8.00",
    "status": "Normal",
    "trend": "Steady",
    "lastUpdated": "2026-04-13T01:59:13Z"
  }
]

# Registering a New User
HTTP/1.1 200 OK
{
    "token": "e6b81a2ce27dc5b4931a67926139486c9d...",
    "user": {
        "email": "tester@example.com",
        "id": 16,
        "username": "tester_appdev"
    }
}
"""
pdf.multi_cell(0, 5, results)
pdf.ln(10)

pdf.set_font("helvetica", "B", 12)
pdf.cell(0, 10, "3. API Implementation Screenshots", ln=True)

# Image 1
img1 = r"C:\Users\Lorebina\.gemini\antigravity\brain\5cad725d-9ef3-4acb-a49a-5515d0d51c82\django_browsable_api_root_1776017712008.png"
if os.path.exists(img1):
    pdf.image(img1, x=10, w=190)
    pdf.ln(5)

pdf.add_page()
pdf.set_font("helvetica", "B", 12)
pdf.cell(0, 10, "4. Real-time Monitoring Data Output", ln=True)
# Image 2
img2 = r"C:\Users\Lorebina\.gemini\antigravity\brain\5cad725d-9ef3-4acb-a49a-5515d0d51c82\django_api_water_levels_1776017728091.png"
if os.path.exists(img2):
    pdf.image(img2, x=10, w=190)
    pdf.ln(5)

pdf.output("FloodMonitoring_Backend_Submission.pdf")
print("PDF generated successfully: FloodMonitoring_Backend_Submission.pdf")
