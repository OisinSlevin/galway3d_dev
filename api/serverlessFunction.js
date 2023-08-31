const express = require("express");
const cors = require("cors");
const app = express();
const axios = require("axios");
const https = require('https');
app.use(express.json());
app.use(cors());


app.get('/api/serverlessFunction', async (req, res) => {
  // Simulate fetching data (you can replace this with actual data fetching)


  
  const url = "https://www.buseireann.ie/inc/proto/vehicleTdi.php?latitude_north=191944899&latitude_south=191581445&longitude_east=-32438469&longitude_west=-32809167&_=" + Date.now();
  const response = await axios.get(url);

  const data =  response.data;

  
  
  // Respond with the simulated data
  res.json(data);
});


// Serverless function export
module.exports = app;

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});