import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  constructor(private socket: Socket) {

  }

  public send(channel, message) {
    this.socket.emit(channel, message);
  }

  public getMessages = (channel) => {
    return Observable.create((observer) => {
      this.socket.on(channel, (message) => {
        observer.next(message);
      });
    });
  }


}
