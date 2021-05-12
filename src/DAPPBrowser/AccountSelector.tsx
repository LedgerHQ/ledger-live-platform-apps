import Select from "react-select";
import React, { useMemo, useCallback } from "react";
import { useTheme, DefaultTheme } from "styled-components";
import Color from "color";

import {Account} from "../../lib/types";
import {Option} from "react-select/src/filters";

const getSelectStyles = (theme: DefaultTheme) => ({
    control: (provided: any) => ({
        ...provided,
        width: 400,
        backgroundColor: "transparent",
    }),
    singleValue: (provided: any) => ({
        ...provided,
        fontSize: 12,
        color: theme.colors.text,
    }),
    indicatorsContainer: (provided: any) => ({
        ...provided,
        color: "red",
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: theme.colors.background,
    }),
    option: (provided: any, { isFocused, isSelected }: { isFocused: boolean, isSelected: boolean }) => ({
        ...provided,
        fontSize: 12,
        color: isSelected ? "#fff" : theme.colors.text,
        backgroundColor: isSelected
            ? new Color(theme.colors.primary).alpha(isFocused ? 0.8 : 1).string()
            : isFocused
                ? new Color(theme.colors.primary).alpha(0.1).string()
                : "transparent",
    })
});

type AccountSelectorProps = {
    accounts: Account[],
    onAccountChange: (account: Account | undefined) => void,
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
    const theme = useTheme();
    const options = useMemo(() => accounts.map(account => fromAccountToOption(account)), [accounts]);
    const value = useMemo(() => selectedAccount ? fromAccountToOption(selectedAccount) : undefined, [selectedAccount]);

    const styles = useMemo(() => getSelectStyles(theme), [theme]);

    const handleOnChange = useCallback((option: Option | null) => {
        const newSelectedAccount = option ? accounts.find(account => account.address === option.value) : undefined;
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