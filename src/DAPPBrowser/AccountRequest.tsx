import React from "react";
import styled from "styled-components";
import Image from 'next/image'

import { Account } from "../../lib/types";
import Button from "../components/Button";

const Row = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`

const AccountDisplay = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
    white-space: nowrap;
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: 600;
`;

const AccountIcon = styled.div`
    margin-right: 0.4em;
    flex-shrink: 0;
`

const AccountName = styled.span`
overflow: hidden;
    text-overflow: ellipsis;
`

type AccountRequestProps = {
    onRequestAccount: any,
    selectedAccount: Account | undefined,
};

export function AccountRequest({ onRequestAccount, selectedAccount }: AccountRequestProps) {
    return (
        <Row>
            <AccountDisplay>
                <AccountIcon>
                    <Image src="/icons/ethereum.svg" width={24} height={24} />
                </AccountIcon>
                <AccountName>
                    {selectedAccount?.name}
                </AccountName>
            </AccountDisplay>
            <Button transparent small onClick={onRequestAccount}>
                Change account
            </Button>
        </Row>
    )
}
