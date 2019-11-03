const supertest = require('supertest');
const app = require('../../server');
const request = supertest(app);
const expect = require('chai').expect;
const { populateUser, token } = require('../seed/seed');

describe('Team', function () {
    before(populateUser);
    let uuid;

    describe('GET /api/create-team', function () {
        it('should NOT create team since token missing', (done) => {

            request.get('/api/create-team')
                .send()
                .expect(response => {
                    expect(response.status).to.equal(401);
                    expect(response.body).to.deep.include({
                        message: 'Token not present'
                    });
                })
                .end(done);
        });
    });

    describe('GET /api/create-team', function () {
        it('should create a task', (done) => {

            request.get('/api/create-team')
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

    describe('GET /api/pause-team', function () {
        it('should pause the team creation', (done) => {

            request.get('/api/pause-team')
                .query({
                    uuid: uuid
                })
                .set('Cookie', [`token=${token()}`])
                .send()
                .expect(response => {
                    expect(response.status).to.equal(202);
                    expect(response.body).to.deep.include({
                        message: 'Team creation paused'
                    });
                })
                .end(done);
        });
    });

    describe('GET /api/restart-team', function () {
        it('should restart the task', (done) => {

            request.get('/api/restart-team')
                .query({
                    uuid: uuid
                })
                .set('Cookie', [`token=${token()}`])
                .send()
                .expect(response => {
                    expect(response.status).to.equal(202);
                    expect(response.body).to.deep.include({
                        message: 'Team creation restarted'
                    });
                })
                .end(done);
        });
    });   

    describe('GET /api/stop-team', function () {
        it('should stop the task', (done) => {

            request.get('/api/stop-team')
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
