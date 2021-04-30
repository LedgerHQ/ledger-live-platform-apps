import { Transport, MessageHandler } from './LedgerLiveApiSdk.types';

export default class WindowMessageTransport implements Transport {
  private target: Window;
  private _onMessage?: MessageHandler;

  constructor(target: Window = window) {
    this.target = target;
  }

  connect = () => {
    this.target.addEventListener("message", this._onMessageEvent, false);
    this.target.document?.addEventListener("message", this._onMessageEvent, false);
  }

  disconnect = () => {
    this.target.removeEventListener("message", this._onMessageEvent);
    this.target.document?.addEventListener("message", this._onMessageEvent, false);
  }

  _onMessageEvent = (event: MessageEvent) => {
    if (this._onMessage) {
      if (event.origin !== this.target.location.origin && event.data && typeof event.data === "string") {
        try {
          const payload = JSON.parse(event.data.toString());
          this._onMessage(payload);
        } catch (error) {
          this._onMessage(error);
        }
      }
    }
  }

  set onMessage(handler: MessageHandler) {
    this._onMessage = handler;
  }

  get onMessage() {
    return this.onMessage;
  }

  send = (response: string) => {
    mylog(["WindowMessageTransport - send response", response]);
    try {
      this.target.top.postMessage(JSON.stringify(response), "*")
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}