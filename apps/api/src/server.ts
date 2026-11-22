import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { initSocketIO } from './services/socket.service';

const app = express();
const server = http.createServer(app);

// Initialize real-time Socket.IO
initSocketIO(server);

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: true, // Allow all origins including mobile LAN IPs in development
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(cookieParser(config.cookieSecret));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger for development
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Mount REST API v1
app.use('/api/v1', routes);

// Centralized error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  server.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(` MediNear API server running on port ${config.port}`);
    console.log(` Environment: ${config.nodeEnv}`);
    console.log(` Base API: http://localhost:${config.port}/api/v1`);
    console.log(` Socket.IO active`);
    console.log(`===============================================`);
  });
}

export { app, server };
