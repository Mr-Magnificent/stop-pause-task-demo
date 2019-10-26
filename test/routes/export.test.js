/* eslint-disable no-undef */
const { populateUser, token } = require('../seed/seed');
const debug = require('debug')('test:export');
const request = require('supertest');
const app = require('../../server');

describe('Export Request', function () {
    describe('GET /api/create-export', function () {
        this.beforeEach(populateUser);

        this.beforeEach(async () => {
            await Task.deleteMany({});
        });

        it('should require valid start date', (done) => {
            request(app).get('/api/create-export?start=12-12-3234')
                .set('Cookie', [`token=${token()}`])
                .send()
                .expect(response => {
                    expect(response.status).to.equal(404);
                    expect(response.body).to.deep.equal({
                        message: 'start is not valid'
                    });
                })
                .end(done);
        });

        it('should create a task', (done) => {
            request(app).get('/api/create-export?start=2017-04-15')
                .set('Cookie', [`token=${token()}`])
                .send()
                .expect((err, res) => {
                    if (err)
                        debug(err.message);
                    expect(res.body).to.include({
                        message: 'Task Accepted'
                    });
                })
                .end(done);

        });
    });
});
