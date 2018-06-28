const {app} = require('./app')
require('./connect')

app.listen(process.env.PORT || 3000, () => console.log('Server started'))