import {Account} from "./types";

export const accounts: Account[] = [
    {
        id: "1",
        name: "Account 1",
        address: "0x407d73d8a49eeb85d32cf465507dd71d507100c1",
        balance: 0.45,
    },
    {
        id: "2",
        name: "Savings Account",
        address: "0xcad38ab8336682b6e084ade61c546183c5ef7582",
        balance: 12.87,
    },
    {
        id: "3",
        name: "Account 3",
        address: "0x6bf346da89e93ade5be864b483182eb4190246c4",
        balance: 0.15,
    },
]

export function generateRandomTxID(length: number) {
    const result = [];
    const characters = "0123456789abcdef";
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return "0x" + result.join('');
}