/* eslint-disable no-undef */
const debug = require('debug')('test:login');

describe('Login', function () {
    describe('POST /api/register', function () {
        before(async function ClearDB() {
            await User.deleteMany({});
        });

        it('creates a user', function (done) {
            request.post('/api/register')
                .send({
                    username: 'ayushpoddar',
                    password: 'ap123'
                })
                .expect(200)
                .end(function hello() {
                    User.findOne({
                        username: 'ayushpoddar'
                    }, function (err, data) {
                        if (err)
                            done(err);
                        expect(data.username).to.equal('ayushpoddar');
                        done();
                    });
                });
        });

        it('fails to create another user with same username', function (done) {
            request.post('/api/register')
                .send({
                    username: 'ayushpoddar',
                    password: 'newpwd'
                })
                .expect(response => {
                    expect(response.status).to.equal(400);
                    expect(response.body).to.deep.equal({
                        message: 'User already registered'
                    });
                })
                .end(done);
        });
    });

    describe('POST /api/login', function () {
        after(async () => {
            await User.deleteMany({});
        });

        it('should not login password mismatch', function (done) {
            request.post('/api/login')
                .send({
                    username: 'ayushpoddar',
                    password: 'pwd'
                })
                .expect(response => {
                    expect(response.status).to.equal(401);
                    expect(response.body).to.deep.equal({
                        message: 'password mismatch'
                    });
                })
                .end(done);
        });

        it('should not login user doesn\'t exist', function (done) {
            request.post('/api/login')
                .send({
                    username: 'ayush',
                    password: 'pwd'
                })
                .expect(response => {
                    expect(response.status).to.equal(404);
                    expect(response.body).to.deep.equal({
                        message: 'User doesn\'t exist'
                    });
                })
                .end(done);
        });

        it('should login', function (done) {
            request.post('/api/login')
                .send({
                    username: 'ayushpoddar',
                    password: 'ap123'
                })
                .expect(response => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.deep.include({
                        message: 'Successfully logged in'
                    });
                })
                .end(done);
        });
    });
});
