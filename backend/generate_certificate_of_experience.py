from PIL import Image, ImageDraw, ImageFont
import sys
from datetime import datetime

def draw_centered_text(draw, text, position, font, fill, image_width, stroke_width, stroke_fill):
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    x = (image_width - text_width) / 2
    y = position[1]
    draw.text((x, y), text, font=font, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)

def draw_centered_multiline_text(draw, text, position, font, fill, image_width, spacing, stroke_width, stroke_fill):
    lines = text.split('\n')
    y = position[1]
    for line in lines:
        draw_centered_text(draw, line, (0, y), font, fill, image_width, stroke_width, stroke_fill)
        line_height = draw.textbbox((0, 0), line, font=font)[3] - draw.textbbox((0, 0), line, font=font)[1]
        y += line_height + spacing

def generate_certificate(name, date, internship_type, period, grade, gender, output_path):
    # Load the certificate template
    template_path = './certificates/template-experience-blank.jpg'
    template = Image.open(template_path)
    image_width, _ = template.size

    # Create a drawing context
    draw = ImageDraw.Draw(template)

    # Load the Quicksand font
    font_path = './Quicksand-Regular.ttf'  # Update this path to the correct font
    font_large = ImageFont.truetype(font_path, 110)
    font_small = ImageFont.truetype(font_path, 45)

    # Convert the date to the desired format
    formatted_date = datetime.strptime(date, "%Y-%m-%d").strftime("%B %d, %Y")

    # Define text positions
    name_position = (0, 540)
    content_position = (0, 700)

    draw_centered_text(draw, name, name_position, font_large, fill="red", image_width=image_width, stroke_width=3, stroke_fill="red")

    # Set gender-specific pronouns
    if gender.lower() == 'male':
        pronoun_subject = 'He'
        pronoun_possessive = 'His'
        pronoun_object = 'him'
    elif gender.lower() == 'female':
        pronoun_subject = 'She'
        pronoun_possessive = 'Her'
        pronoun_object = 'her'
    else:
        pronoun_subject = 'They'
        pronoun_possessive = 'Their'
        pronoun_object = 'them'

    content_text = f"""
for successful completion of Internship as a "{internship_type}" Intern at
Kshitiksha Foundation for the period of {period} ({formatted_date}).
{pronoun_possessive} Internship performance is graded as '{grade}'.

{pronoun_subject} is hard working, talented, easy to work with, and can meet deadlines. {pronoun_subject} is
amazing & recommend {pronoun_object} to everyone!
"""

    # Draw the content text
    draw_centered_multiline_text(draw, content_text.strip(), content_position, font_small, fill="black", image_width=image_width, spacing=22, stroke_width=1, stroke_fill="black")

    # Save the generated certificate
    template.save(output_path)

if __name__ == "__main__":
    name = sys.argv[1]
    date = sys.argv[2]
    internship_type = sys.argv[3]
    period = sys.argv[4]
    grade = sys.argv[5]
    gender = sys.argv[6]
    output_path = sys.argv[7]
    generate_certificate(name, date, internship_type, period, grade, gender, output_path)  

