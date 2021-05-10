import React, {useCallback, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import Select from 'react-select'

import LedgerLiveApi from '../../lib/LedgerLiveApiSdk';
import WindowMessageTransport from '../../lib/WindowMessageTransport';
import { deserializeTransaction } from '../../lib/serializers';

const AppLoaderPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
`;

const Field = styled.label`
    flex-grow: 1;
    padding: 2px;
    display: flex;
    flex-direction: column;
`

const TextArea = styled.textarea`
    resize: vertical;
    min-height: 128px;
    fonst-size: 14px;
    font-family: monospace;
`

const ToolBar = styled.div`
    color: #222;
    background-color: #ccc;
    padding: 8px 6px;
`
const Output = styled.pre`
    overflow: scroll;
    margin: 0;
    color: ${(props: { isError: boolean }) => props.isError ? 'red': '#eee'};
    font-size: 12px;
`

const PAYLOAD_SIGN = { family: "ethereum", recipient: "XXX", amount: "1" };
const PAYLOAD_BROADCAST = { signedTransaction: "YYY" };

const ACTIONS = [
    { value: "account.list", label: "List Accounts"},
    { value: "account.request", label: "Request Account", usePayload: true },
    { value: "account.receive", label: "Verify Address", useAccount: true },
    { value: "transaction.sign", label: "Sign Transaction", useAccount: true, usePayload: PAYLOAD_SIGN },
    { value: "transaction.broadcast", label: "Broadcast Transaction", useAccount: true, usePayload: PAYLOAD_BROADCAST },
    { value: "currency.list", label: "List Currencies", usePayload: true },
];

const prettyJSON = (payload: any) => JSON.stringify(payload, null, 2);

export default function DebugApp() {
    const api = useRef<LedgerLiveApi | null>(null);
    const [lastAnswer, setLastAnswer] = useState<any>(null);
    const [isError, setIsError] = useState<any>(false);
    const [method, setMethod] = useState<any>(ACTIONS[0]);
    const [accounts, setAccounts] = useState<any>([]);
    const [account, setAccount] = useState<any>(null);
    const [rawPayload, setRawPayload] = useState<any>("");
    
    useEffect(() => {
        const llapi = new LedgerLiveApi(new WindowMessageTransport());
        api.current = llapi;

        llapi.connect();
        return () => {
            api.current = null;
            void llapi.disconnect();
        }
    }, []);

    const execute = useCallback(async () => {
        if (api.current) {
            let action;
            switch(method.value) {
                case "account.list":
                    action = api.current.listAccounts();
                    break;
                case "account.request":
                    try {
                        const payload = rawPayload ? JSON.parse(rawPayload) : undefined;
                        action = api.current.requestAccount(payload);
                    } catch (error) {
                        action = Promise.reject(error);
                    }
                    break;
                case "account.receive":
                    if (account) {
                        action = api.current.receive(account.id);
                    } else {
                        action = Promise.reject(new Error("No accountId selected"));
                    }
                    break;
                case "transaction.sign":
                    try {
                        const transaction = deserializeTransaction(JSON.parse(rawPayload));
                        action = api.current.signTransaction(account.id, transaction);
                    } catch (error) {
                        action = Promise.reject(error);
                    }
                    break;
                case "transaction.broadcast":
                    try {
                        const payload = JSON.parse(rawPayload);
                        action = api.current.broadcastSignedTransaction(account.id, payload);
                    } catch (error) {
                        action = Promise.reject(error);
                    }
                    break;
                case "currency.list":
                    try {
                        const payload = rawPayload ? JSON.parse(rawPayload) : undefined;
                        action = api.current.listCurrencies(payload);
                    } catch (error) {
                        action = Promise.reject(error);
                    }
                    break;
                default:
                    action = Promise.resolve();
            }

            try {
                const result = await action;
                setIsError(false);
                setLastAnswer(result);
                if (method.value === "account.list") {
                    setAccounts(result);
                    if (result instanceof Array && result.length) {
                        setAccount(result[0])
                    }
                }
            } catch (err) {
                setLastAnswer({ message: err.message });
                console.log(err);
                setIsError(true);
            }

        }
    }, [method, account, rawPayload])

    const handleMethodChange = useCallback((option) => {
        setMethod(option);
        if (option && option.usePayload && option.usePayload !== true) {
            setRawPayload(prettyJSON(option.usePayload))
        }
    }, [setMethod]);

    const handleAccountChange = useCallback((option) => {
        setAccount(option);
        
    }, [setMethod]);

    const handlePayloadChange = useCallback((event) => {
        setRawPayload(event.target.value);

    }, [setRawPayload]);

    const handlePayloadBlur = useCallback((event) => {

        try {
            const payload = JSON.parse(event.target.value);
            setRawPayload(prettyJSON(payload));
        } catch (err) {}
    }, [setRawPayload]);

    return (
        <AppLoaderPageContainer>
            <ToolBar>
                <Row>
                    <Field>
                        Method:
                        <Select
                            options={ACTIONS}
                            onChange={handleMethodChange}
                            value={method}
                        />
                    </Field>
                    <Field>
                        Account:
                        <Select
                            options={accounts}
                            onChange={handleAccountChange}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => `${option.name} (${option.address})`}
                            value={account}
                            isDisabled={!method.useAccount}
                        />
                    </Field>

                </Row>
                <Field>
                    Payload:
                    <TextArea onChange={handlePayloadChange} onBlur={handlePayloadBlur} value={rawPayload} disabled={!method.usePayload}></TextArea>
                </Field>
                <button onClick={execute}>EXECUTE</button>
            </ToolBar>

            <Output isError={isError}>{prettyJSON(lastAnswer)}</Output>
        </AppLoaderPageContainer>
    );
}