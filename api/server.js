const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

app.get('/api/server', async (req,res) =>{
  
  try{
    const url ="https://api.nationaltransport.ie/gtfsr/v2/Vehicles?format=json"
   
   
    const response = await fetch(url, {
    
      headers: {
        'Cache-Control': 'no-cache',
        'x-api-key': '7b74ccf4a43e4ab987d2239069221869',
      },
    });

    const data = await response.json();    
    res.json(data)

  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }

})


module.exports = app;