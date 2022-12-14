// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

error AddressDoesNotHaveIdentity(address to);
error AlreadyAdded();
error CallerNotOwner(address caller);
error CreditScoreAlreadyCreated(address to);
error IdentityAlreadyCreated(address to);
error InsufficientEthAmount(uint256 amount);
error InvalidPaymentMethod(address paymentMethod);
error InvalidSignature();
error InvalidToken(address token);
error InvalidTokenURI(string tokenURI);
error NameAlreadyExists(string name);
error NameNotFound(string name);
error NameRegisteredByOtherAccount(string name, uint256 tokenId);
error NotAuthorized(address signer);
error NonExistingErc20Token(address erc20token);
error RefundFailed();
error SameValue();
error SoulNameContractNotSet();
error TokenNotFound(uint256 tokenId);
error TransferFailed();
error URIAlreadyExists(string tokenURI);
error ZeroAddress();
error ZeroLengthName(string name);
error ZeroYearsPeriod(uint256 yearsPeriod);
