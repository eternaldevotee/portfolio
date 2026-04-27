# Rasa Bot Setup

This portfolio now includes a built-in chat widget and is configured to use Rasa Socket.IO by default.

## 1) Enable Socket.IO in your Rasa project

In your Rasa credentials.yml, ensure this exists:

socketio:
	user_message_evt: user_uttered
	bot_message_evt: bot_uttered
	session_persistence: true

## 2) Start your Rasa services

Run these in your Rasa project:

- rasa run actions
- rasa run --enable-api --cors "*" -p 5005

Socket.IO inspector URL:

- http://localhost:5005/webhooks/socketio/inspect.html?token=None

## 3) Portfolio config

Edit js/portfolio-data.js and update global.RASA_BOT_CONFIG.

Primary Socket.IO options:

- channel: "socketio"
- socketUrl: "http://localhost:5005"
- socketPath: "/socket.io/"
- socketToken: "None"
- socketScript: "https://cdn.socket.io/4.7.5/socket.io.min.js"

Other UI options:

- enabled
- title
- subtitle
- launchLabel
- greeting
- showOnAdmin

## 4) Optional REST fallback

If you want REST instead, set:

- channel: "rest"
- endpoint: "http://localhost:5005/webhooks/rest/webhook"

If REST returns 404, enable this in credentials.yml:

rest:

## 5) Production note

If your portfolio is hosted over HTTPS, use an HTTPS Rasa endpoint to avoid mixed-content blocks.
