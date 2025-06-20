from fpdf import FPDF

def text_to_pdf(text, output_path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    paragraphs = text.split('\n\n')
    for paragraph in paragraphs:
        lines = paragraph.split('\n')
        for line in lines:
            pdf.cell(200, 10, txt=line, ln=True, align='L')
        pdf.ln(10)  # Add a line break between paragraphs
    
    pdf.output(output_path)

# Example usage
text_content = "Your text here"
text_to_pdf(text_content, "output.pdf")
