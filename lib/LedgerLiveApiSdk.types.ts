export type MessageHandler = (payload: Object) => Promise<void>;

export interface Transport {
    connect(): void;
    disconnect(): void;
    onMessage: MessageHandler | undefined; 
    send(payload: Object) : Promise<void>;
}


export type RequestAccountParams = {
    currencies?: string[],
    allowAddAccount?: boolean,
}

export type ListCurrenciesParams = {
    name?: string,
    ticker?: string,
}

export type SignTransactionParams = {
    useApp?: string,
}
