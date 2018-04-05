const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const errorhandler = require('errorhandler');
const app = express();
const apiRouter = require('./api/api.js');
app.use(express.static('public'));

const PORT = process.env.PORT || 4000;
app.use(bodyParser.json());
app.use(cors());
app.use('/api', apiRouter);
app.use(errorhandler());

app.listen(PORT, ()=>{
  console.log(`Server is listening on ${PORT}`);
});
module.exports = app;
