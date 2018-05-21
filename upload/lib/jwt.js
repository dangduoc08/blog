const jwt = require('jsonwebtoken');

const SECRET_KEY = 'Batman'

function sign (obj) {
    return new Promise ((resolve,reject) => {
        jwt.sign (obj, SECRET_KEY, { expiresIn:'7d' }, (error, result) => {
            if (error) return reject(error)
                return resolve(result);
        })
    })
}

function verify (token) {
    return new Promise ((resolve,reject) => {
        jwt.verify (token, SECRET_KEY, (error, result) => {
            if (error) return reject(error);
                delete result.iat;
                delete result.exp;
                return resolve (result)
        })
    })
}

module.exports = {sign, verify}
