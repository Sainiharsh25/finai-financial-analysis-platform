# FinAI — AI-Powered Financial Analysis Platform

FinAI is a full-stack financial analysis platform built with **Java, Spring Boot, React, and AI integration**. It combines market data, technical indicators, trading-strategy analysis, and AI-assisted financial insights in one application.

> **Project status:** Development in progress. Deployment and end-to-end verification are pending.

## Features

- **Secure Authentication:** User authentication and protected APIs using Spring Security and JWT.
- **Market Data Integration:** Retrieve financial market data through an external market-data API.
- **Technical Indicators:** Analyze stock trends using RSI, MACD, EMA, and Bollinger Bands.
- **Trading Signals:** Generate BUY, SELL, or HOLD signals based on implemented indicator logic.
- **Historical Backtesting:** Evaluate supported trading strategies against historical market data.
- **AI-Powered Analysis:** Integrate Spring AI with Ollama and Llama 3.2 for AI-assisted financial explanations.
- **Database Persistence:** Store application data using MySQL, Spring Data JPA, and Hibernate.
- **React Frontend:** Interactive user interface for accessing financial analysis features.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, Axios |
| Backend | Java 17, Spring Boot, REST APIs |
| Security | Spring Security, JWT |
| Database | MySQL, Spring Data JPA, Hibernate |
| AI Integration | Spring AI, Ollama, Llama 3.2 |
| Market Data | Alpha Vantage API |
| Build Tools | Maven, npm |

## Architecture

```text
React Frontend
      |
      | HTTP / REST APIs
      v
Spring Boot Backend
      |
      +---- Spring Security / JWT
      |
      +---- MySQL Database
      |
      +---- Market Data API
      |
      +---- Spring AI --> Ollama --> Llama 3.2
```

## Project Structure

```text
FinAI/
├── finai-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── finai-backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
└── README.md
```

*The structure above is illustrative; adjust it to match your actual repository layout.*

## Prerequisites

- Java 17 or a compatible configured JDK
- Node.js and npm
- MySQL
- Ollama with the Llama 3.2 model
- Alpha Vantage API key
- Maven, or the included Maven Wrapper

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/finai-financial-analysis-platform.git
cd finai-financial-analysis-platform
```

### 2. Configure the backend

Create a MySQL database named `finai_db`, then configure your backend's `application.properties` or environment variables.

Example configuration:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

alphavantage.api.key=${ALPHAVANTAGE_API_KEY}
alphavantage.base.url=https://www.alphavantage.co/query

spring.ai.ollama.base-url=${OLLAMA_BASE_URL:http://localhost:11434}
spring.ai.ollama.chat.options.model=llama3.2
```

Configure the remaining Spring Boot settings, including the server port and JPA options, as required by your environment.

**Never commit real API keys, database passwords, JWT secrets, or other credentials.**

### 3. Start Ollama

Install Ollama and download the model:

```bash
ollama pull llama3.2
```

Start the Ollama service and verify that it is reachable from the backend. A remotely hosted backend requires a reachable Ollama endpoint; `localhost` refers to the backend's own environment, not your personal computer.

### 4. Run the backend

From the backend directory on Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend uses port `8080` by default unless configured otherwise.

### 5. Run the frontend

From the frontend directory:

```bash
npm install
npm run dev
```

Configure `VITE_API_BASE_URL` to point to the backend URL. For local development, this is typically:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

Vite environment variables prefixed with `VITE_` are exposed to the client. Do not put private credentials in them.

## Production Build

Backend:

```powershell
.\mvnw.cmd clean package
```

Frontend:

```bash
npm run build
```

## Deployment Plan

The intended deployment setup is:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Managed cloud MySQL
- **AI inference:** Ollama hosting an accessible Llama 3.2 model endpoint

Deployment is still in progress. Add the live application URL here after deployment and end-to-end testing are complete.

## Security and Financial Disclaimer

- Keep credentials in environment variables or a secure secrets manager.
- Configure production CORS rules, HTTPS, and authentication appropriately.
- AI-generated explanations and technical indicators can be inaccurate or incomplete.
- This project is for educational and analytical purposes and does not provide guaranteed returns or personalized financial advice.

## Future Improvements

- Improve frontend code splitting and bundle performance.
- Add comprehensive unit and integration tests.
- Add database migrations and production-oriented database configuration.
- Expand backtesting metrics and strategy evaluation.
- Improve error handling, observability, and deployment automation.

## Author

**Harsh Saini**

GitHub: [Sainiharsh25](https://github.com/Sainiharsh25)
