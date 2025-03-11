import request from 'supertest';
import app from '../src/app';
import moment from 'moment-timezone';

describe('GET /months', () => {
  it('should return 400 if parameters are missing', async () => {
    const response = await request(app).get('/months');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'parameters Missing' });
  });

  it('should return 400 if longitude or latitude is NaN', async () => {
    const response = await request(app)
      .get('/months')
      .query({ lon: 'invalid', lat: 'invalid', from: '2023-01', to: '2023-12' });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'longitude or latitude isNaN' });
  });

  it('should return 400 if date format is invalid', async () => {
    const response = await request(app).get('/months').query({ lon: '10', lat: '20', from: 'invalid', to: 'invalid' });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'invalid date format' });
  });

  it('should return month starts for valid input', async () => {
    const response = await request(app).get('/months').query({ lon: '10', lat: '20', from: '2023-01', to: '2023-12' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('monthStarts');
    expect(response.body.monthStarts.length).toBeGreaterThan(0);

    response.body.monthStarts.forEach((date: string) => {
      expect(moment.utc(date).isValid()).toBeTruthy();
    });
  });
  it('should return month starts for valid input', async () => {
    const response = await request(app)
      .get('/months')
      .query({ lon: '-74.0060', lat: '40.7128', from: '2024-01', to: '2024-12' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('monthStarts');
    expect(response.body.monthStarts.length).toBeGreaterThan(0);
    const right = [
      '2024-01-01T05:00:00.000Z',
      '2024-02-01T05:00:00.000Z',
      '2024-03-01T05:00:00.000Z',
      '2024-04-01T04:00:00.000Z',
      '2024-05-01T04:00:00.000Z',
      '2024-06-01T04:00:00.000Z',
      '2024-07-01T04:00:00.000Z',
      '2024-08-01T04:00:00.000Z',
      '2024-09-01T04:00:00.000Z',
      '2024-10-01T04:00:00.000Z',
      '2024-11-01T04:00:00.000Z',
      '2024-12-01T05:00:00.000Z',
    ];
    response.body.monthStarts.forEach((item:string, index:number) => {
      expect(item === right[index]).toBeTruthy();
    });
  });
});
