const supertest = require('supertest');
const chai = require('chai');
const app = require('../server');
const {User, Task} = require('../app/model');

global.app = app;
global.expect = chai.expect;
global.request = supertest(app);
global.User = User;
global.Task = Task;
