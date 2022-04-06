const soapRequest = require('easy-soap-request');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fs = require('fs');
var convert = require('xml-js');

// soap wsdl connection
const url = 'http://ws.cdyne.com/ip2geo/ip2geo.asmx?wsdl';
const sampleHeaders = {
  'user-agent': 'sampleTest',
  'Content-Type': 'text/xml;charset=UTF-8',
};

// server config
const PORT = process.env.PORT || 3050;

const app = express();

app.use(bodyParser.json());

// MySql
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'parcialsoap'
});

// get port
app.get('/', (req, res) => {

  const { ip } = req.body;
  const xml = fs.readFileSync('./ip2geo.xml', 'utf-8');
  (async () => {
    const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml }); // Optional timeout parameter(milliseconds)
    const { headers, body, statusCode } = response;
    const sql = `INSERT INTO searchs (response) VALUES ('${convert.xml2js(body)}');`

    connection.query(sql, (error, results) => {
      if (error) throw error;
    });
    res.send(convert.xml2js(body));
  })()

});

// get all db
app.get('/db', (req, res) => {
  const sql = `SELECT * FROM searchs;`

  connection.query(sql, (error, results) => {
    if (error) throw error;
    console.log(results);
  });
  res.send('hecho')
})

// Check connect
connection.connect(error => {
  if (error) throw error;
  console.log('Database server running!');
});

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));

