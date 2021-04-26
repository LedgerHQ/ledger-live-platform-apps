import Select from "react-select";
import React, { useMemo, useCallback } from "react";
import {Account} from "./types";
import {Option} from "react-select/src/filters";

const styles = {
    control: (provided: any) => ({
        ...provided,
        width: 400,
        backgroundColor: "black",
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: "white",
        fontSize: 12
    }),
    indicatorsContainer: (provided: any) => ({
        ...provided,
        color: "white",
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: "black",
    }),
    option: (provided: any) => ({
        ...provided,
        fontSize: 12,
        backgroundColor: "rgba(0, 0, 0, 0.1)"
    })
}

type AccountSelectorProps = {
    accounts: Account[],
    onAccountChange: (Account) => void,
    selectedAccount: Account | undefined,
};

function fromAccountToOption(account: Account): Option {
    return {
        label: `${account.name} (${account.address})`,
        value: account.address,
        data: {
            balance: account.balance,
        },
    }
}

export function AccountSelector({ accounts, onAccountChange, selectedAccount }: AccountSelectorProps) {
    const options = useMemo(() => accounts.map(account => fromAccountToOption(account)), [accounts]);
    const value = useMemo(() => selectedAccount ? fromAccountToOption(selectedAccount) : undefined, [selectedAccount]);

    const handleOnChange = useCallback((option: Option) => {
        const newSelectedAccount = accounts.find(account => account.address === option.value);
        onAccountChange(newSelectedAccount);
    }, [accounts, onAccountChange])

    return (
        <Select
            options={options}
            styles={styles}
            onChange={handleOnChange}
            value={value}
        />
    )
}