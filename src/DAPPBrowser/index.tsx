import React from "react";
import styled, { keyframes } from "styled-components";
import {AccountSelector} from "./AccountSelector";
import LedgerLiveApi from '../../lib/LedgerLiveApiSdk';
import LedgerLiveApiMock from '../../lib/LedgerLiveApiSdkMock';
import WindowMessageTransport from '../../lib/WindowMessageTransport';

import {SmartWebsocket} from "./SmartWebsocket";
import CSSTransition from "react-transition-group/CSSTransition";
import {convertEthToLiveTX} from "./helper";
import {JSONRPCRequest, JSONRPCResponse} from "json-rpc-2.0";
import {Account} from "../../lib/types";

const loading = keyframes`
  0% { opacity:0.8; }
  50% { opacity:0.4; }
  100% { opacity:0.8; }
`;

const AppLoaderPageContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Loader = styled.div`
  animation: ${loading} 1s ease-in-out infinite;
`

const Overlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  
  &.overlay-enter {
    opacity: 1;
  }
  &.overlay-enter-active {
    opacity: 0;
    transition: opacity 300ms;
  }
  &.overlay-enter-done {
    display: none;
    opacity: 0;
  }
  &.overlay-exit {
    opacity: 0;
  }
  &.overlay-exit-active {
    opacity: 1;
    transition: opacity 200ms;
  }
  &.overlay-exit-done {
    opacity: 1;
  }
`

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

const DappContainer = styled.div`
  width: 100%;
  flex: 1;
  position: relative;
`;

const DappIframe = styled.iframe`
    width: 100%;
    height: 100%;
    border: 0;
`;

type DAPPBrowserProps = {
    dappUrl: string,
    dappName: string,
    pluginName: string,
    nodeUrl: string,
    mock?: boolean,
}

type DAPPBrowserState = {
    accounts: Account[],
    selectedAccount: Account | undefined,
    clientLoaded: boolean,
    fetchingAccounts: boolean,
    connected: boolean,
}

const initialState = {
    accounts: [],
    selectedAccount: undefined,
    clientLoaded: false,
    fetchingAccounts: false,
    connected: false,
}

export class DAPPBrowser extends React.Component<DAPPBrowserProps, DAPPBrowserState> {
    ledgerAPI: LedgerLiveApi | LedgerLiveApiMock;
    websocket: SmartWebsocket;
    iframeRef = React.createRef<HTMLIFrameElement>();


    constructor(props: DAPPBrowserProps) {
        super(props);
        this.state = initialState;

        this.receiveDAPPMessage = this.receiveDAPPMessage.bind(this);
        this.setClientLoaded = this.setClientLoaded.bind(this);
        this.selectAccount = this.selectAccount.bind(this);
        this.fetchAccounts = this.fetchAccounts.bind(this);

        this.websocket = new SmartWebsocket(props.nodeUrl);
        this.ledgerAPI = props.mock ? new LedgerLiveApiMock() : new LedgerLiveApi(new WindowMessageTransport())
    }

    private sendMessageToDAPP(message: JSONRPCResponse| JSONRPCRequest) {
        const dappURL = new URL(this.props.dappUrl);

        if (this.iframeRef.current && this.iframeRef.current.contentWindow) {
            this.iframeRef.current.contentWindow.postMessage(message, dappURL.origin);
        }
    }

    private async receiveDAPPMessage(event: MessageEvent) {
        const {
            selectedAccount,
        } = this.state;

        const dappURL = new URL(this.props.dappUrl);

        if (event.origin === dappURL.origin) {
            const data = event.data;

            console.log(`MESSAGE FROM APP ${data.method}`, data);

            switch (data.method) {
                case "eth_requestAccounts": {
                    this.sendMessageToDAPP({
                        "id": data.id,
                        "jsonrpc": "2.0",
                        "result": selectedAccount ? [selectedAccount.address] : []
                    });
                    break;
                }
                case "eth_accounts": {
                    this.sendMessageToDAPP({
                        "id": data.id,
                        "jsonrpc": "2.0",
                        "result": selectedAccount ? [selectedAccount.address] : []
                    });
                    break;
                }
                case "eth_sendTransaction": {
                    const ethTX = data.params[0];
                    const tx = convertEthToLiveTX(ethTX);
                    const fromAccount = this.state.accounts.find(account => account.address.toLowerCase() === ethTX.from.toLowerCase());
                    if (fromAccount) {
                        try {
                            const signedTransaction = await this.ledgerAPI.signTransaction(fromAccount.id, tx);
                            console.log("got signedTransaction from llApi", signedTransaction)
                            const operation = await this.ledgerAPI.broadcastSignedTransaction(fromAccount.id, signedTransaction);
                            this.sendMessageToDAPP({
                                "id": data.id,
                                "jsonrpc": "2.0",
                                "result": operation.hash,
                            });
                        } catch (error) {
                            this.sendMessageToDAPP({
                                "id": data.id,
                                "jsonrpc": "2.0",
                                "error": {
                                    "code": 3,
                                    "message": "Transaction declined",
                                    "data": [{
                                        "code": 104,
                                        "message": "Rejected"
                                    }]
                                }
                            });
                        }
                    }
                    break;
                }
                default: {
                    this.websocket.send(data);
                }
            }
        }
    }

    async fetchAccounts() {
        this.setState({
            fetchingAccounts: true,
        });
        const accounts = await this.ledgerAPI.listAccounts();
        const filteredAccounts = accounts
            .filter((account: any) => account.currency === "ethereum");

        this.setState({
            accounts: filteredAccounts,
            selectedAccount: filteredAccounts.length > 0 ? filteredAccounts[0] : undefined,
            fetchingAccounts: false,
        });
    }

    componentDidMount() {
        window.addEventListener("message", this.receiveDAPPMessage, false);
        this.websocket.on("message", message => {
            this.sendMessageToDAPP(message);
        });

        this.websocket.connect();
        this.ledgerAPI.connect();
        void this.fetchAccounts();

        this.setState({
            connected: true,
        });
    }

    componentWillUnmount() {
        this.setState({
            connected: false,
        })
        window.removeEventListener("message", this.receiveDAPPMessage, false);
        this.websocket.close();
    }

    selectAccount(account: Account | undefined) {
        if (account) {
            this.sendMessageToDAPP({
                "jsonrpc": "2.0",
                "method": "accountsChanged",
                "params": [
                    [account.address]
                ]
            });
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
            fetchingAccounts,
            connected,
        } = this.state;

        const {
            dappUrl,
        } = this.props;

        return (
            <AppLoaderPageContainer>
                <DappBrowserTopBar>
                    Ledger DAPP Browser
                    {
                        accounts.length > 0 ? (
                            <AccountSelector
                                onAccountChange={this.selectAccount}
                                selectedAccount={selectedAccount}
                                accounts={accounts}
                            />
                        ) : null
                    }
                </DappBrowserTopBar>
                <DappContainer>
                    <CSSTransition in={clientLoaded} timeout={300} classNames="overlay">
                        <Overlay>
                            <Loader>
                                {
                                    !connected ? "Connecting ..." : fetchingAccounts ? "Loading accounts ..." : accounts.length === 0 ? "You don't have any accounts" : "Loading DAPP ..."
                                }
                            </Loader>
                        </Overlay>
                    </CSSTransition>
                    {
                        connected && accounts.length > 0 ? (
                            <DappIframe
                                ref={this.iframeRef}
                                src={dappUrl}
                                onLoad={this.setClientLoaded}
                            />
                        ) : null
                    }
                </DappContainer>
            </AppLoaderPageContainer>
        )
    }
}
