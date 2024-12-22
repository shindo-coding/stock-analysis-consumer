import { Injectable } from '@nestjs/common';
import { Pushover } from 'pushover-js';
import { logMessage } from '../logging/custom.logger';

type Priority = -2 | -1 | 0 | 1 | 2;
type Sound =
  | 'pushover'
  | 'bike'
  | 'bugle'
  | 'cashregister'
  | 'classical'
  | 'cosmic'
  | 'falling'
  | 'gamelan'
  | 'incoming'
  | 'intermission'
  | 'magic'
  | 'mechanical'
  | 'pianobar'
  | 'siren'
  | 'spacealarm'
  | 'tugboat'
  | 'alien'
  | 'climb'
  | 'persistent'
  | 'echo'
  | 'updown'
  | 'vibrate'
  | 'none';

@Injectable()
export class PushoverNotification {
  private pushover: Pushover;

  constructor() {
    const user = process.env.PUSHOVER_USER;
    const token = process.env.PUSHOVER_TOKEN;
    this.pushover = new Pushover(user, token);
  }

  async send({
    title,
    message,
    priority = 0,
    sound = 'bugle',
    html,
    url,
  }: {
    title: string;
    message: string;
    priority?: Priority;
    sound?: Sound;
    html?: boolean;
    url?: { url: string; title: string };
  }) {
    try {
      this.pushover.setPriority(priority);
      this.pushover.setSound(sound);
      if (html) this.pushover.setHtml();
      if (url?.url && url?.title) {
        this.pushover.setUrl(url.url, url.title);
      }
      const response = await this.pushover.send(title, message);
      return response;
      
    } catch (error) {
      logMessage('error', error);
    }
  }
}

export default PushoverNotification;

