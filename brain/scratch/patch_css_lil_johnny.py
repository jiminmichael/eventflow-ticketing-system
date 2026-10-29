with open('src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add local @font-face definition at the top of src/index.css as fallback
font_face = """/* Lil Johnny Font Definition */
@font-face {
  font-family: 'Lil Johnny';
  font-style: italic;
  font-weight: 400;
  src: url('/fonts/LilJohnny_PERSONAL_USE_ONLY.woff') format('woff');
  font-display: swap;
}
@font-face {
  font-family: 'Lil Johnny PERSONAL USE ONLY';
  font-style: italic;
  font-weight: 400;
  src: url('/fonts/LilJohnny_PERSONAL_USE_ONLY.woff') format('woff');
  font-display: swap;
}

"""

if "font-family: 'Lil Johnny'" not in css:
    css = font_face + css

old_span = """h1 span {
  display: block;
  font-size: 0.83em;
  font-style: italic;
  color: var(--brand-champagne);
  letter-spacing: -0.035em;
  margin-top: 14px;
}"""

new_span = """h1 span {
  display: block;
  font-family: 'Lil Johnny', 'Lil Johnny PERSONAL USE ONLY', cursive, sans-serif;
  font-size: 0.95em;
  font-style: normal;
  text-transform: none;
  color: var(--brand-champagne);
  letter-spacing: 0.01em;
  margin-top: 12px;
  line-height: 1.1;
}"""

old_span_crlf = old_span.replace('\n', '\r\n')
new_span_crlf = new_span.replace('\n', '\r\n')

if old_span_crlf in css:
    css = css.replace(old_span_crlf, new_span_crlf, 1)
    with open('src/index.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print('Updated h1 span styling to Lil Johnny with CRLF')
elif old_span in css:
    css = css.replace(old_span, new_span, 1)
    with open('src/index.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print('Updated h1 span styling to Lil Johnny with LF')
else:
    print('h1 span block not found')

