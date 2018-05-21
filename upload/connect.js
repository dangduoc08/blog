const mongoose = require('mongoose');
function getUrl () {
    if (process.env.NODE_ENV === 'test') return 'mongodb://localhost/db-test'
    if (process.env.NODE_ENV === 'production') return 'mongodb://root:root@ds033116.mlab.com:33116/db-production';
        return 'mongodb://localhost/db-dev';
}

mongoose.Promise = global.Promise;

mongoose.connect(getUrl(), { useMongoClient: true })
.then(() => console.log('Database connected'))
.catch(error => {
    console.log(error.message)
    process.exit(1)
})