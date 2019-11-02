const supertest = require('supertest');
const app = require('../../server');
const request = supertest(app);
const expect = require('chai').expect;
const { populateUser, token } = require('../seed/seed');

describe('Export', function () {
    before(populateUser);
    let uuid;

    describe('GET /api/create-export', function () {
        it('should create a task', (done) => {

            request.get('/api/create-export')
                .query({
                    start: '2017-04-15'
                })
                .set('Cookie', [`token=${token()}`])
                .send()
                .expect(response => {
                    expect(response.status).to.equal(202);
                    expect(response.body).to.deep.include({
                        message: 'Task Accepted'
                    });
                    uuid = response.body.task.uuid;
                })
                .end(done);
        });
    });

    describe('GET /api/pause-export', function () {
        it('should pause the task', (done) => {

            request.get('/api/pause-export')
                .query({
                    uuid: uuid
                })
                .set('Cookie', [`token=${token()}`])
                .send()
                .expect(response => {
                    expect(response.status).to.equal(202);
                    expect(response.body).to.deep.include({
                        message: 'Export paused'
                    });
                })
                .end(done);
        });
    });

    describe('GET /api/stop-export', function () {
        it('should stop the task', (done) => {

            request.get('/api/stop-export')
                .query({
                    uuid: uuid
                })
                .set('Cookie', [`token=${token()}`])
                .send()
                .expect(response => {
                    expect(response.status).to.equal(202);
                    expect(response.body).to.deep.include({
                        message: 'Export stopped'
                    });
                })
                .end(done);
        });
    });
});
