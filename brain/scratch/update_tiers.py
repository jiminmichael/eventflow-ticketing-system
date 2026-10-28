with open(r'c:\Users\YUWA\Documents\eventflow-ticketing-system\eventflow-ticketing-system\src\components\TicketTiers.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

target = '<img\r\n                className="pass-banner"\r\n                src={tierImages[tier.code] ?? "/images/background-image.png"}\r\n                alt={`${tier.name} ticket banner`}\r\n              />'

replacement = '<div className="pass-banner-container">\r\n                <img\r\n                  className="pass-banner"\r\n                  src={tierImages[tier.code] ?? "/images/background-image.png"}\r\n                  alt={`${tier.name} ticket banner`}\r\n                />\r\n              </div>'

if target in text:
    text = text.replace(target, replacement, 1)
    with open(r'c:\Users\YUWA\Documents\eventflow-ticketing-system\eventflow-ticketing-system\src\components\TicketTiers.tsx', 'wb') as f:
        f.write(text.encode('utf-8'))
    print('Updated TicketTiers.tsx successfully')
else:
    print('Target not found')

