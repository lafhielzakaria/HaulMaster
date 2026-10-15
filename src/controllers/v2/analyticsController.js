const analyticsRepository = require('../../repositories/analyticsRepository');

async function ecoPerformanceHandler(req, res, next) {
    try {
        const data = await analyticsRepository.ecoPerformance();
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

async function tireHealthMatrixHandler(req, res, next) {
    try {
        const data = await analyticsRepository.tireHealthMatrix();
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

async function financialEsgHandler(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        const data = await analyticsRepository.financialEsg(
            startDate ? new Date(startDate) : null,
            endDate   ? new Date(endDate)   : null
        );
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

async function fleetUtilizationTrendsHandler(req, res, next) {
    try {
        const data = await analyticsRepository.fleetUtilizationTrends();
        res.json({ success: true, data });
    } catch (error) { next(error); }
}

module.exports = { ecoPerformanceHandler, tireHealthMatrixHandler, financialEsgHandler, fleetUtilizationTrendsHandler };
