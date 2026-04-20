module.exports = {
  apps: [
    {
      name: "react-chat-bot-server",
      script: "./server/index.js",
      cwd: "/var/www/react-chat-bot",
      env: {
        PORT: 3001,
      },
    },
  ],
};
