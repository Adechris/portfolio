import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, 'public', 'assets');
const backupDir = path.join(__dirname, 'public', 'assets_backup');

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

async function optimizeImages() {
    try {
        const files = fs.readdirSync(assetsDir);

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (supportedExtensions.includes(ext)) {
                const filePath = path.join(assetsDir, file);
                const backupPath = path.join(backupDir, file);

                // Backup original
                if (!fs.existsSync(backupPath)) {
                    fs.copyFileSync(filePath, backupPath);
                }


                const metadata = await sharp(filePath).metadata();
                console.log(`Processing ${file}: Original size: ${fs.statSync(filePath).size} bytes, Width: ${metadata.width}`);

                let pipeline = sharp(filePath);

                if (metadata.width > 1920) {
                    pipeline = pipeline.resize(1920);
                }

                if (ext === '.jpg' || ext === '.jpeg') {
                    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
                } else if (ext === '.png') {
                    pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
                } else if (ext === '.webp') {
                    pipeline = pipeline.webp({ quality: 80 });
                }

                const buffer = await pipeline.toBuffer();
                fs.writeFileSync(filePath, buffer);

                console.log(`Processed ${file}: New size: ${buffer.length} bytes`);
            }
        }
        console.log('Image optimization complete!');
    } catch (error) {
        console.error('Error optimizing images:', error);
    }
}

optimizeImages();
