import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io';
// import { Body } from '@nestjs/common';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messageService: MessageService) {}

  // Event handler for 'createMessage' WebSocket event
  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    client: Socket,
  ) {
    // Call messageService to create a new message
    const message = await this.messageService.create(createMessageDto, '');
    const clientId = client;
    console.log('cle', clientId);
    // Emit the new message to all connected clients
    this.server.sockets.emit('message', message);

    // Return the created message
    return message;
  }

  @SubscribeMessage('findAllMessage')
  findAll() {
    // Call messageService to retrieve all messages
    const messages = this.messageService.findAll();

    // Emit the messages to all connected clients
    this.server.sockets.emit('message', messages);

    // Return the messages
    return messages;
  }

  // Event handler for 'join' WebSocket even
  @SubscribeMessage('join')
  joinRoom(
    @MessageBody('name') name: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Call messageService to identify the client by name and associate with the client's id
    this.messageService.identify(name, client.id);
    this.server.emit('message', `User ${client.id} has joined the chat`);
  }

  // Event handler for 'disconnect' WebSocket event
  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    // Emit a message when a user disconnects
    this.server.emit('message', `User ${client.id} has left the chat`);
  }

  // Event handler for 'typing' WebSocket event
  @SubscribeMessage('typing')
  async typing(
    @MessageBody('typing') isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ) {
    // Call messageService to get the name associated with the client's id
    const name = await this.messageService.getClientByName(client.id);
    client.broadcast.emit('typing', { name, isTyping });
  }
}
