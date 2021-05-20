import { Transport, MessageHandler } from './LedgerLiveApiSdk.types';

import Logger from './logger';

const defaultLogger = new Logger('WindowMessage');

export default class WindowMessageTransport implements Transport {
  private target: Window;
  private logger: Logger;
  private _onMessage?: MessageHandler;

  constructor(target: Window = window, logger: Logger = defaultLogger) {
    this.target = target;
    this.logger = logger;
  }

  connect = () => {
    this.target.addEventListener("message", this._onMessageEvent, false);
    //@ts-ignore (FIXME)
    this.target.document?.addEventListener("message", this._onMessageEvent, false);
    this.logger.debug('event listeners registered');
  }

  disconnect = () => {
    this.target.removeEventListener("message", this._onMessageEvent);
    //@ts-ignore (FIXME)
    this.target.document?.removeEventListener("message", this._onMessageEvent, false);
    this.logger.debug('event listeners unregistered');
  }

  _onMessageEvent = (event: MessageEvent) => {
    if (this._onMessage) {
      this.logger.debug('received message event', event);
      if (event.origin !== this.target.location.origin && event.data && typeof event.data === "string") {
        try {
          const payload = JSON.parse(event.data.toString());

          // TODO: find a better way to ensure message comes from LL
          if (payload.jsonrpc) {
            this.logger.log('received message', payload);
            this._onMessage(payload);
          } else {
            this.logger.debug('not a jsonrpc message');
          }
        } catch (error) {
          this.logger.warn('parse error');
          this._onMessage(error);
        }
      } else {
        this.logger.debug('ignoring message same origin');
      }
    } else {
      this.logger.debug('no handler registered');
    }
  }

  set onMessage(handler: MessageHandler | undefined) {
    this._onMessage = handler;
  }

  get onMessage() {
    return this._onMessage;
  }

  send = (response: any) => {
    try {
      //@ts-ignore
      if (this.target.ReactNativeWebView) {
        this.logger.log('sending message (ReactNativeWebview)', response);
        //@ts-ignore
        this.target.ReactNativeWebView.postMessage(JSON.stringify(response))
      } else {
        this.logger.log('sending message', response);
        this.target.top.postMessage(JSON.stringify(response), "*")
      }
      return Promise.resolve();
    } catch (error) {
      this.logger.error('unexpected error on send', error);
      return Promise.reject(error);
    }
  }
}