import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  messages: Message[] = [{ name: 'kpamsars', text: ' Helloo' }];
  clientToUser = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createMessageDto: CreateMessageDto) {
    const message = { ...createMessageDto };
    this.messages.push(message);
    return message;
  }

  findAll() {
    return this.messages;
  }

  identify(name: string, clientId: string) {
    this.clientToUser[clientId] = name;
    return Object.values(this.clientToUser);
  }
  getClientByName(clientId: string) {
    return this.clientToUser[clientId];
  }
}
