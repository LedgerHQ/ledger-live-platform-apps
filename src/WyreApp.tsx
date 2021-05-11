import React, { useEffect, useRef, useState, useCallback } from "react";
import LedgerLiveApi from '../lib/LedgerLiveApiSdk';
import WindowMessageTransport from '../lib/WindowMessageTransport';
import { Account, Currency } from "../lib/types";

const SUPPORTED_CURRENCIES = ["ethereum", "bitcoin"];

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
  console.log({
    type: "onramp",
    destCurrency: currency.ticker,
    dest: `${account.currency}:${account.address.toLowerCase()}`,
},)
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
            alert("errored!")
            
            console.error(error)
        } else {
            console.log('exited!')
            alert("exited!")
        }
    },
    onSuccess: function () {
        console.log("success!")
        alert("successed!")
    }
  });
}

export function WyreApp() {
  const api = useRef<LedgerLiveApi | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const deviceToken = useDeviceToken();


  const selectAccount = useCallback(() => {
    if (api.current && deviceToken && currencies.length) {
      api.current.requestAccount({ allowAddAccount: true, currencies: SUPPORTED_CURRENCIES })
        .then(account => account && getWyre(deviceToken, account, currencies).open(), () => {});
    }
  }, [deviceToken, currencies]);

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

  useEffect(() => {
    selectAccount();
  }, [api.current])

  return (
  <>
    <div>
      <button onClick={selectAccount}>Select Account</button>
    </div>
  </>);
}
