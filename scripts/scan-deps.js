const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});

const exts = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
const files = [];

function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if(st.isDirectory()){
      if(name === 'node_modules' || name === '.next' || name === 'dist' || name === 'out') continue;
      walk(p);
    } else if(exts.includes(path.extname(name))){
      files.push(p);
    }
  }
}

walk(root);

const importRe = /import\s+(?:[^'";]+from\s+)?['"]([^'"]+)['"];?|require\(\s*['"]([^'"]+)['"]\s*\)/g;
const used = new Set();

for(const f of files){
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while((m = importRe.exec(content)) !== null){
    const spec = m[1] || m[2];
    if(!spec) continue;
    if(spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('http') ) continue;
    const pkgName = spec.startsWith('@') ? spec.split('/').slice(0,2).join('/') : spec.split('/')[0];
    used.add(pkgName);
  }
}

const missing = [...used].filter(p => !Object.prototype.hasOwnProperty.call(deps, p));
const present = [...used].filter(p => Object.prototype.hasOwnProperty.call(deps, p));

console.log(JSON.stringify({used: [...used].sort(), present: present.sort(), missing: missing.sort()}, null, 2));
