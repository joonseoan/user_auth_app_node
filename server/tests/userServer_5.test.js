console.log('starting userServer_4.test.js');

const expect = require('expect'); 
const request = require('supertest');
const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { app } = require('../userServer_5');
const { Todoso } = require('../models/todoso_5');
const { Users } = require('../models/users_4');
const mongoose = require('mongoose');

const { todoso, populateTodoso, users, populateUsers } = require('./seed/seed_5');

beforeEach(populateUsers);
beforeEach(populateTodoso);

// =========================================== POST/TODOSO ======================================

describe('POST/todoso', () => {

    it('should create a new todoso', (done) => {

        const text = 'Test todoso text';

        request(app)
            .post('/todoso')

            // Just to use 'x-auth' header. 
            // It does not create create same '_user' value as users[0]._id 
            .set('x-auth', users[0].tokens[0].token)
            .send({ text }) 
            .expect(200)
            .expect((res) => {

                expect(res.body.text).toBe(text);
            
            })
            .end ((err, res) => {

                if(err) return done(err);

                Todoso.find({ text }).then( (todoso) => {
                // Todoso.find({ _user : mongoose.Types.ObjectId(users[0]._id) }).then( (todoso) => {
                
                    console.log(todoso, 'todoso~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
                
                    expect(todoso.length).toBe(1);
                    expect(todoso[0].text).toBe(text);
                    done();

                }).catch( err => done(err) );

            });

    });
    
    it('it should not create new collection and have an error', (done) => {

        request(app)
            .post('/todoso')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .expect((res) => {

                expect(res.body.text).toBeNull();

            })
            .end ((err, result) => {

                if(err) return done();

                Todoso.find({}).then((todos) => {

                    expect(todos.length).toBe(2); // todoso variable above
                    expect(todos[0].text).toBe(todoso[0].text);
                    done();

                }).catch((err) => done(err));

            });

    });

});

// =========================================== GET/TODOSO ======================================

describe ('Get /todoso', () => {

    it('it should get all todos', (done) => {

        request(app)
            .get('/todoso')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                
                expect(res.body.todoso.length).toBe(1)

            })
            .end(done);

    });

});


// =========================================== GET/TODOSO/:ID ======================================

