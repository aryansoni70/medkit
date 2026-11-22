import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from '../config';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket: Socket) => {
    // Client subscribes to real-time inventory updates for a medicine
    socket.on('subscribe:medicine', (medicineId: string) => {
      socket.join(`medicine:${medicineId}`);
    });

    socket.on('unsubscribe:medicine', (medicineId: string) => {
      socket.leave(`medicine:${medicineId}`);
    });

    // Pharmacy dashboard channel
    socket.on('subscribe:pharmacy', (pharmacyId: string) => {
      socket.join(`pharmacy:${pharmacyId}`);
    });

    socket.on('unsubscribe:pharmacy', (pharmacyId: string) => {
      socket.leave(`pharmacy:${pharmacyId}`);
    });

    socket.on('disconnect', () => {
      // Cleaned up automatically by socket.io
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastStockUpdate(medicineId: string, payload: any) {
  if (io) {
    // Notify all customers searching for or viewing this medicine
    io.to(`medicine:${medicineId}`).emit('stock:updated', {
      medicineId,
      ...payload,
      timestamp: new Date().toISOString()
    });

    if (payload.pharmacyId) {
      io.to(`pharmacy:${payload.pharmacyId}`).emit('pharmacy:inventory:updated', payload);
    }
  }
}
