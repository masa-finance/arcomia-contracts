// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@masa-finance/masa-contracts-identity/contracts/SoulName.sol";

/// @title SoulName NFT
/// @author Masa Finance
/// @notice SoulName NFT that points to a Soulbound identity token
/// @dev SoulName NFT, that inherits from the NFT contract, and points to a Soulbound identity token.
/// It has an extension, and stores all the information about the identity names.
contract ArcomiaSoulName is SoulName {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new SoulName NFT
    /// @dev Creates a new SoulName NFT, that points to a Soulbound identity, inheriting from the NFT contract.
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param _soulboundIdentity Address of the Soulbound identity contract
    /// @param _extension Extension of the soul name
    /// @param _contractURI URI of the smart contract metadata
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        ISoulboundIdentity _soulboundIdentity,
        string memory _extension,
        string memory _contractURI
    )
        SoulName(
            admin,
            name,
            symbol,
            _soulboundIdentity,
            _extension,
            _contractURI
        )
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
