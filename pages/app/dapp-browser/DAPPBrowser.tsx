import React, {useCallback, useRef, useState} from "react";
import styled from "styled-components";
import {AccountSelector} from "./AccountSelector";

import { accounts as mockAccounts } from "./mocks";
import {JSONRPCServer} from "json-rpc-2.0";
import {LedgerAPI} from "./LedgerAPI";
import {SmartWebsocket} from "./SmartWebsocket";
import {Account} from "./types";

const AppLoaderPageContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const DappBrowserTopBar = styled.div`
  box-sizing: border-box;
  background-color: black;
  color: white;
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DappIframe = styled.iframe.attrs(({ visible }) => ({
    style: {
        opacity: visible ? 1 : 0,
    }
}))`
    width: 100%;
    transition: opacity ease-out 300ms;
    flex: 1;
    border: 0;
`;

type DAPPBrowserProps = {
    dappUrl: string,
    dappName: string,
    pluginName: string,
    nodeUrl: string,
}

type DAPPBrowserState = {
    accounts: Account[],
    selectedAccount: Account | undefined,
    clientLoaded: boolean,
}

const initialState = {
    accounts: [],
    selectedAccount: undefined,
    clientLoaded: false,
}

export class DAPPBrowser extends React.Component<DAPPBrowserProps, DAPPBrowserState> {
    jsonRPC: JSONRPCServer;
    ledgerAPI: LedgerAPI;
    websocket: SmartWebsocket;
    iframeRef = React.createRef<HTMLIFrameElement | null>();


    constructor(props: DAPPBrowserProps) {
        super(props);
        this.state = initialState;

        this.receiveDAPPMessage = this.receiveDAPPMessage.bind(this);
        this.setClientLoaded = this.setClientLoaded.bind(this);
        this.selectAccount = this.selectAccount.bind(this);

        this.websocket = new SmartWebsocket(props.nodeUrl);
        this.ledgerAPI = new LedgerAPI();
        this.jsonRPC = new JSONRPCServer();

        this.jsonRPC.addMethod("eth_requestAccounts", async () => {
            return this.state.selectedAccount ? [this.state.selectedAccount.address] : []
        })

        this.jsonRPC.addMethod("eth_accounts", async () => {
            return this.state.selectedAccount ? [this.state.selectedAccount.address] : []
        })
    }

    private async receiveDAPPMessage(event: MessageEvent) {
        const dappURL = new URL(this.props.dappUrl);

        if (event.origin === dappURL.origin && event.source && !(event.source instanceof MessagePort) && !(event.source instanceof ServiceWorker)) {
            const data = event.data;
            console.log("RECEIVED FROM DAPP: ", data)

            switch (data.method) {
                case "eth_requestAccounts": {
                    event.source.postMessage({
                        "id": data.id,
                        "jsonrpc": "2.0",
                        "result": this.state.selectedAccount ? [this.state.selectedAccount.address] : []
                    }, event.origin);
                    break;
                }
                case "eth_accounts": {
                    event.source.postMessage({
                        "id": data.id,
                        "jsonrpc": "2.0",
                        "result": this.state.selectedAccount ? [this.state.selectedAccount.address] : []
                    }, event.origin);
                    break;
                }
                // this.state.selectedAccount ? [this.state.selectedAccount.address] : []
                default: {
                    this.websocket.send(data);                }
            }

            const answer = await this.jsonRPC.receive(data);
            console.log({answer});
            return;

            if (answer.error && answer.error.code === -32601) {
                this.websocket.send(data);
            }
            event.source.postMessage(answer, event.origin);
        }
    }

    componentDidMount() {
        const dappURL = new URL(this.props.dappUrl);

        this.setState({
            accounts: mockAccounts,
            selectedAccount: mockAccounts[0],
        })
        window.addEventListener("message", this.receiveDAPPMessage, false);
        this.websocket.on("message", message => {
            if (this.iframeRef.current && "contentWindow" in this.iframeRef.current) {
                console.log("from infura: ", message);
                this.iframeRef.current.contentWindow.postMessage(message, dappURL.origin);
            }
        });
        this.websocket.connect();
    }

    componentWillUnmount() {
        window.removeEventListener("message", this.receiveDAPPMessage, false);
    }

    selectAccount(account: Account | undefined) {
        const dappURL = new URL(this.props.dappUrl);

        if (this.iframeRef.current && this.iframeRef.current.contentWindow && account) {
            this.iframeRef.current.contentWindow.postMessage({
                "jsonrpc": "2.0",
                "method": "accountsChanged",
                "params": [
                    [account.address]
                ]
            }, dappURL.origin);
        }

        this.setState({
            selectedAccount: account,
        });
    }

    setClientLoaded() {
        this.setState({
            clientLoaded: true,
        });
    }

    render() {
        const {
            accounts,
            selectedAccount,
            clientLoaded,
        } = this.state;

        const {
            dappUrl,
        } = this.props;

        return (
            <AppLoaderPageContainer>
                <DappBrowserTopBar>
                    Ledger DAPP Browser
                    <AccountSelector
                        accounts={accounts}
                        onAccountChange={this.selectAccount}
                        selectedAccount={selectedAccount}
                    />
                </DappBrowserTopBar>
                <DappIframe
                    visible={clientLoaded}
                    ref={this.iframeRef}
                    src={dappUrl}
                    onLoad={this.setClientLoaded}
                />
            </AppLoaderPageContainer>
        )
    }
}
