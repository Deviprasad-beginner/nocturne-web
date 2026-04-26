
import { WebSocketServer, WebSocket } from 'ws';
import { Server, IncomingMessage } from 'http';
import { logger } from './utils/logger';
import cookie from 'cookie';
import { storage } from './storage';

// Mirrors the type in client/src/hooks/use-websocket.ts.
// Defined locally to avoid importing across the client/server boundary.
interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface Room {
  id: string;
  participants: Set<WebSocket>;
  type: 'random' | 'voice' | 'circle';
  maxParticipants?: number;
}

interface UserConnection {
  ws: WebSocket;
  username: string;
  roomId?: string;
  circleAlias?: string;
  circleId?: number;
  isSearching?: boolean;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private rooms = new Map<string, Room>();
  private connections = new Map<WebSocket, UserConnection>();
  private waitingForRandom: WebSocket[] = [];

  constructor(server: Server) {
    this.wss = new WebSocketServer({ noServer: true });
    this.setupWebSocket();

    server.on('upgrade', async (request, socket, head) => {
      // Only handle upgrades for the /ws path
      if (request.url === '/ws') {
        try {
          // Try to identify via session cookie (registered users)
          // If no session, allow the connection anyway as a guest.
          // Night Circles supports anonymous users — rejecting here would
          // break real-time messaging for everyone who isn't logged in.
          const sessionUser = await this.extractUserFromSession(request);

          if (sessionUser) {
            (request as any).authenticatedUser = sessionUser;
          } else {
            // Assign a temporary guest identity based on connection time
            // The alias assigned during circle join is used for display
            const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            (request as any).authenticatedUser = { id: null, guestId };
            logger.info(`WebSocket guest connection allowed: ${guestId}`);
          }

          this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, request);
          });
        } catch (error) {
          logger.error('WebSocket upgrade error', error);
          socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
          socket.destroy();
        }
      }
    });
  }

  /**
   * Extract user from session cookie.
   * Parses the connect.sid cookie, looks up the session in the store,
   * and returns the user if found.
   */
  private async extractUserFromSession(request: IncomingMessage): Promise<any | null> {
    try {
      const cookies = cookie.parse(request.headers.cookie || '');
      const sid = cookies['connect.sid'];
      if (!sid) return null;

      // Parse the signed session ID (format: s:<session-id>.<signature>)
      const sessionId = sid.startsWith('s:') ? sid.slice(2).split('.')[0] : sid;
      if (!sessionId) return null;

      // Look up session in store
      return new Promise((resolve) => {
        (storage.sessionStore as any).get(sessionId, (err: any, session: any) => {
          if (err || !session || !session.passport?.user) {
            resolve(null);
          } else {
            resolve({ id: session.passport.user });
          }
        });
      });
    } catch {
      return null;
    }
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('WebSocket connection established');

      // Per-connection rate limiting: 30 messages per minute
      let messageCount = 0;
      const rateLimitWindow = setInterval(() => { messageCount = 0; }, 60 * 1000);
      const MAX_MESSAGES_PER_MINUTE = 30;
      // Max message size: 64KB
      const MAX_MESSAGE_BYTES = 64 * 1024;

      ws.on('message', (data) => {
        // Enforce message size limit (DoS prevention)
        // RawData is Buffer | ArrayBuffer | Buffer[] — handle each variant explicitly
        const byteLength = Array.isArray(data)
          ? data.reduce((sum, chunk) => sum + chunk.length, 0) // chunked Buffer[]
          : Buffer.isBuffer(data)
            ? data.length                                       // single Buffer
            : data.byteLength;                                  // ArrayBuffer
        if (byteLength > MAX_MESSAGE_BYTES) {
          logger.warn(`WebSocket message too large (${byteLength} bytes), dropping`);
          return;
        }

        // Enforce rate limit
        messageCount++;
        if (messageCount > MAX_MESSAGES_PER_MINUTE) {
          logger.warn('WebSocket rate limit exceeded, dropping message');
          return;
        }

        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error);
        }
      });

      ws.on('close', () => {
        clearInterval(rateLimitWindow);
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error', error);
        clearInterval(rateLimitWindow);
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
      // Night Circles 2.0 events
      case 'CIRCLE_JOIN':
        this.handleCircleJoin(ws, message.circleId, message.alias, message.lifecycle);
        break;
      case 'CIRCLE_LEAVE':
        this.handleCircleLeave(ws, message.circleId, message.alias);
        break;
      case 'CIRCLE_MESSAGE':
        this.handleCircleMessage(ws, message.circleId, message.alias, message.content, message.emotion);
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
        const roomId = `random_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

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

    if (room.type === 'random') {
      // For random chats, notify the remaining partner about disconnection
      if (room.participants.size === 1) {
        const remainingParticipant = Array.from(room.participants)[0];
        this.sendToSocket(remainingParticipant, {
          type: 'partner_disconnected'
        });
      }
      // Clean up the random room regardless of remaining count
      room.participants.clear();
      this.rooms.delete(connection.roomId);
    } else {
      // Notify remaining participants in non-random rooms
      if (room.participants.size > 0) {
        this.broadcastToRoom(connection.roomId, {
          type: 'user_left',
          memberCount: room.participants.size
        });
      } else {
        // Remove empty room
        this.rooms.delete(connection.roomId);
      }
    }

    this.connections.delete(ws);
  }

  private handleDisconnection(ws: WebSocket) {
    // Remove from waiting list if present
    const waitingIndex = this.waitingForRandom.indexOf(ws);
    if (waitingIndex > -1) {
      this.waitingForRandom.splice(waitingIndex, 1);
    }

    // Auto-leave circle on disconnect
    const conn = this.connections.get(ws);
    if (conn?.circleId) {
      this.handleCircleLeave(ws, conn.circleId, conn.circleAlias ?? 'Unknown Voice');
    }

    this.handleLeaveRoom(ws);
  }

  // ── Night Circles Room Handlers ───────────────────────────────────────────

  private handleCircleJoin(ws: WebSocket, circleId: number, alias: string, lifecycle?: string) {
    const roomId = `circle_${circleId}`;
    let room = this.rooms.get(roomId);

    if (!room) {
      room = { id: roomId, participants: new Set(), type: 'circle' };
      this.rooms.set(roomId, room);
    }

    room.participants.add(ws);

    const conn = this.connections.get(ws) ?? { ws, username: alias };
    conn.roomId = roomId;
    conn.circleAlias = alias;
    conn.circleId = circleId;
    this.connections.set(ws, conn);

    // Broadcast to others
    this.broadcastToRoom(roomId, {
      type: 'MEMBER_JOINED',
      circleId,
      alias,
      memberCount: room.participants.size,
      lifecycle,
    } as any, ws);

    // Confirm to the joining socket
    this.sendToSocket(ws, {
      type: 'CIRCLE_JOINED',
      circleId,
      alias,
      memberCount: room.participants.size,
    } as any);
  }

  private handleCircleLeave(ws: WebSocket, circleId: number, alias: string) {
    const roomId = `circle_${circleId}`;
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.participants.delete(ws);

    const conn = this.connections.get(ws);
    if (conn) {
      conn.circleId = undefined;
      conn.circleAlias = undefined;
    }

    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
      return;
    }

    this.broadcastToRoom(roomId, {
      type: 'MEMBER_LEFT',
      circleId,
      alias,
      memberCount: room.participants.size,
    } as any);
  }

  private handleCircleMessage(ws: WebSocket, circleId: number, alias: string, content: string, emotion?: string) {
    const roomId = `circle_${circleId}`;
    this.broadcastToRoom(roomId, {
      type: 'CIRCLE_MESSAGE',
      circleId,
      alias,
      content,
      emotion,
      timestamp: new Date().toISOString(),
    } as any, ws); // exclude sender — ws is passed as excludeWs
  }

  // Broadcast lifecycle change to all in a circle
  broadcastCircleLifecycle(circleId: number, state: string, memberCount: number) {
    const roomId = `circle_${circleId}`;
    this.broadcastToRoom(roomId, {
      type: 'LIFECYCLE_CHANGED',
      circleId,
      state,
      memberCount,
    } as any);

    if (state === 'ended') {
      this.broadcastToRoom(roomId, { type: 'CIRCLE_ENDED', circleId } as any);
      this.rooms.delete(roomId);
    }
  }

  // Broadcast emotion update to all in a circle
  broadcastEmotionUpdate(circleId: number, primaryEmotion: string, vibeScore: number) {
    const roomId = `circle_${circleId}`;
    this.broadcastToRoom(roomId, {
      type: 'EMOTION_UPDATED',
      circleId,
      primaryEmotion,
      vibeScore,
    } as any);
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
