/* eslint-disable no-undef */
// const debug = require('debug')('test:login');
describe('Register', function () {
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
});
