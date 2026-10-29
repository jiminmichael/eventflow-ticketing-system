with open('server/db.ts', 'r', encoding='utf-8') as f:
    code = f.read()

target = '  getOrderByReference(reference: string): Order | undefined {'
method = '''  getOrders(): Order[] {
    return [...this.data.orders];
  }

  getOrderByReference(reference: string): Order | undefined {'''

if target in code:
    code = code.replace(target, method, 1)
    with open('server/db.ts', 'w', encoding='utf-8') as f:
        f.write(code)
    print('Added getOrders() to DatabaseService in server/db.ts')
else:
    print('Target not found in server/db.ts')

