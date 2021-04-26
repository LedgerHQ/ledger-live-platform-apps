import EventEmitter from "events";

export class SmartWebsocket extends EventEmitter {
    private ws: WebSocket | null = null;
    private url: string;

    constructor(url: string) {
        super();
        this.url = url;
    }

    connect() {
        const ws = new WebSocket(this.url);

        ws.onopen = () => {
            this.emit("connected");
        }

        ws.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            this.emit("message", message);
        }

        ws.onclose = () => {
            this.ws = null;
            this.emit("disconnected");
        }
        this.ws = ws;
    }

    send(message: any) {
        if (!this.ws) {
            throw new Error("Not connected");
        }
        this.ws.send(JSON.stringify(message))
    }

    close() {
        if (!this.ws) {
            throw new Error("Not connected");
        }
        this.ws.close();
    }
}