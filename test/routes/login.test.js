/* eslint-disable no-undef */
// const debug = require('debug')('test:login');
const { populateUser } = require('../seed/seed');

describe('Login', function () {
    describe('POST /api/login', function () {
        before(populateUser);
        after(async () => {
            await User.deleteMany({});
        });


        it('should not login password mismatch', function (done) {
            request.post('/api/login')
                .send({
                    username: 'userOne',
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
                    username: 'userOne',
                    password: 'password1'
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
