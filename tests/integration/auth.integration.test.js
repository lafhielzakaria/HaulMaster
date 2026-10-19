const express = require('express');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../../src/repositories/userRepository');

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('../../src/repositories/userRepository', () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  findByIdExcludePassword: jest.fn(),
  findWaitingList: jest.fn(),
  updateStatus: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/shared/auth', require('../../src/routes/shared/authRoutes'));

describe('Auth integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';

    jwt.sign.mockReturnValue('mock-token');
    bcrypt.hash.mockResolvedValue('hashed-password');
    bcrypt.compare.mockResolvedValue(true);
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { userId: 'user-1', email: 'driver@test.com', role: 'driver' });
    });
  });

  it('registers a new user successfully', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      _id: 'user-1',
      email: 'new-driver@test.com',
      status: 'waiting_list',
    });

    const response = await request(app)
      .post('/api/shared/auth/register')
      .send({ email: 'new-driver@test.com', password: 'pass123' });

    expect(response.status).toBe(201);
    expect(response.body.message).toMatch(/Registration successful/i);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'new-driver@test.com',
      password: 'hashed-password',
      role: 'driver',
      status: 'waiting_list',
    });
  });

  it('rejects duplicate registration', async () => {
    userRepository.findByEmail.mockResolvedValue({ email: 'duplicate@test.com' });

    const response = await request(app)
      .post('/api/shared/auth/register')
      .send({ email: 'duplicate@test.com', password: 'pass123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });

  it('logs in an active user successfully', async () => {
    userRepository.findByEmail.mockResolvedValue({
      _id: 'user-1',
      email: 'driver@test.com',
      password: 'hashed-password',
      role: 'driver',
      status: 'active',
    });

    const response = await request(app)
      .post('/api/shared/auth/login')
      .send({ email: 'driver@test.com', password: 'pass123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('mock-token');
    expect(response.body.user.email).toBe('driver@test.com');
    expect(jwt.sign).toHaveBeenCalled();
  });

  it('prevents login for pending users', async () => {
    userRepository.findByEmail.mockResolvedValue({
      _id: 'user-1',
      email: 'pending@test.com',
      password: 'hashed-password',
      role: 'driver',
      status: 'waiting_list',
    });

    const response = await request(app)
      .post('/api/shared/auth/login')
      .send({ email: 'pending@test.com', password: 'pass123' });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/pending admin approval/i);
  });

  it('prevents login for inactive users', async () => {
    userRepository.findByEmail.mockResolvedValue({
      _id: 'user-1',
      email: 'inactive@test.com',
      password: 'hashed-password',
      role: 'driver',
      status: 'inactive',
    });

    const response = await request(app)
      .post('/api/shared/auth/login')
      .send({ email: 'inactive@test.com', password: 'pass123' });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/deactivated/i);
  });

  it('returns the authenticated user profile', async () => {
    userRepository.findByIdExcludePassword.mockResolvedValue({
      _id: 'user-1',
      email: 'driver@test.com',
      role: 'driver',
      status: 'active',
    });

    const response = await request(app)
      .get('/api/shared/auth/profile')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('driver@test.com');
    expect(userRepository.findByIdExcludePassword).toHaveBeenCalledWith('user-1');
  });

  it('lists pending users for an admin', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { userId: 'admin-1', email: 'admin@test.com', role: 'admin' });
    });

    userRepository.findWaitingList.mockResolvedValue([
      { _id: 'u1', email: 'pending@test.com', status: 'waiting_list' },
    ]);

    const response = await request(app)
      .get('/api/shared/auth/waiting-list')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(userRepository.findWaitingList).toHaveBeenCalled();
  });
});
