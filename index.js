import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/submit", async (req, res) => {
  const { location } = req.body;

  if (!location) {
    console.log("Location is not defined:", req.body);
    return res.status(400).send("Location is required.");
  }

  try {
    const geoResponse = await axios.get(
      `http://api.positionstack.com/v1/forward?access_key=${process.env.POSITIONSTACK_API_KEY}&query=${location}`
    );
    const { latitude: lat, longitude: lng } = geoResponse.data.data[0];

    const response = await axios.get(
      `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}`,
      {
        headers: {
          "x-access-token": process.env.OPENUV_API_KEY,
        },
      }
    );
    res.render("index.ejs", { uvIndex: response.data.result.uv });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching UV index data.");
  }
});

app.listen(port, () => {
  console.log(`Listening from port ${port}.`);
});