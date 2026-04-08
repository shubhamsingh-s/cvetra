import io
import pdfplumber
from docx import Document

def parse_pdf(file_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        return '\\n'.join(p.extract_text() or '' for p in pdf.pages)

def parse_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return '\\n'.join(p.text for p in doc.paragraphs)

def parse_resume(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split('.')[-1]
    if ext == 'pdf': return parse_pdf(file_bytes)
    if ext == 'docx': return parse_docx(file_bytes)
    raise ValueError('Unsupported file type')
