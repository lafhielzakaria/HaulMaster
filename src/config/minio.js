const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD,
});

const BUCKET = process.env.MINIO_BUCKET;

async function ensureBucket() {
    const exists = await minioClient.bucketExists(BUCKET);
    if (!exists) await minioClient.makeBucket(BUCKET);
}

module.exports = { minioClient, BUCKET, ensureBucket };
