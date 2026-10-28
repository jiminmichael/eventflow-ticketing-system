import os, re
p = r'c:\Users\YUWA\Documents\eventflow-ticketing-system\eventflow-ticketing-system\server.ts'
if os.path.exists(p):
    with open(p, 'rb') as f:
        c = f.read().decode('utf-8')
    c2 = c.replace("limit: '1mb'", "limit: '10mb'")
    with open(p, 'wb') as f:
        f.write(c2.encode('utf-8'))
    print('server.ts updated' if c2 != c else 'server.ts: no change needed')
else:
    print('server.ts not found, skipping')

