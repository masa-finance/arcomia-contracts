// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@masa-finance/masa-contracts-identity/contracts/SoulStore.sol";

/// @title Soul Store
/// @author Masa Finance
/// @notice Soul Store, that can mint new Soulbound Identities and Soul Name NFTs, paying a fee
/// @dev From this smart contract we can mint new Soulbound Identities and Soul Name NFTs.
/// This minting can be done paying a fee in ETH, USDC or MASA
contract ArcomiaSoulStore is SoulStore {
    /* ========== STATE VARIABLES ========== */

    /* ========== INITIALIZE ========== */

    /// @notice Creates a new Soul Store
    /// @dev Creates a new Soul Store, that has the role to minting new Soulbound Identities
    /// and Soul Name NFTs, paying a fee
    /// @param admin Administrator of the smart contract
    /// @param _soulboundIdentity Address of the Soulbound identity contract
    /// @param _soulName Address of the Soul Name NFT contract
    /// @param _nameRegistrationPricePerYear Price of the default name registering in stable coin per year
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        ISoulboundIdentity _soulboundIdentity,
        ISoulName _soulName,
        uint256 _nameRegistrationPricePerYear,
        PaymentParams memory paymentParams
    )
        SoulStore(
            admin,
            _soulboundIdentity,
            _soulName,
            _nameRegistrationPricePerYear,
            paymentParams
        )
    {}

    /* ========== RESTRICTED FUNCTIONS ========== */

    /* ========== MUTATIVE FUNCTIONS ========== */

    /* ========== VIEWS ========== */

    /* ========== PRIVATE FUNCTIONS ========== */

    /* ========== MODIFIERS ========== */

    /* ========== EVENTS ========== */
}
