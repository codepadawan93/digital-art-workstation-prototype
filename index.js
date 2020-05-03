const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.APP_PORT || 13000;
const DOCROOT = process.env.APP_DOCROOT || "client";

app.use(express.static(DOCROOT));

const server = 
    app.listen(PORT, () => console.log(`Server started on http://${server.address().address}:${server.address().port}, docroot=${DOCROOT}`));