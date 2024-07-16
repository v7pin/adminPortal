from PIL import Image, ImageDraw, ImageFont
import sys
from datetime import datetime

def draw_centered_text(draw, text, position, font, fill, image_width, stroke_width=0, stroke_fill="black"):
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    x = (image_width - text_width) / 2
    y = position[1]
    draw.text((x, y), text, font=font, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)

def draw_centered_multiline_text(draw, text, position, font, fill, image_width, spacing=10, stroke_width=0, stroke_fill="black", padding=100):
    lines = text.split('\n')
    y = position[1]
    for line in lines:
        text_bbox = draw.textbbox((0, 0), line, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        x = (image_width - text_width) / 2  # Centering the text
        draw.text((x, y), line, font=font, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)
        line_height = text_bbox[3] - text_bbox[1]
        y += line_height + spacing

def generate_certificate(name, date, gender, output_path):
    # Load the certificate template
    template_path = './certificates/template-appreciation-blank.jpg'  # Path to the uploaded template
    template = Image.open(template_path)
    image_width, _ = template.size

    # Create a drawing context
    draw = ImageDraw.Draw(template)

    # Load the fonts
    font_path_regular = './PTSerif-Regular.ttf'  # Path to the regular font
    font_path_cursive = './PinyonScript-Regular.ttf'  # Path to the cursive font
    font_large = ImageFont.truetype(font_path_cursive, 130)
    font_small = ImageFont.truetype(font_path_regular, 35)
    font_date = ImageFont.truetype(font_path_regular, 35)

    # Convert the date to the desired format
    formatted_date = datetime.strptime(date, "%Y-%m-%d").strftime("%B %d, %Y")

    # Determine the pronoun based on gender
    pronoun = "his" if gender.lower() == "male" else "her"

    # Define text positions
    name_position = (0, 650)  # Adjust the y-coordinate as needed
    content_position = (0, 810)  # Adjust the y-coordinate as needed
    date_position = (0, 960)  # Adjust the y-coordinate as needed

    # Draw the name text
    draw_centered_text(draw, name, name_position, font_large, fill="black", image_width=image_width)

    # Draw the content text
    content_text = f"for outstanding results and conduct in {pronoun} professional field. \nIt serves as proof of {pronoun} competence and excellent application of industry standards and methods."
    draw_centered_multiline_text(draw, content_text, content_position, font_small, fill="black", image_width=image_width, spacing=20, padding=160)

    # Draw the date text
    awarded_date_text = f"This certificate was awarded on {formatted_date}."
    draw_centered_text(draw, awarded_date_text, date_position, font_date, fill="black", image_width=image_width)

    # Save the generated certificate
    template.save(output_path)

# Example usage
if __name__ == "__main__":
    name = sys.argv[1]
    date = sys.argv[2]
    gender = sys.argv[3]
    output_path = sys.argv[4]
    generate_certificate(name, date, gender, output_path)
