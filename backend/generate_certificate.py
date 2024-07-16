from PIL import Image, ImageDraw, ImageFont
import sys
from datetime import datetime

def draw_spaced_text(draw, position, text, font, fill, letter_spacing=2):
    x, y = position
    for char in text:
        draw.text((x, y), char, font=font, fill=fill, stroke_width=1, stroke_fill="black")
        # Calculate the width of the character using getbbox
        char_width = font.getbbox(char)[2] - font.getbbox(char)[0]
        x += char_width + letter_spacing

def generate_certificate(name, date, gender, output_path):
    # Load the certificate template
    template_path = './certificates/template1-blank.jpg'
    template = Image.open(template_path)

    # Create a drawing context
    draw = ImageDraw.Draw(template)

    # Load the Quicksand font
    font_path = './Quicksand-Regular.ttf'  # Update this path to the Quicksand font file
    font_large = ImageFont.truetype(font_path, 60)  # Increased font size
    font_medium = ImageFont.truetype(font_path, 30)  # Increased font size
    font_small = ImageFont.truetype(font_path, 28)  # Increased font size

    # Convert the date to the desired format
    formatted_date = datetime.strptime(date, "%Y-%m-%d").strftime("%B %d, %Y")

    # Define text positions
    date_position = (164, 630)
    name_position = (164, 690)
    content_position = (164, 720)   

    # Draw the date with letter spacing
    draw_spaced_text(draw, date_position, formatted_date, font_medium, fill="black", letter_spacing=2)

    # Draw the name with letter spacing
    draw_spaced_text(draw, name_position, name, font_medium, fill="black", letter_spacing=2)

    # Define the content text
    content_text = f"""
This is to certify that "{name}" interned at KSHITIKSHA FOUNDATION which works
for welfare of Humanity, Environment, Education Empowerment, Women Safety &
Empowerment, Animal Aid, Mental Illness and Suicidal Prevention.

As an intern {gender} has prepared {gender.lower()+'self'} for the service of God, country and his
Fellow-beings. The serendipity of being an intern is a milestone in his joyous pursuit in the
service of mankind.

I recommend {gender.lower()} at your esteemed organization. {gender.capitalize()} is a team player and
would make a great asset to any organization as well as institute.

We wish {gender.lower()} all the best for his future endeavours.
"""

    # Draw the content text
    draw.multiline_text(content_position, content_text, font=font_small, fill="black", spacing=14, stroke_width=1, stroke_fill="gray")

    # Save the generated certificate
    template.save(output_path)

if __name__ == "__main__":
    name = sys.argv[1]
    date = sys.argv[2]
    gender = sys.argv[3]
    output_path = sys.argv[4]
    generate_certificate(name, date, gender, output_path)

    
