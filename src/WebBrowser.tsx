import React from "react";
import styled, { keyframes } from "styled-components";
import CSSTransition from "react-transition-group/CSSTransition";

import type { Account } from "ledger-live-platform-sdk";
import LedgerLiveApi, {
  Mock as LedgerLiveApiMock,
  WindowMessageTransport,
} from "ledger-live-platform-sdk";

import AccountSelector from "./components/AccountSelector";
import AccountRequest from "./components/AccountRequest";
import ControlBar from "./components/ControlBar";

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
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

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
`;

const Container = styled.div`
  width: 100%;
  flex: 1;
  position: relative;
`;

const Iframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
`;

type WebBrowserProps = {
  webUrl: string;
  webAppName: string;
  currencies: string[];
  mock?: boolean;
  initialAccountId: string | undefined;
};

type WebBrowserState = {
  accounts: Account[];
  selectedAccount: Account | undefined;
  clientLoaded: boolean;
  fetchingAccounts: boolean;
  connected: boolean;
};

const getInitialState = (): WebBrowserState => {
  return {
    accounts: [],
    selectedAccount: undefined,
    clientLoaded: false,
    fetchingAccounts: false,
    connected: false,
  };
};

export class WebBrowser extends React.Component<
  WebBrowserProps,
  WebBrowserState
> {
  ledgerAPI: LedgerLiveApi | LedgerLiveApiMock;
  iframeRef = React.createRef<HTMLIFrameElement>();

  constructor(props: WebBrowserProps) {
    super(props);
    this.state = getInitialState();

    this.setClientLoaded = this.setClientLoaded.bind(this);
    this.selectAccount = this.selectAccount.bind(this);
    this.requestAccount = this.requestAccount.bind(this);
    this.fetchAccounts = this.fetchAccounts.bind(this);
    this.getUrl = this.getUrl.bind(this);

    this.ledgerAPI = props.mock
      ? new LedgerLiveApiMock()
      : new LedgerLiveApi(new WindowMessageTransport());
  }

  async fetchAccounts() {
    this.setState({
      fetchingAccounts: true,
    });
    const currencies = this.props.currencies || [];
    const accounts = await this.ledgerAPI.listAccounts();
    const filteredAccounts = currencies.length
      ? accounts.filter(
          (account: Account) => currencies.indexOf(account.currency) > -1
        )
      : accounts;

    const initialAccount = this.props.initialAccountId
      ? accounts.find(
          (account: Account) => account.id === this.props.initialAccountId
        )
      : undefined;
    const storedAccountId: string | null =
      typeof window !== "undefined" ? localStorage.getItem("accountId") : null;
    const storedAccount =
      storedAccountId !== null
        ? accounts.find((account: Account) => account.id === storedAccountId)
        : undefined;

    const selectedAccount =
      filteredAccounts.length > 0
        ? initialAccount || storedAccount || filteredAccounts[0]
        : undefined;

    this.setState({
      accounts: filteredAccounts,
      fetchingAccounts: false,
      selectedAccount,
    });
  }

  async requestAccount() {
    try {
      const currencies = this.props.currencies;
      const payload = currencies.length
        ? {
            currencies,
          }
        : {};
      const account = await this.ledgerAPI.requestAccount(payload);
      this.selectAccount(account);
    } catch (error) {
      // TODO: handle error
    }
  }

  async componentDidMount() {
    this.ledgerAPI.connect();

    await this.fetchAccounts();

    this.setState({
      connected: true,
    });
  }

  componentWillUnmount() {
    this.setState({
      connected: false,
    });
  }

  selectAccount(account: Account | undefined) {
    if (account) {
      if (typeof window !== "undefined") {
        localStorage.setItem("accountId", account.id);
      }
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

  getUrl() {
    const { selectedAccount } = this.state;
    const { webUrl } = this.props;

    if (!selectedAccount) return "";

    return webUrl.replace("{account.address}", selectedAccount.address);
  }

  render() {
    const {
      accounts,
      clientLoaded,
      fetchingAccounts,
      connected,
      selectedAccount,
    } = this.state;

    const { webAppName } = this.props;

    const url = this.getUrl();

    return (
      <AppLoaderPageContainer>
        {!!accounts.length && (
          <ControlBar desktop>
            <AccountSelector
              selectedAccount={selectedAccount}
              accounts={accounts}
              onAccountChange={this.selectAccount}
            />
          </ControlBar>
        )}
        <Container>
          <CSSTransition in={clientLoaded} timeout={300} classNames="overlay">
            <Overlay>
              <Loader>
                {!connected
                  ? "Connecting ..."
                  : fetchingAccounts
                  ? "Loading accounts ..."
                  : accounts.length === 0
                  ? "You don't have any accounts"
                  : `Loading ${webAppName} ...`}
              </Loader>
            </Overlay>
          </CSSTransition>
          {connected && url ? (
            <Iframe
              ref={this.iframeRef}
              src={url}
              onLoad={this.setClientLoaded}
            />
          ) : null}
        </Container>
        {!!accounts.length && (
          <ControlBar mobile>
            <AccountRequest
              selectedAccount={selectedAccount}
              onRequestAccount={this.requestAccount}
            />
          </ControlBar>
        )}
      </AppLoaderPageContainer>
    );
  }
}
