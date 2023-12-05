import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  // Initial array of messages with a default message
  messages: Message[] = [{ name: '', text: '' }];

  // variable to map client IDs to user names
  clientToUser = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // Method to create a new message
  create(createMessageDto: CreateMessageDto, clientId: string) {
    let msg = createMessageDto;
    const data = JSON.parse(msg as never);
    this.messages.push(data);

    console.log('messages ', clientId);
    return this.messages;
  }

  findAll() {
    return this.messages;
  }

  // Method to identify a user by associating a name with a client ID
  identify(name: string, clientId: string) {
    this.clientToUser[clientId] = name;
    return Object.values(this.clientToUser); // Return an array of all user names
  }

  // Method to get the user name associated with a client ID
  getClientByName(clientId: string) {
    return this.clientToUser[clientId]; // Return the user name associated with the client ID
  }
}
