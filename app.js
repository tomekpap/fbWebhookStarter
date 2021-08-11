//app.js - main file for running the app

//Import dependencies
const express = require("express"),
  crypto = require("crypto");

//Define express app
const app = express();

//* Set up middleware for all requests *

// Parse application/x-www-form-urlencoded
app.use(
  urlencoded({
    extended: true,
  })
);

// Parse application/json. Verify that callback came from Facebook
app.use(
  json({
    verify: verifyRequestSignature,
  })
);

// Verify that the callback came from Facebook.
function verifyRequestSignature(req, res, buf) {
  const signature = req.headers["x-hub-signature"];

  if (!signature) {
    console.warn(`Couldn't find "x-hub-signature" in headers.`);
  } else {
    const elements = signature.split("=");
    const signatureHash = elements[1];
    const expectedHash = crypto
      .createHmac("sha1", config.appSecret)
      .update(buf)
      .digest("hex");
    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

// Serving static files in Express
app.use(express.static(path.join(path.resolve(), "public")));

//Handle /webhook GET requests

//Handle /webhook POST requests - this is where you handle all information sent from Facebook

//Start the app
