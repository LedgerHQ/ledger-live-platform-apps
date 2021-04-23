import React, {useCallback, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import Select from 'react-select'

import LedgerLiveApi from '../../lib/LedgerLiveApiSdk';
import WindowMessageTransport from '../../lib/WindowMessageTransport';

const AppLoaderPageContainer = styled.div`
  
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
    color: #eee;
    font-size: 12px;
`

const ACTIONS = [
    { value: "account.list", label: "List Accounts"},
    { value: "account.get", label: "Get Account"},
    { value: "account.receive", label: "Verify Address" },
    { value: "transaction.sign", label: "Sign Transaction" },
];

function DebugApp() {
    const api = useRef<LedgerLiveApi | null>(null);
    const [lastAnswer, setLastAnswer] = useState<any>(null);
    const [method, setMethod] = useState<any>(ACTIONS[0]);
    const [accounts, setAccounts] = useState<any>([]);
    const [account, setAccount] = useState<any>(null);
    const [rawPayload, setRawPayload] = useState<any>(null);

    useEffect(() => {
        api.current = new LedgerLiveApi(new WindowMessageTransport());

        api.current.connect();
        return () => api.current?.disconnect();
    }, []);

    const execute = useCallback(async () => {
        if (api.current) {
            let action;
            switch(method.value) {
                case "account.list":
                    action = api.current.listAccounts();
                    break;
                case "account.get":
                    action = api.current.getAccount(account.id);
                    break;
                case "account.receive":
                    action = api.current.receiveAccount(account.id);
                    break;
                case "transaction.sign":
                    try {
                        const payload = JSON.parse(rawPayload);
                        action = api.current.signTransaction(account.id, payload);
                    } catch (error) {
                        alert("Invalid JSON payload");
                        action = Promise.reject(error);
                    }
                    break;
                default:
                    action = Promise.resolve();
            }

            const result = await action;
            setLastAnswer(result);
            if (method.value === "account.list") {
                setAccounts(result);
                if (result.length) {
                    setAccount(result[0])
                }
            }
        }
    }, [method, account, rawPayload])

    const handleMethodChange = useCallback((option) => {
        setMethod(option);

    }, [setMethod]);

    const handleAccountChange = useCallback((option) => {
        setAccount(option);
        console.log(option)
    }, [setMethod]);

    const handlePayloadChange = useCallback((event) => {
        setRawPayload(event.target.value);

    }, [setRawPayload]);

    const handlePayloadBlur = useCallback((event) => {

        try {
            const payload = JSON.parse(event.target.value);
            setRawPayload(JSON.stringify(payload, null, 2));
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
                            getOptionLabel={option => `${option.name} (${option.freshAddress})`}
                            value={account}
                        />
                    </Field>

                </Row>
                <Field>
                    Payload:
                    <TextArea onChange={handlePayloadChange} onBlur={handlePayloadBlur} value={rawPayload}></TextArea>
                </Field>
                <button onClick={execute}>EXECUTE</button>
            </ToolBar>

            <Output>{JSON.stringify(lastAnswer, null, 2)}</Output>
        </AppLoaderPageContainer>
    );
}

const AppLoaderPage = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (mounted) {
        return (
            <DebugApp/>
        );
    }

    return null;
};

export default AppLoaderPage;
