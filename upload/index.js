const {app} = require('./app')
require('./connect')

app.listen(process.env.PORT || 80, () => console.log('Server started'))