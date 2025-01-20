import { S3 } from '@aws-sdk/client-s3';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { Readable } from 'stream';

// Initialize S3 client
const s3 = new S3();

export const splitVideoHandler = async (event) => {
  const [record] = event.Records;
  console.log('Received event:', JSON.stringify(record, null, 2));

  const sourceBucket = record.s3.bucket.name;
  const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
  const outputFolder = `/tmp/Images`;
  const zipFilePath = `/tmp/images.zip`;

  try {
    // Ensure output folder exists
    fs.ensureDirSync(outputFolder);

    // Download the MP4 file from S3
    const videoPath = path.join('/tmp', path.basename(objectKey));
    console.log(`Downloading file: ${objectKey} from bucket: ${sourceBucket}`);
    await downloadFileFromS3(sourceBucket, objectKey, videoPath);

    // Get video information
    console.log('Analyzing video...');
    const videoInfo = await getVideoInfo(videoPath);
    const duration = videoInfo.duration;
    const interval = 20; // Seconds

    // Process video to capture frames
    for (let currentTime = 0; currentTime < duration; currentTime += interval) {
      console.log(`Processing frame at: ${currentTime} seconds`);

      const outputFileName = `frame_at_${currentTime}.jpg`;
      const outputFilePath = path.join(outputFolder, outputFileName);

      await captureFrame(videoPath, outputFilePath, currentTime);
    }

    // Create ZIP file
    console.log('Creating ZIP file...');
    const zip = new AdmZip();
    zip.addLocalFolder(outputFolder);
    zip.writeZip(zipFilePath);

    // Upload ZIP file to S3
    const zipKey = `processed/${path.basename(objectKey, path.extname(objectKey))}.zip`;
    console.log(`Uploading ZIP file to bucket: ${sourceBucket}, key: ${zipKey}`);
    await uploadFileToS3(sourceBucket, zipKey, zipFilePath);

    console.log('Processing completed successfully.');
  } catch (error) {
    console.error('Error during processing:', error);
    throw error;
  }
};

// Download file from S3
async function downloadFileFromS3(bucket: string, key: string, filePath: string): Promise<void> {
  const { Body } = await s3.getObject({ Bucket: bucket, Key: key });
  const readableStream = Body as Readable;
  await new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    readableStream.pipe(writeStream);
    readableStream.on('error', reject);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

// Upload file to S3
async function uploadFileToS3(bucket: string, key: string, filePath: string): Promise<void> {
  const fileStream = fs.createReadStream(filePath);
  await s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: fileStream,
  });
}

// Capture a frame from the video
async function captureFrame(videoPath: string, outputPath: string, timeInSeconds: number): Promise<void> {
  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timeInSeconds],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '1920x1080',
      })
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err));
  });
}

// Get video duration using ffmpeg
async function getVideoInfo(videoPath: string): Promise<{ duration: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath).ffprobe((err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve({ duration: metadata.format.duration ?? 0 });
      }
    });
  });
}