describe('Get /todoso/:id', () => {

    it('it should have params.id correctly', (done) => {

        request(app)
            .get(`/todoso/${todoso[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {

                expect(res.body.byID.text).toBe(todoso[0].text);
            
            })
            .end(done);

    });

    it('it should return 404 if byID is not available', (done) => {

        const newHexID = new ObjectID().toHexString();

        request(app)
            .get(`/todoso/${newHexID}`)
            .expect(404)
            .end(done)


    });

    it('it should return 400 if "id" is not valid', (done) => {

        const newID = '234'
        
        request(app)
            .get(`/todoso/${newID}`)
            .expect(404)
            .end(done);

    });
    
});


// =========================================== DELETE/TODOSO/:ID ======================================

describe('Delete /todoso/:id', () => {

    it('it should delete a todoso', (done)=> {

        var hexID = todoso[1]._id.toHexString();

        request(app)
            .delete(`/todoso/${hexID}`)
            .expect(200) 
            .expect((res) => {

                expect(res.body.result._id).toBe(hexID);

            })
            .end( (err, result) => {

                if (err) return done(err);

                Todoso.findById(hexID).then((todoso) => {

                    expect(todoso).toBe(null);
                    expect(todoso).toNotExist(); 
                    done();

                }).catch(err => done(err));
           
            });
            

        });


        it('it should return 404 if byID is not available', (done) => {

            const newHexID = new ObjectID().toHexString();
    
            request(app)
                .delete(`/todoso/${newHexID}`)
                .expect(404)
                .end(done)

        });

        it('it should return 400 if "id" is not valid', (done) => {

            const newID = '234'
            
            request(app)
                .delete(`/todoso/${newID}`)
                .expect(404)
                .end(done);
    
        });
    
});  

// =========================================== PATCH/TODOSO/:ID ======================================

describe('PATCH /todoso/:id', () => {

    it('It shoud have a correct update', (done) => {

        const hexID = todoso[0]._id.toHexString();
        const completed = true;
        const text = 'cheer up';

        request(app)
            .patch(`/todoso/${hexID}`)
            .expect(200)
            .send({ text, completed })
            .expect(res => {

                expect(res.body.updated.text).toBe(text);
                expect(res.body.updated.completed).toBe(true); // (true)
                expect(res.body.updated.completedAt).toBeA('number');
                //expect(res.body.updated.completedAt).toNotMatch(todoso[1].completedAt);

            }).end(done); 
            
    });

    it('it should clear completedAt when todoso is not completed', (done) => {

        const hexID = todoso[1]._id.toHexString();
        const completed = false;
        const text = 'what are you doing?';

        request(app)
            .patch(`/todoso/${hexID}`)
            .expect(200)
            .send({ text, completed })
            .expect(res => {

                expect(res.body.updated.completed).toBe(false);
                expect(res.body.updated.completedAt).toNotExist();

            }).end(done);
    });

    it('it should return 404 if byID is not available', (done) => {

        const newHexID = new ObjectID().toHexString();

        request(app)
            .patch(`/todoso/${newHexID}`)
            .expect(404)
            .end(done)


    });

    it('it should return 400 if "id" is not valid', (done) => {

        const newID = '234'
        
        request(app)
            .patch(`/todoso/${newID}`)
            .expect(404)
            .end(done);

    });

});


describe('GET /users/me', () => {

    it('it should have return of the user if authenticated', (done) => {

        request(app)
            .get('/users/me')

            // have "header" information
            // The first arg : header name
            // The second arg : target property
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {

                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);

            })
            .end(done);

    });

    it('it should not return the user if not authenticated', (done) => {

        request(app)
            .get('/users/me')
            .set('x-auth', null)
            .expect(401)
            .expect((res) => {

                expect(res.body._id).toNotBe(users[1]._id.toHexString());
                expect(res.body.email).toNotBe(users[1].email);
                expect(res.body).toEqual({});

            })
            .end(done);
    });

});


describe('POST /users', () => {

    it('it should return a validated document', (done) => {

        const email = 'uniqueEmail@example.com';
        const password = '1234abcde';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect( res => {

                 expect(res.headers['x-auth']).toExist();
                 expect(res.body.email).toBe(email);
            
            })
            .end((err, res) => {

                if(err) return done(err);

                const decoded = jwt.verify(res.headers['x-auth'], 'abcde');

                Users.findById(decoded._id).then( (user) => {

                    expect(user.tokens[0].token).toEqual(res.headers['x-auth']);
                    expect(user.tokens[0].access).toBe('auth');
                    expect(user.password).toNotBe(password);
                    expect(user.email).toBe(email);
                    done();
                    
                }).catch((err) => done(err));

            });

        });

        it('should return validation errors if request is invalid', (done) => {


            const email = 'abcdef'; // no email format
            const password = '12345678';

            request(app)
                .post('/users')
                .send({ email, password })
                .expect(400)
                .expect (res => {

                    expect(res.headers['x-auth']).toNotExist();
                    expect(res.body.email).toNotExist();

                })
                .end(done);

        });

        it('it should not create a new user if the email is in use', (done) => {

            const email ='adrew@abc.com';
            const password = '12345678';

            request(app)
                .post('/users')
                .send({ email, password })
                .expect(400)
                .expect(res => {

                    expect(res.body.email).toNotExist();
                    expect(res.body._id).toNotExist();

                }).end(done);

        });

    });

describe('POST /users/login', () => {

    it('it should login user and return auth token', (done) => {

        request(app)
            .post('/users/login')
            .send({ 

                    email: users[1].email,
                    password: users[1].password

            })
            .expect(200)
            .expect((res) => {

                expect(res.body.email).toBe(users[1].email);
                expect(res.headers['x-auth']).toExist();

            }).end((err, res) => {

                if(err) return done(err);

                Users.findById(users[1]._id).then((user) => {

                    expect(user.tokens[0].token).toBe(res.headers['x-auth']);
                    expect(user.tokens[0]).toInclude({

                        access: 'auth',
                        token: res.headers['x-auth']

                    });
                    done();
      
                }).catch((err) => done(err));

            });

    });

    it('it should reject invalid login', (done) => {
        
        request(app)
            .post('/users/login')
            .send({ 

                    email: users[1].email,
                    password: users[1].password + '1'

            })
            .expect(400)
            .expect((res) => {

                expect(res.body.email).toNotExist();
                expect(res.headers['x-auth']).toNotExist();


            }).end((err, res) => {

                if(err) return done(err);

                Users.findById(users[1]._id).then((user) => {

                    console.log('user:~~~~~~~~~~~', user);

                    expect(user.tokens.length).toBe(0);
                    done();
      
                }).catch((err) => done(err));

            });

    });

});

describe('Delete /users/me/token', () => {

    it('it should remove auth token on logout', (done) => {

        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {

                if(err) return done(err);

                Users.findById(users[0]._id).then(user => {

                    expect(user.tokens.length).toBe(0);
                    expect(user.email).toExist();
                    done();

                }).catch(err => done(err));

            });
    });

});