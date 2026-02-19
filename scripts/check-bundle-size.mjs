#!/usr/bin/env node
/**
 * Bundle Size Check Script
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

const DIST_DIR = 'dist/assets';
const MAX_INITIAL_KB = 150;
const MAX_CHUNK_KB = 30;

function checkBundleSize() {
  try {
    const files = readdirSync(DIST_DIR).filter(f => f.endsWith('.js'));
    
    let initialSize = 0;
    let hasError = false;
    
    console.log('📦 Bundle Analysis:\n');
    
    for (const file of files) {
      const fullPath = join(DIST_DIR, file);
      const raw = readFileSync(fullPath);
      const gzipped = gzipSync(raw);
      const sizeKB = Math.round(gzipped.length / 1024);
      
      const isInitial = file.startsWith('index-') || file.startsWith('react-vendor-');
      const icon = sizeKB > MAX_CHUNK_KB && !isInitial ? '❌' : '✅';
      
      console.log(`${icon} ${file}: ${sizeKB}KB gzipped`);
      
      if (isInitial) initialSize += sizeKB;
      
      if (sizeKB > MAX_CHUNK_KB && !isInitial) {
        console.error(`   ⚠️  Chunk exceeds ${MAX_CHUNK_KB}KB limit!`);
        hasError = true;
      }
    }
    
    console.log(`\n📊 Initial bundle: ${initialSize}KB / ${MAX_INITIAL_KB}KB limit`);
    
    if (initialSize > MAX_INITIAL_KB) {
      console.error(`❌ Initial bundle exceeds ${MAX_INITIAL_KB}KB limit!`);
      process.exit(1);
    }
    
    if (hasError) {
      console.error('❌ One or more chunks exceeded size limit.');
      process.exit(1);
    }
    
    console.log('✅ All bundle size checks passed.');
  } catch (error) {
    console.error('Error checking bundle size:', error.message);
    process.exit(1);
  }
}

checkBundleSize();
