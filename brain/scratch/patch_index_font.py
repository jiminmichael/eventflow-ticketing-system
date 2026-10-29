with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
font_link = '''<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.cdnfonts.com/css/lil-johnny-personal-use-only" rel="stylesheet">'''

if 'lil-johnny-personal-use-only' not in html:
    html = html.replace(target, font_link, 1)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('index.html updated with cdnfonts link')
else:
    print('cdnfonts link already present in index.html')

