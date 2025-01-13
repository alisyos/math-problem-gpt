const fs = require('fs-extra');
const path = require('path');

async function build() {
    try {
        // public 폴더 생성 (이미 존재하면 삭제 후 재생성)
        await fs.remove('public');
        await fs.ensureDir('public');

        // src의 파일들을 public으로 복사
        await fs.copy('src', 'public');

        console.log('Build completed successfully!');
        console.log('Files in public directory:', await fs.readdir('public'));
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build(); 