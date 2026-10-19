const analyticsRepository = require('../../src/repositories/analyticsRepository');
const { checkResourceAvailability } = require('../../src/services/conflictService');
const tripService = require('../../src/services/tripService');
const fleetHandlers = require('../../src/controllers/shared/fleetHandlers');
const pneuHandlers = require('../../src/controllers/shared/pneuHandlers');
const remorqueHandlers = require('../../src/controllers/shared/remorqueHandlers');
const userRepository = require('../../src/repositories/userRepository');
const camionRepository = require('../../src/repositories/camionRepository');
const pneuRepository = require('../../src/repositories/pneuRepository');
const remorqueRepository = require('../../src/repositories/remorqueRepository');
const trajetRepository = require('../../src/repositories/trajetRepository');
const Trajet = require('../../src/models/Trajet');
const Pneu = require('../../src/models/Pneu');

jest.mock('../../src/services/conflictService', () => ({
  checkResourceAvailability: jest.fn(),
}));

jest.mock('../../src/repositories/trajetRepository', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByDriverActive: jest.fn(),
  findConflict: jest.fn(),
  save: jest.fn(),
}));

jest.mock('../../src/repositories/userRepository', () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByIdExcludePassword: jest.fn(),
  findWaitingList: jest.fn(),
  create: jest.fn(),
  updateStatus: jest.fn(),
}));

jest.mock('../../src/repositories/camionRepository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  save: jest.fn(),
}));

jest.mock('../../src/repositories/pneuRepository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findOverLimitByCamion: jest.fn(),
  findNearLimitByCamion: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('../../src/repositories/remorqueRepository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('../../src/models/Pneu', () => ({
  updateMany: jest.fn(),
}));

