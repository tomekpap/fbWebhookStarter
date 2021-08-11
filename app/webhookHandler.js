//webhookHandler.js

//Import dependencies

//Define your webhookHandler function
module.exports = function webhookHandler(body) {
  if (body.object === "page") {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(async function (entry) {
      // if ("changes" in entry) {
      //   // Handle Page Changes event
      //   let receiveMessage = new Receive();
      //   if (entry.changes[0].field === "feed") {
      //     let change = entry.changes[0].value;
      //     switch (change.item) {
      //       case "post":
      //         return receiveMessage.handlePrivateReply(
      //           "post_id",
      //           change.post_id
      //         );
      //       case "comment":
      //         return receiveMessage.handlePrivateReply(
      //           "comment_id",
      //           change.comment_id
      //         );
      //       default:
      //         console.warn("Unsupported feed change type.");
      //         return;
      //     }
      //   }
      // }

      // Iterate over webhook events - there may be multiple
      entry.messaging.forEach(async function (webhookEvent) {
        // Discard uninteresting events
        if ("read" in webhookEvent) {
          console.log("Got a read event");
          return;
        } else if ("delivery" in webhookEvent) {
          console.log("Got a delivery event");
          return;
        }

        // Get the sender PSID
        let senderPsid = webhookEvent.sender.id;

        Response.sendMessage("No co tam?", senderPsid);

        if (!(senderPsid in users)) {
          // First time seeing this user
          let user = new User(senderPsid);
          let userProfile = await GraphApi.getUserProfile(senderPsid);
          if (userProfile) {
            user.setProfile(userProfile);
            users[senderPsid] = user;
            if (userProfile.hasPicture) {
              await download(
                userProfile.pictureUrl,
                `${__dirname}/files/${user.psid}.jpg`
              );
              users[senderPsid][
                "pictureUrl"
              ] = `${__dirname}/files/${user.psid}.jpg`;
            }
            console.log(`Created new user profile:`);
            console.log({ user });
          }
        }
        //i18n.setLocale(users[senderPsid].locale);
        // let receiveMessage = new Receive(users[senderPsid], webhookEvent);
        // return receiveMessage.handleMessage();
      });
    });
  }
};
