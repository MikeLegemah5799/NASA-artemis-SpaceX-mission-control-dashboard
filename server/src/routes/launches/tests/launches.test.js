const request = require('supertest');
const app = require('../../../app');
const {
    mongoConnect,
    mongoDisconnect
} = require('mongo../../../services/mongo');
const { loadPlanetsData } = require('../../../models/planets.model');

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
        await loadPlanetsData();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    describe('Test GET /launches', () => {
        test('It should respond with 200 success code', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });

    describe('Test POST /launch', () => {
        const completeLaunchData = {
            mission: 'After Earth',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'February 14, 2028'
        };

        const launchDataWithoutDate = {
            mission: 'After Earth',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
        }

        const launchDataWithInvalidDate = {
            mission: 'After Earth',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'arggg!'
        };

        test('It should respond with 201 created code', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);

            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);

            expect(response.body).toMatchObject(launchDataWithoutDate);
        });

        test('It should catch missing required properties', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDataWithoutDate)
            .expect('Content-Type', /json/)
            .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Missing required launch property',
            });
        });

        test('It should catch invalid dates', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDataWithInvalidDate)
            .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Invalid launch date',
            });
        });
    });
});

