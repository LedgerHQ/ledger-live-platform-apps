import React, { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import Image from 'next/image'

import LedgerLiveApi from '../lib/LedgerLiveApiSdk';
import WindowMessageTransport from '../lib/WindowMessageTransport';
import { Account, Currency } from "../lib/types";

import Button from './components/Button';

const SUPPORTED_CURRENCIES = ["ethereum", "bitcoin"];

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 340px;
  align-items: stretch;
  justify-content: center;

  > * {
    margin-bottom: 8px;
  }
  
  > *:last-child {
    margin-bottom: 0;
  }
`
const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
`

const SubmitButtom = styled(Button)`
  flex-grow: 1;
`

const AccountDisplay = styled.div`
  border-color: ${p => p.theme.colors.text};
  border-width: 1px;
  border-style: solid;
  border-radius: 4px;
  padding: 12px 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
`

function useDeviceToken() {
  const [deviceToken, setDeviceToken] = useState(window.localStorage.getItem("DEVICE_TOKEN"));

  useEffect(() => {
    if (!deviceToken) {
      let array = new Uint8Array(25);
      window.crypto.getRandomValues(array);
      const token = Array.prototype.map
          .call(array, x => ("00" + x.toString(16)).slice(-2))
          .join("");
      window.localStorage.setItem("DEVICE_TOKEN", token);
  
      setDeviceToken(token);
    }
  }, [deviceToken]);


  return deviceToken;
}

const getWyre = (deviceToken: string, account: Account, currencies: Currency[]) => {
  const currency = currencies.find(currency => currency.id === account.currency);
  console.log(currencies, currency);
  if (!currency) {
    throw new Error('currency not found for account');
  }

  // @ts-ignore
  return new window.Wyre({
    env: "test",
    auth: {
      type: "secretKey",
      secretKey: deviceToken
    },
    operation: {
      type: "onramp",
      destCurrency: currency.ticker,
      dest: `${account.currency}:${account.address.toLowerCase()}`,
    },
    onExit: function (error: Error | null) {
      if (error !== null) {
        console.error(error)
      } else {
        console.log('exited!')
      }
    },
    onSuccess: function () {
      console.log("success!")
    }
  });
}

export function WyreApp() {
  const api = useRef<LedgerLiveApi | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const deviceToken = useDeviceToken();


  const selectAccount = useCallback(async () => {
    if (api.current) {
      try {
        const account = await api.current.requestAccount({ allowAddAccount: true, currencies: SUPPORTED_CURRENCIES });
        setAccount(account);
      } catch (error) {
        // ignore error
      }
    }
  }, [api.current, account]);
  console.log("coucou")
  const submit = useCallback(async () => {
    console.log("submit")
    if (api.current && deviceToken && account && currencies.length) {
      try {
        const address = await api.current.receive(account.id);
        console.log("received", address, account)
        if (account.address === address) {
          console.log("Verified address", address);
          try {
            getWyre(deviceToken, account, currencies).open();
            console.log("Wyred")
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        // ignore error
      }
    }
  }, [getWyre, api.current, deviceToken, currencies, account]);

  useEffect(() => {
    const llapi = new LedgerLiveApi(new WindowMessageTransport());

    llapi.connect();
    llapi.listCurrencies()
      .then((currencies) => setCurrencies(currencies))
      .then(() => {
        api.current = llapi;
      });

    return () => {
      api.current = null;
      void llapi.disconnect();
    }
  }, []);

  return (
  <>
    <Container>
      
      <Panel>
        <Logo>
            <Image src="/icons/wyre.svg" width={96} height={96} />
        </Logo>
        {account
          ? <>
            <AccountDisplay>{account.name}</AccountDisplay>
            <SubmitButtom transparent onClick={selectAccount}>Change Account</SubmitButtom>
          </>
          : <SubmitButtom onClick={selectAccount}>Select Account</SubmitButtom>
        }
        <SubmitButtom disabled={!account} onClick={submit}>Continue</SubmitButtom>
      </Panel>
    </Container>
  </>);
}
