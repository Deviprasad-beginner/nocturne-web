
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import type { WebSocketMessage } from '@/hooks/use-websocket';

interface Room {
  id: string;
  participants: Set<WebSocket>;
  type: 'random' | 'voice';
  maxParticipants?: number;
}

interface UserConnection {
  ws: WebSocket;
  username: string;
  roomId?: string;
  isSearching?: boolean;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private rooms = new Map<string, Room>();
  private connections = new Map<WebSocket, UserConnection>();
  private waitingForRandom: WebSocket[] = [];

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket connection established');

      ws.on('message', (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnection(ws);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'join_random':
        this.handleJoinRandom(ws, message.username);
        break;
      case 'chat_message':
        this.handleChatMessage(ws, message);
        break;
      case 'leave_room':
        this.handleLeaveRoom(ws);
        break;
      case 'join_room':
        this.handleJoinRoom(ws, message.roomId, message.username);
        break;
    }
  }

  private handleJoinRandom(ws: WebSocket, username: string) {
    // Store user connection info
    this.connections.set(ws, {
      ws,
      username,
      isSearching: true
    });

    // Check if there's someone waiting
    if (this.waitingForRandom.length > 0) {
      const otherWs = this.waitingForRandom.shift()!;
      const otherConnection = this.connections.get(otherWs);
      
      if (otherConnection && otherWs.readyState === WebSocket.OPEN) {
        // Create a room for both users
        const roomId = `random_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const room: Room = {
          id: roomId,
          participants: new Set([ws, otherWs]),
          type: 'random'
        };

        this.rooms.set(roomId, room);

        // Update connections
        this.connections.get(ws)!.roomId = roomId;
        this.connections.get(ws)!.isSearching = false;
        this.connections.get(otherWs)!.roomId = roomId;
        this.connections.get(otherWs)!.isSearching = false;

        // Notify both users
        this.sendToSocket(ws, {
          type: 'random_paired',
          roomId,
          partnerUsername: otherConnection.username
        });

        this.sendToSocket(otherWs, {
          type: 'random_paired',
          roomId,
          partnerUsername: username
        });
      } else {
        // Other user disconnected, add current user to waiting list
        this.waitingForRandom.push(ws);
        this.sendToSocket(ws, { type: 'random_waiting' });
      }
    } else {
      // No one waiting, add to waiting list
      this.waitingForRandom.push(ws);
      this.sendToSocket(ws, { type: 'random_waiting' });
    }
  }

  private handleChatMessage(ws: WebSocket, message: WebSocketMessage) {
    const connection = this.connections.get(ws);
    if (!connection || !connection.roomId) return;

    const room = this.rooms.get(connection.roomId);
    if (!room) return;

    // Broadcast message to all participants in the room except sender
    room.participants.forEach(participant => {
      if (participant !== ws && participant.readyState === WebSocket.OPEN) {
        this.sendToSocket(participant, {
          type: 'message_received',
          message: message.message
        });
      }
    });
  }

  private handleJoinRoom(ws: WebSocket, roomId: string, username: string) {
    let room = this.rooms.get(roomId);
    
    if (!room) {
      room = {
        id: roomId,
        participants: new Set([ws]),
        type: 'voice'
      };
      this.rooms.set(roomId, room);
    } else {
      room.participants.add(ws);
    }

    this.connections.set(ws, {
      ws,
      username,
      roomId
    });

    // Notify room of new participant
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      username,
      memberCount: room.participants.size
    }, ws);

    // Send room info to new participant
    this.sendToSocket(ws, {
      type: 'room_joined',
      roomId,
      memberCount: room.participants.size
    });
  }

  private handleLeaveRoom(ws: WebSocket) {
    const connection = this.connections.get(ws);
    if (!connection || !connection.roomId) return;

    const room = this.rooms.get(connection.roomId);
    if (!room) return;

    room.participants.delete(ws);

    // Notify remaining participants
    if (room.participants.size > 0) {
      this.broadcastToRoom(connection.roomId, {
        type: 'user_left',
        memberCount: room.participants.size
      });
    } else {
      // Remove empty room
      this.rooms.delete(connection.roomId);
    }

    // For random chats, notify partner about disconnection
    if (room.type === 'random' && room.participants.size === 1) {
      const remainingParticipant = Array.from(room.participants)[0];
      this.sendToSocket(remainingParticipant, {
        type: 'partner_disconnected'
      });
      room.participants.clear();
      this.rooms.delete(connection.roomId);
    }

    this.connections.delete(ws);
  }

  private handleDisconnection(ws: WebSocket) {
    // Remove from waiting list if present
    const waitingIndex = this.waitingForRandom.indexOf(ws);
    if (waitingIndex > -1) {
      this.waitingForRandom.splice(waitingIndex, 1);
    }

    this.handleLeaveRoom(ws);
  }

  private sendToSocket(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcastToRoom(roomId: string, message: WebSocketMessage, excludeWs?: WebSocket) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.participants.forEach(ws => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        this.sendToSocket(ws, message);
      }
    });
  }
}
