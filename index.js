require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then((data) => {
    console.log(data.connection.host);
  })
  .catch((err) => {
    console.log("CONNECTION FAILED");
  })

const urlSchema = new mongoose.Schema({
  link: {type:String, required: true},
  shortKey: {type:Number, required: true},
})

const UrlModel = mongoose.model('urlModel', urlSchema);

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
      error: "invalid url"
    })
  }

  dns.lookup(url.hostname, (err, address) => {
    if(err){
      console.error('DNS Lookup Error:', err);
      return res.json({error: "invalid url"})
    }
    id = uniqueURL();
    next();
  })  

}, (req, res) =>{

  let newLink = new UrlModel({
    link: url,
    shortKey: id
  })

  newLink.save()
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    })

  res.json({
    original_url: url,
    short_url: id
  })
})

app.use('/api/shorturl/:shortcut', (req, res) => {

  let shortcutKey = req.params.shortcut;

  UrlModel.findOne({shortKey : shortcutKey})
    .then((data) => {
      console.log(`URL found ${data.link}`);
      res.redirect(data.link);
    })
    .catch((err) => {
      console.log("No URL found");
      return res.json({
        error: "invalid url"
      })
    })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
