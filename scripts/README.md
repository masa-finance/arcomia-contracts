# Sign and Mint Arcomia SBTs

## Preparation

You need `two` private keys, one of the Authority that is added to the Authorities collection on the Smart Contract.
You need the private key of the receiver of the SBT to actually mint.

In the root folder you need to run:

- `yarn`
- `yarn build`

to create the typechain proxies that are required for contract interaction.

## Sign

```zsh
# export the private key of the authority first
export PRIVATE_KEY=0x<private key one>

$ ts-node ./scripts/sign.ts

Current wallet 0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F
Arcomia OG SBT
{
  domain: {
    name: 'ArcomiaOGCommunitySBT',
    version: '1.0.0',
    chainId: 80001,
    verifyingContract: '0x5B4715cDC765DcD5860986c1A06d51E06ee24439'
  },
  types: '{"Mint":[{"name":"to","type":"address"},{"name":"authorityAddress","type":"address"},{"name":"signatureDate","type":"uint256"}]}',
  value: {
    to: '0x8ba2D360323e3cA85b94c6F7720B70aAc8D37a7a',
    authorityAddress: '0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F',
    signatureDate: 1678803572720
  },
  signature: '0x753406e4958cb75dd73657c5c3914bd4818a42208e0ba3e20f2b4edd2ee69317630d200ded180a8fb329aeb5929d2e8233517ab4c7a86e343b4c9832dc0b8d471c',
  authorityAddress: '0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F'
}
{
  recoveredAddress: '0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F',
  authorityAddress: '0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F'
}
{ recoveredAddressIsAuthority: true }
{
  signature: '0x753406e4958cb75dd73657c5c3914bd4818a42208e0ba3e20f2b4edd2ee69317630d200ded180a8fb329aeb5929d2e8233517ab4c7a86e343b4c9832dc0b8d471c',
  authorityAddress: '0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F',
  signatureDate: 1678803572720
}
```

now copy over the signature, authority address and signature date to the `mint.ts` file

```typescript
void mint(
  "0x753406e4958cb75dd73657c5c3914bd4818a42208e0ba3e20f2b4edd2ee69317630d200ded180a8fb329aeb5929d2e8233517ab4c7a86e343b4c9832dc0b8d471c",
  "0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F",
  1678803572720
);
```

## Mint

Now do the minting. This has to run in the context of the receiving user. Usually the user does not have access to the authority and the authority does not have access to the receivers private key.

```zsh
# export the private key of the minter
export PRIVATE_KEY=0x<private key two>

$ ts-node ./scripts/mint.ts
Current wallet 0x8ba2D360323e3cA85b94c6F7720B70aAc8D37a7a
Arcomia OG SBT
{
  domain: {
    name: 'ArcomiaOGCommunitySBT',
    version: '1.0.0',
    chainId: 80001,
    verifyingContract: '0x5B4715cDC765DcD5860986c1A06d51E06ee24439'
  },
  types: '{"Mint":[{"name":"to","type":"address"},{"name":"authorityAddress","type":"address"},{"name":"signatureDate","type":"uint256"}]}',
  value: {
    to: '0x8ba2D360323e3cA85b94c6F7720B70aAc8D37a7a',
    authorityAddress: '0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F',
    signatureDate: 1678803572720
  },
  signature: '0x753406e4958cb75dd73657c5c3914bd4818a42208e0ba3e20f2b4edd2ee69317630d200ded180a8fb329aeb5929d2e8233517ab4c7a86e343b4c9832dc0b8d471c',
  authorityAddress: '0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F'
}
{
  recoveredAddress: '0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F',
  authorityAddress: '0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F'
}
{ recoveredAddressIsAuthority: true }
Arcomia OG SBT
{
  price: '0',
  paymentAddress: '0x0000000000000000000000000000000000000000',
  formattedPrice: '0.0'
}
{
  paymentAddress: '0x0000000000000000000000000000000000000000',
  price: BigNumber { _hex: '0x00', _isBigNumber: true }
}
{
  mintParameters: [
    '0x0000000000000000000000000000000000000000',
    '0x8ba2D360323e3cA85b94c6F7720B70aAc8D37a7a',
    '0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F',
    1678803572720,
    '0x753406e4958cb75dd73657c5c3914bd4818a42208e0ba3e20f2b4edd2ee69317630d200ded180a8fb329aeb5929d2e8233517ab4c7a86e343b4c9832dc0b8d471c'
  ],
  mintOverrides: { value: BigNumber { _hex: '0x00', _isBigNumber: true } }
}
Waiting for transaction '0xeeed4486486b8075330196cb1f8414336392cc1004eab63ddf36da399277e2a8' to finalize!
minted in block: 33105447
```

Tada we have our SBT: [transaction](https://mumbai.polygonscan.com/tx/0xeeed4486486b8075330196cb1f8414336392cc1004eab63ddf36da399277e2a8)