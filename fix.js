const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/blogw/OneDrive/Desktop/RFC-Frontend/src/components/dashboard';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('export function ({ data = {} }: { data?: any })')) {
    const componentName = file.replace('.tsx', '');
    content = content.replace('export function ({ data = {} }: { data?: any })', `export function ${componentName}({ data = {} }: { data?: any })`);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed', file);
  }
}
