const bcrypt = require('bcryptjs');
const userRepository = require('../../src/repositories/userRepository');
const validate = require('../../src/validations/validate');
const authSchemas = require('../../src/validations/schemas/authSchemas');
const { authorize } = require('../../src/middlewares/roleMiddleware');
const authHandlers = require('../../src/controllers/shared/authHandlers');

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('../../src/repositories/userRepository', () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  findByIdExcludePassword: jest.fn(),
  findWaitingList: jest.fn(),
  updateStatus: jest.fn(),
}));

describe('Auth unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid registration payloads', () => {
    const req = { body: { email: 'not-an-email', password: '123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    validate(authSchemas.register)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('denies access when the user lacks required permissions', () => {
    const req = { user: { role: 'driver' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authorize('auth:getWaitingList')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('creates a user with a hashed password during registration', async () => {
    const req = { body: { email: 'new-user@test.com', password: 'pass123' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    bcrypt.hash.mockResolvedValue('hashed-password');
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      _id: 'user-1',
      email: 'new-user@test.com',
      status: 'waiting_list',
    });

    await authHandlers.register(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'new-user@test.com',
      password: 'hashed-password',
      role: 'driver',
      status: 'waiting_list',
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
