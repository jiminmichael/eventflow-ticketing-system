with open(r'c:\Users\YUWA\Documents\eventflow-ticketing-system\eventflow-ticketing-system\src\index.css', 'rb') as f:
    css = f.read().decode('utf-8')

old_block = '''.pass-card.has-pass-banner {
  position: relative;
  overflow: hidden;
  padding-top: 178px;
}
.pass-banner {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 150px;
  object-fit: cover;
  object-position: center 55%;
  filter: brightness(0.78);
}'''

new_block = '''.pass-card.has-pass-banner {
  position: relative;
  overflow: hidden;
  padding-top: 24px;
}
.pass-banner-container {
  width: 100%;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pass-banner {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 6250 / 2022;
  object-fit: contain;
  filter: brightness(0.95);
  transition: transform 0.3s ease;
}
.pass-card:hover .pass-banner {
  transform: scale(1.02);
}'''

old_block_crlf = old_block.replace('\n', '\r\n')
new_block_crlf = new_block.replace('\n', '\r\n')

if old_block_crlf in css:
    css = css.replace(old_block_crlf, new_block_crlf, 1)
    with open(r'c:\Users\YUWA\Documents\eventflow-ticketing-system\eventflow-ticketing-system\src\index.css', 'wb') as f:
        f.write(css.encode('utf-8'))
    print('Updated src/index.css successfully with CRLF')
elif old_block in css:
    css = css.replace(old_block, new_block, 1)
    with open(r'c:\Users\YUWA\Documents\eventflow-ticketing-system\eventflow-ticketing-system\src\index.css', 'wb') as f:
        f.write(css.encode('utf-8'))
    print('Updated src/index.css successfully with LF')
else:
    print('Target CSS block not found')

