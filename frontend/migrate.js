import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import * as babel from '@babel/core';

const srcDir = path.resolve('c:/MediRoute/frontend');

const tsFiles = globSync('**/*.{ts,tsx}', { 
  cwd: srcDir, 
  ignore: ['node_modules/**', 'dist/**', 'dist-js/**', '.git/**'],
  absolute: true
});

for (const file of tsFiles) {
  if (file.includes('node_modules')) continue;
  
  const isTsx = file.endsWith('.tsx');
  const code = fs.readFileSync(file, 'utf-8');
  
  try {
    const result = babel.transformSync(code, {
      filename: file,
      presets: [
        ['@babel/preset-typescript']
      ],
      plugins: ['@babel/plugin-syntax-jsx'],
      retainLines: true,
      generatorOpts: {
        retainLines: true,
        jsescOption: {
          minimal: true
        }
      }
    });
    
    let newCode = result.code;
    
    // Replace explicit extensions in imports
    newCode = newCode.replace(/\.tsx/g, '.jsx').replace(/\.ts/g, '.js');
    
    const newExt = isTsx ? '.jsx' : '.js';
    const newFile = file.slice(0, -path.extname(file).length) + newExt;
    
    fs.writeFileSync(newFile, newCode, 'utf-8');
    fs.unlinkSync(file);
    console.log(`Converted ${file} to ${newFile}`);
  } catch (err) {
    console.error(`Error converting ${file}:`, err.message);
  }
}
