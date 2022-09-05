

const MESSAGE_BIRD_LIVE_KEY='2lzaimOsDRbzlIwRFzRdqDXkI'

const MESSAGE_BIRD_TEST_KEY='HCdjDOZtS6a5NaJ6nwsrM7HuW'

import { Inject, Injectable } from '@nestjs/common';
import { MessageBird } from 'messagebird/types';

@Injectable()
export class MessageBirdService {
  constructor(
    @Inject('MessageBirdClient')
   public messageBird: MessageBird,
  ) {}

  async sendMessage(payload: { recipient: string; message: string }) {
    var params = {
      originator: 'vinn4200',
      recipients: [payload.recipient],
      body: payload.message,    
    };

    this.messageBird.messages.create(params, function(err, response) {
      if (err) {
        console.error('unable to send text message at the moment');
        return;
      }

      console.log(
        '🚀 ~ file: message-bird.service.ts ~ line 20 ~ MessageBirdService ~ this.messageBird.messages.create ~ response',
        response,
      );
    });
  }
}
