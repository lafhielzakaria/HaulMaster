const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');
const { minioClient, BUCKET, ensureBucket } = require('../config/minio');

function buildPdfContent(doc, driver, trips) {
    doc.fontSize(18).text('HaulMaster — Ordre de Mission', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Chauffeur : ${driver.email}`);
    doc.text(`Date de génération : ${new Date().toLocaleDateString('fr-FR')}`);
    doc.moveDown();
    if (trips.length === 0) {
        doc.moveDown(2);
        doc.fontSize(13).text('Aucune mission en cours', { align: 'center' });
        doc.moveDown();
        doc.fontSize(11).fillColor('gray').text(
            'Ce chauffeur ne dispose d’aucune mission active ou en attente au moment de la génération de ce document.',
            { align: 'center' }
        );
        doc.fillColor('black');
    } else {
        trips.forEach((trip, index) => {
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            doc.fontSize(13).text(`Trajet #${index + 1}`, { underline: true });
            doc.fontSize(11)
                .text(`Statut         : ${trip.status}`)
                .text(`Départ         : ${trip.departureSite}`)
                .text(`Arrivée        : ${trip.arrivalSite}`)
                .text(`Date prévue    : ${new Date(trip.plannedStart).toLocaleDateString('fr-FR')} → ${new Date(trip.plannedEnd).toLocaleDateString('fr-FR')}`)
                .text(`Camion         : ${trip.camion?.matricule || '-'} (${trip.camion?.marque || ''} ${trip.camion?.modele || ''})`)
                .text(`Remorque       : ${trip.remorque?.matricule || '-'}`);
            if (trip.startMileage) doc.text(`Km départ      : ${trip.startMileage}`);
            doc.moveDown();
        });
    }
}

function buildPdfBuffer(driver, trips) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffer = new PassThrough();
        const chunks = [];
        doc.pipe(buffer);
        buffer.on('data', (chunk) => chunks.push(chunk));
        buffer.on('end', () => resolve(Buffer.concat(chunks)));
        buffer.on('error', reject);
        buildPdfContent(doc, driver, trips);
        doc.end();
    });
}

async function removeIfExists(fileName) {
    try {
        await minioClient.statObject(BUCKET, fileName);
        await minioClient.removeObject(BUCKET, fileName);
    } catch {
        // file does not exist, nothing to remove
    }
}

async function generateDriverTripsPdf(driver, trips, res, save = 'local') {
    const fileName = trips.length ? `ordre-mission_${trips[0]._id}.pdf` : `ordre-mission_no-trips.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    if (save === 'minio') {
        await ensureBucket();
        await removeIfExists(fileName);

        const pdfBuffer = await buildPdfBuffer(driver, trips);
        const minioStream = new PassThrough();
        minioStream.end(pdfBuffer);
        minioClient.putObject(BUCKET, fileName, minioStream, pdfBuffer.length, (err) => {
            if (err) console.error('MinIO upload error:', err.message);
        });
        res.end(pdfBuffer);
    } else {
        const doc = new PDFDocument({ margin: 50 });
        const filePath = path.join(__dirname, '../../pdfs', fileName);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        doc.pipe(res);
        buildPdfContent(doc, driver, trips);
        doc.end();
    }
}

module.exports = { generateDriverTripsPdf };
