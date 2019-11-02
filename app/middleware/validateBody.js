const debug = require('debug')('app:');

const validations = (schema) => { 
    return (req, res, next) => { 
        const { error } = schema.validate(req.body); 
        const valid = error == null; 
  
        if (valid) { 
            next(); 
        } else { 
            const { details } = error; 
            const message = details.map(i => i.message).join(',');
  
            debug.extend('validation error')(message); 
            return res.status(422).json({ error: message }); } 
    }; 
}; 

module.exports = validations;
