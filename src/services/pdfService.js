const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateDriverTripsPdf(driver, trips, res) {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `trips_${driver._id}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../pdfs', fileName);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    doc.pipe(res);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    doc.fontSize(18).text('HaulMaster — Ordre de Mission', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Chauffeur : ${driver.email}`);
    doc.text(`Date de génération : ${new Date().toLocaleDateString('fr-FR')}`);
    doc.moveDown();

    if (trips.length === 0) {
        doc.text('Aucun trajet incomplet trouvé.');
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

    doc.end();
}

module.exports = { generateDriverTripsPdf };
