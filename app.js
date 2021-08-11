//app.js - main file for running the app

//Import dependencies
const express = require("express"),
  crypto = require("crypto");

//Define express app
const app = express();

//////////////////////////////////////////
//* Set up middleware for all requests *
//////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////

//Handle /webhook GET requests

app.get("/webhook", (req, res) => {
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === config.verifyToken) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    console.warn("Got /webhook but without needed parameters.");
  }
});

//Handle /webhook POST requests - this is where you handle all information sent from Facebook

//Start the app
