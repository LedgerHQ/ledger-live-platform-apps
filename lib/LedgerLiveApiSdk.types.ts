export type MessageHandler = (payload: Object) => Promise<void>;

export interface Transport {
    connect(): void;
    disconnect(): void;
    onMessage: MessageHandler | undefined;
    send(payload: Object): Promise<void>;
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

/**
 * Enum describing the different types of exchanges.
 */
export enum ExchangeType {
    Swap = 'swap',
    Buy = 'buy',
    Fund = 'fund'
}

type ExchangePayload = {
    /**
     * The name of the partner used to find partner informations
     */
    partnerName: string,
     /**
     * The nonce generated by the device and returned by the initExchange function
     */
    nonce: string
}

/**
 * Metadata used to describe a secure exchange between a Ledger device 
 * and a partner (for swap and funding operations)
 */
export type TransactionExchangePayload = ExchangePayload & {
    /**
     * Sender address
     */
    fromAddress: string,
    /**
     * Amount to send
     */
    fromAmount: string,
    /**
     * Currency to send
     */
    fromCurrency: string,
    /**
     * Sender account  name
     */
    fromAccountName: string,
    /**
     * Recipient address
     */
    toAddress: string,
    /**
     * Amount to receive
     */
    toAmount: string,
    /**
     * Currency to receive
     */
    toCurrency: string,
    /**
     * Account name of the recipient
     */
    toAccountName: string,
    /**
     * A refund address in case the operation fails
     */
    refundAddress: string,
    /**
     * The name of the account on which to  refund
     */
    refundAccountName: string
};

/**
 * Metadata used to describe a secure exchange between a Ledger device 
 * and a partner (sell operations)
 */
export type SellExchangePayload = ExchangePayload & {
    /**
     * Trader or user's email
     */
    email: string,
    
    /**
    * Ticker of the cryptocurrency to transfer
    */
    inCurrency: string,
    /**
     * Amount to transfer
     */
    inAmount: string,
    /**
     * Address to transfer to
     */
    inAddress: string,

    /**
    * Ticker of the currency the user gets back
    */
    outCurrency: string,
    /**
     * The amount the user gets back 
     */
    outAmount: string,
};

export type EcdsaSignature = {
    r: Buffer,
    s: Buffer
};

/**
 * Informations about a device application
 */
export type ApplicationDetails = {
    /**
     * Name of the application
     */
    name: string,
    /**
     * Version of the application (SemVer)
     */
    version: string
};

export enum DeviceModel {
    Blue = 'blue',
    NanoS = 'nanoS',
    NanoX = 'nanoX'
}

/**
 * Information about a device
 */
export type DeviceInfo = {
    /**
     * The model of the device (Nano S, Nano X...)
     */
    model: DeviceModel,
    /**
     * The version of the firmware (SemVer)
     */
    version: string,
};