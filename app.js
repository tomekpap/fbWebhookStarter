//app.js - main file for running the app

//Import dependencies
const express = require("express"),
  crypto = require("crypto"),
  path = require("path"),
  config = require("./services/config");

//Define express app
const app = express();

//Import your webhook Handler function
const webhookHandler = require("./app/webhookHandler");

//////////////////////////////////////////
//* Set up middleware for all requests *
//////////////////////////////////////////
// Parse application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Parse application/json. Verify that callback came from Facebook
app.use(
  express.json({
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
app.post("/webhook", (req, res) => {
  let body = req.body;

  console.log(`\u{1F7EA} Received webhook:`);
  console.dir(body, { depth: null });

  res.status(200).send("EVENT_RECEIVED");

  //handleWebhook(body);
});

// Check if all environment variables are set
config.checkEnvVariables();

// Listen for requests :)
const listener = app.listen(config.port, function () {
  console.log(`The app is listening on port ${listener.address().port}`);
  if (
    Object.keys(config.personas).length == 0 &&
    config.appUrl &&
    config.verifyToken
  ) {
    console.log(
      "Is this the first time running?\n" +
        "Make sure to set the both the Messenger profile, persona " +
        "and webhook by visiting:\n" +
        config.appUrl +
        "/profile?mode=all&verify_token=" +
        config.verifyToken
    );
  }

  if (config.pageId) {
    console.log("Test your app by messaging:");
    console.log(`https://m.me/${config.pageId}`);
  }
});
