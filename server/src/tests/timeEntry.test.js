import supertest from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app';
import { setupTestData, clearTestData } from './setup';
import jwt from 'jsonwebtoken';

const request = supertest(app);
let testData;
let token;

beforeAll(async () => {
  testData = await setupTestData();
  token = jwt.sign({ id: testData.user.id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await clearTestData();
});

describe('Time Entry API', () => {
  it('should create a new time entry', async () => {
    const response = await request
      .post('/api/time-entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        taskId: testData.task.id,
        timeSpent: 120, // 2 hours in minutes
        description: 'Working on login implementation',
        date: new Date().toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.timeSpent).toBe(120);
  });

  it('should get user time entries', async () => {
    const response = await request
      .get('/api/time-entries')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should update a time entry', async () => {
    // First create a time entry
    const createResponse = await request
      .post('/api/time-entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        taskId: testData.task.id,
        timeSpent: 60,
        description: 'Initial work',
        date: new Date().toISOString(),
      });

    const updateResponse = await request
      .put(`/api/time-entries/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        timeSpent: 90,
        description: 'Updated work description',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.timeSpent).toBe(90);
    expect(updateResponse.body.description).toBe('Updated work description');
  });

  it('should delete a time entry', async () => {
    // First create a time entry
    const createResponse = await request
      .post('/api/time-entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        taskId: testData.task.id,
        timeSpent: 60,
        description: 'Work to be deleted',
        date: new Date().toISOString(),
      });

    const deleteResponse = await request
      .delete(`/api/time-entries/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(204);
  });
});