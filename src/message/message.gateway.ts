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
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messageService: MessageService) {}

  @SubscribeMessage('createMessage')
  async create(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto);
    this.server.emit('message', message);
    return message;
  }

  @SubscribeMessage('privateMessage')
  async privateMessage(
    @MessageBody() { to, message }: { to: string; message: string },
    @ConnectedSocket() sender: Socket,
  ) {
    const senderName = await this.messageService.getClientByName(sender.id);
    const receiver = await this.messageService.getClientByName(to);

    if (receiver) {
      this.server
        .to(receiver.id)
        .emit('privateMessage', { from: senderName, message });
      sender.emit('privateMessage', { to: receiver.name, message });
    } else {
      sender.emit('privateMessageError', `User ${to} not found`);
    }
  }

  @SubscribeMessage('findAllMessage')
  findAll() {
    return this.messageService.findAll();
  }

  @SubscribeMessage('join')
  joinRoom(
    @MessageBody('name') name: string,
    @ConnectedSocket() client: Socket,
  ) {
    return this.messageService.identify(name, client.id);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.server.emit('message', `User ${client.id} has left the chat`);
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody('typing') isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ) {
    const name = await this.messageService.getClientByName(client.id);
    client.broadcast.emit('typing', { name, isTyping });
  }
}
