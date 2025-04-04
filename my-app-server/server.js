const express = require("express");
const color = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mysqlPool = require("./config/db");
const cors = require("cors");

//config
dotenv.config();

//rest object
const app = express();

//middleware
app.use(express.json());
app.use(morgan("dev"));

//cors
app.use(cors());

// Custom CORS middleware with options
const corsOptions = {
  origin: function (origin, callback) {
    if (origin === "http://localhost:5173" || origin === "http://192.168.1.4:5173" || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply the custom CORS options middleware
app.use(cors(corsOptions));


//port
const PORT = process.env.port || 8080;

//routes
app.use("/api/v1", require("./routes/Routes"));


//conditionally listen
mysqlPool
  .query("SELECT 1")
  .then(() => {
    //mysql
    console.log("MySQL DB Connected".bgCyan.white);
    //listen
    app.listen(PORT, () => {
      console.log(`Server is Running on port ${PORT}!!!`.yellow);
    });
  })
  .catch((error) => {
    console.log(error);
  });
