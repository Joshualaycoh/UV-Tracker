import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;


app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))


app.get("/", (req,res) => {
  res.render("index.ejs")
})

app.post("/submit", async (req,res) => {
  const { location } = req.body;
  // Convert location to lat, lng using geocoding API
  const geoResponse = await axios.get(`http://api.positionstack.com/v1/forward?access_key=YOUR_ACTUAL_POSITIONSTACK_API_KEY&query=${location}`);

  const { latitude: lat, longitude: lng } = geoResponse.data.data[0];

  try{
    const response = await axios.get(`https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}`, {
      headers: {
        'x-access-token': 'openuv-15gjb5grlvssbc14-io'
      }
    });
    res.render("index.ejs", { uvIndex: response.data.result.uv })

  }catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching UV index data.');
  }
})

app.listen( port, ()=> {
    console.log(`Listening from port ${port}.`)
})