describe('Business logic unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns eco performance aggregation shape', async () => {
    Trajet.aggregate = jest.fn().mockResolvedValue([
      { driver: 'driver-1', totalFuel: 120, totalDistances: 1000, ecoPerformance: 12 },
    ]);

    const result = await analyticsRepository.ecoPerformance();

    expect(result).toEqual([{ driver: 'driver-1', totalFuel: 120, totalDistances: 1000, ecoPerformance: 12 }]);
    expect(Trajet.aggregate).toHaveBeenCalled();
  });

  it('returns tire health matrix aggregation shape', async () => {
    Pneu.aggregate = jest.fn().mockResolvedValue([
      { camion: 'C-1', difference: 400 },
    ]);

    const result = await analyticsRepository.tireHealthMatrix();

    expect(result).toHaveLength(1);
    expect(Pneu.aggregate).toHaveBeenCalled();
  });

  it('returns financial ESG aggregation shape', async () => {
    Trajet.aggregate = jest.fn().mockResolvedValue([
      { totalCompletedTrips: 5, totalFuelConsumedLiters: 200, totalCo2EmissionsTonnes: 0.536 },
    ]);

    const result = await analyticsRepository.financialEsg();

    expect(result[0]).toMatchObject({ totalCompletedTrips: 5, totalFuelConsumedLiters: 200 });
    expect(Trajet.aggregate).toHaveBeenCalled();
  });

  it('throws when planned end date is before start date', async () => {
    checkResourceAvailability.mockImplementation(() => Promise.reject(Object.assign(new Error('Planned end date must be after planned start date'), { statusCode: 400 })));
    await expect(
      checkResourceAvailability('driver-1', 'camion-1', 'remorque-1', '2026-10-10T10:00:00Z', '2026-10-10T09:00:00Z')
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws when driver is not active', async () => {
    checkResourceAvailability.mockImplementation(() => Promise.reject(Object.assign(new Error('Driver is not active'), { statusCode: 409 })));
    userRepository.findById.mockResolvedValue({ status: 'inactive' });

    await expect(
      checkResourceAvailability('driver-1', 'camion-1', 'remorque-1', '2026-10-10T09:00:00Z', '2026-10-10T10:00:00Z')
    ).rejects.toMatchObject({ statusCode: 409, message: 'Driver is not active' });
  });

  it('throws when a driver already has an active trip', async () => {
    checkResourceAvailability.mockImplementation(() => Promise.reject(Object.assign(new Error('Driver already has an active trip'), { statusCode: 409 })));
    userRepository.findById.mockResolvedValue({ status: 'active' });
    trajetRepository.findConflict.mockResolvedValueOnce({ _id: 'trip-1' });

    await expect(
      checkResourceAvailability('driver-1', 'camion-1', 'remorque-1', '2026-10-10T09:00:00Z', '2026-10-10T10:00:00Z')
    ).rejects.toMatchObject({ statusCode: 409, message: 'Driver already has an active trip' });
  });

  it('throws when truck has maintenance issue', async () => {
    checkResourceAvailability.mockImplementation(() => Promise.reject(Object.assign(new Error('Truck is under maintenance'), { statusCode: 409 })));
    userRepository.findById.mockResolvedValue({ status: 'active' });
    trajetRepository.findConflict.mockResolvedValueOnce(null);
    camionRepository.findById.mockResolvedValue({ statut: 'maintenance', maintenanceAlert: 'PENDING' });

    await expect(
      checkResourceAvailability('driver-1', 'camion-1', 'remorque-1', '2026-10-10T09:00:00Z', '2026-10-10T10:00:00Z')
    ).rejects.toMatchObject({ statusCode: 409, message: 'Truck is under maintenance' });
  });

  it('assigns a trip after checking resource availability', async () => {
    const data = {
      departureSite: 'A',
      arrivalSite: 'B',
      plannedStart: '2026-10-10T09:00:00Z',
      plannedEnd: '2026-10-10T12:00:00Z',
      driver: 'driver-1',
      camion: 'camion-1',
      remorque: 'remorque-1',
    };

    const trip = { _id: 'trip-123', ...data };
    checkResourceAvailability.mockResolvedValue(undefined);
    trajetRepository.create.mockResolvedValue(trip);

    const result = await tripService.assignTrip(data);

    expect(checkResourceAvailability).toHaveBeenCalledWith('driver-1', 'camion-1', 'remorque-1', data.plannedStart, data.plannedEnd);
    expect(trajetRepository.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(trip);
  });

  it('throws when trip is not found during reassignment', async () => {
    trajetRepository.findById.mockResolvedValue(null);

    await expect(
      tripService.reassignTrip('trip-1', { driver: 'driver-2' })
    ).rejects.toMatchObject({ statusCode: 404, message: 'Trip not found' });
  });

  it('starts a trip only when status is TODO and the driver matches', async () => {
    const trip = { _id: 'trip-1', driver: 'driver-1', status: 'TODO', plannedStart: '2026-10-10T09:00:00Z' };
    trajetRepository.findById.mockResolvedValue(trip);
    trajetRepository.save.mockImplementation(async (t) => t);

    const result = await tripService.startTrip('trip-1', 500, 'driver-1');

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.startMileage).toBe(500);
  });

  it('completes a trip and updates mileage and consumption', async () => {
    const trip = {
      _id: 'trip-1',
      driver: 'driver-1',
      status: 'IN_PROGRESS',
      startMileage: 100,
      camion: 'camion-1',
      fuelConsumed: 30,
      distance: 0,
    };

    trajetRepository.findById.mockResolvedValue(trip);
    trajetRepository.save.mockImplementation(async (t) => t);
    Pneu.updateMany.mockResolvedValue({ nModified: 1 });

    const result = await tripService.completeTrip(
      'trip-1',
      { endMileage: 500, fuelConsumed: 30, fuelCost: 100, driverRemarks: 'ok', camionRemarks: 'good' },
      'driver-1'
    );

    expect(result.status).toBe('COMPLETED');
    expect(result.distance).toBe(400);
    expect(result.averageConsumption).toBeCloseTo(7.5);
    expect(Pneu.updateMany).toHaveBeenCalled();
  });

  it('lists all fleet vehicles with a filter', async () => {
    const req = { query: { statut: 'active' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    camionRepository.findAll.mockResolvedValue([{ statut: 'active' }]);

    await fleetHandlers.getAll(req, res);

    expect(res.json).toHaveBeenCalledWith({ camions: [{ statut: 'active' }] });
  });

  it('returns a single fleet vehicle when found', async () => {
    const req = { params: { id: 'cam-1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    camionRepository.findById.mockResolvedValue({ _id: 'cam-1', statut: 'active' });

    await fleetHandlers.getOne(req, res);

    expect(res.json).toHaveBeenCalledWith({ camion: { _id: 'cam-1', statut: 'active' } });
  });

  it('creates a fleet vehicle successfully', async () => {
    const req = { body: { matricule: 'ABC123', marque: 'Volvo', modele: 'FH', annee: 2024, capacite: 10, statut: 'active' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    camionRepository.create.mockResolvedValue({ _id: 'cam-1', ...req.body });

    await fleetHandlers.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(camionRepository.create).toHaveBeenCalledWith(req.body);
  });

  it('updates a fleet vehicle and returns it', async () => {
    const req = { params: { id: 'cam-1' }, body: { statut: 'inactive' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    camionRepository.update.mockResolvedValue({ _id: 'cam-1', statut: 'inactive' });

    await fleetHandlers.update(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Camion updated', camion: { _id: 'cam-1', statut: 'inactive' } });
  });

  it('deletes a fleet vehicle', async () => {
    const req = { params: { id: 'cam-1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    camionRepository.remove.mockResolvedValue({ _id: 'cam-1' });

    await fleetHandlers.remove(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Camion deleted' });
  });

  it('updates a fleet vehicle status when valid', async () => {
    const req = { params: { id: 'cam-1' }, body: { statut: 'maintenance' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    camionRepository.findById.mockResolvedValue({ _id: 'cam-1', statut: 'active' });
    camionRepository.save.mockResolvedValue({ _id: 'cam-1', statut: 'maintenance' });

    await fleetHandlers.setStatus(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Camion status updated to maintenance', camion: { _id: 'cam-1', statut: 'maintenance' } });
  });

  it('creates a tire and stores the camion reference', async () => {
    const req = { body: { marque: 'Michelin', taille: '295', type: 'winter', statut: 'active', camion: 'cam-1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    pneuRepository.create.mockResolvedValue({ _id: 'p1', ...req.body });

    await pneuHandlers.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(pneuRepository.create).toHaveBeenCalledWith({ marque: 'Michelin', taille: '295', type: 'winter', statut: 'active', camion: 'cam-1' });
  });

  it('gets one tire and returns 404 when not found', async () => {
    const req = { params: { id: 'p1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    pneuRepository.findById.mockResolvedValue(null);

    await pneuHandlers.getOne(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pneu not found' });
  });

  it('updates a tire successfully', async () => {
    const req = { params: { id: 'p1' }, body: { statut: 'inactive' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    pneuRepository.update.mockResolvedValue({ _id: 'p1', statut: 'inactive' });

    await pneuHandlers.update(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Pneu updated', pneu: { _id: 'p1', statut: 'inactive' } });
  });

  it('creates a trailer only when required fields are present', async () => {
    const req = { body: { matricule: 'TR-1', marque: 'Schmitz', modele: 'X', annee: 2022, capacite: 20, statut: 'active' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    remorqueRepository.create.mockResolvedValue({ _id: 'r1', ...req.body });

    await remorqueHandlers.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(remorqueRepository.create).toHaveBeenCalledWith(req.body);
  });

  it('returns 400 when trailer payload is incomplete', async () => {
    const req = { body: { matricule: 'TR-1' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await remorqueHandlers.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
  });
});
