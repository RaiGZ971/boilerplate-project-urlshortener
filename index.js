require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let url, id;
let uniqueURL = () => Math.floor(Math.random() * 10000);

app.post('/api/shorturl', (req, res, next) => {
  try{
    url = new URL(req.body.url);
  } 
  catch(err) {
    return res.json({
      error: "No short URL found for the given input"
    })
  }

  id = uniqueURL();

  next();

}, (req, res) =>{
  res.json({
    original_url: url,
    short_url: id
  })
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
