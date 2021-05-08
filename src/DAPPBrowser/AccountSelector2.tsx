import React from "react";
import {Account} from "../../lib/types";
import styled from "styled-components";

type AccountSelectorProps = {
    selectedAccount: Account | undefined,
    onAccountChange: () => void,
};

const AccountButton = styled.button`
  
`

export function AccountSelector({ onAccountChange, selectedAccount }: AccountSelectorProps) {
    return (
        <AccountButton
            onClick={onAccountChange}
        >
            {selectedAccount ? selectedAccount.address : null}
        </AccountButton>
    )
}