# TahvelBot

A Telegram bot for interacting with [tahvel.edu.ee](https://tahvel.edu.ee).

## Features
- Telegram bot built with [Telegraf](https://telegraf.js.org/)  
- Database handled with [Sequelize](https://sequelize.org/) + SQLite  
- Easy configuration via `.env`  

## Installation

```bash
git clone https://github.com/ledjajev/tahvelbot.git
cd tahvelbot
npm install
```

## Usage

Start the bot:

```bash
npm start
```

Run in development mode:

```bash
npm run dev
```

## Configuration

Create a `.env` file in the project root:

```env
BOT_TOKEN=0000000000:XXXXXX_X_XXXXXXXXXXXXXXXXXXXXXXXXX
TAHVEL_BACKEND=https://tahvel.edu.ee/hois_back/
TAHVELTP_BACKEND=https://tahveltp.edu.ee/hois_back/
DB_FILENAME=data.db
```


## Documentation

- [Models](./docs/models.md)

## License

[MIT](https://opensource.org/licenses/MIT) © 2025 Roman Ledjajev  

## Links

- [Telegram Bot](https://t.me/tahvelbot)  
- [GitHub Repository](https://github.com/ledjajev/tahvelbot)
