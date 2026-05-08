const express = require("express");
const pino = require("pino");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const app = express();

app.get("/", async (req, res) => {

  res.json({
    status: true,
    owner: "FM ABDULLAH",
    message: "Pair Server Running"
  });

});

app.get("/code", async (req, res) => {

  try {

    const number = req.query.number;

    if (!number) {

      return res.json({
        status: false,
        message: "Phone number required"
      });

    }

    const sessionPath =
    `./sessions/${number}`;

    const {
      state,
      saveCreds
    } = await useMultiFileAuthState(sessionPath);

    const { version } =
    await fetchLatestBaileysVersion();

    const sock = makeWASocket({

      version,

      logger: pino({
        level: "silent"
      }),

      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
          state.keys,
          pino({ level: "silent" })
        )
      },

      browser: [
        "Ubuntu",
        "Chrome",
        "20.0.04"
      ]

    });

    sock.ev.on(
      "creds.update",
      saveCreds
    );

    const code =
    await sock.requestPairingCode(number);

    return res.json({
      status: true,
      code: code
    });

  } catch (err) {

    console.log(err);

    return res.json({
      status: false,
      error: err.message
    });

  }

});

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});
