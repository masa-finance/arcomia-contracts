// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@masa-finance/masa-contracts-identity/contracts/tokens/MasaSBTSelfSovereign.sol";

/// @title Soulbound Arcomia OG Community SBT
/// @author Masa Finance
/// @notice Soulbound token that represents an Arcomia OG Community SBT
/// @dev Inherits from the SBT contract.
contract ArcomiaOGCommunitySBT is MasaSBTSelfSovereign, ReentrancyGuard {
    error SBTAlreadyCreated(address to);

    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new Arcomia OG Community SBT
    /// @dev Creates a new Arcomia OG Community SBT, inheriting from the SBT contract.
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    /// @param paymentParams Payment gateway params
    /// @param maxSBTToMint Maximum number of SBT that can be minted
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address soulboundIdentity,
        PaymentParams memory paymentParams,
        uint256 maxSBTToMint
    )
        MasaSBTSelfSovereign(
            admin,
            name,
            symbol,
            baseTokenURI,
            soulboundIdentity,
            paymentParams,
            maxSBTToMint
        )
        EIP712("ArcomiaOGCommunitySBT", "1.0.0")
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @param authorityAddress Address of the authority that signed the message
    /// @param signatureDate Date of the signature
    /// @param signature Signature of the message
    /// @return The NFT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        uint256 identityId,
        address authorityAddress,
        uint256 signatureDate,
        bytes calldata signature
    ) public payable virtual nonReentrant returns (uint256) {
        address to = soulboundIdentity.ownerOf(identityId);
        if (balanceOf(to) > 0) revert SBTAlreadyCreated(to);
        if (to != _msgSender()) revert CallerNotOwner(_msgSender());

        uint256 tokenId = _mintWithCounter(
            paymentMethod,
            to,
            _hash(identityId, authorityAddress, signatureDate),
            authorityAddress,
            signatureDate,
            signature
        );

        emit MintedToIdentity(
            tokenId,
            identityId,
            authorityAddress,
            signatureDate,
            paymentMethod,
            mintPrice
        );

        return tokenId;
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param to The address to mint the SBT to
    /// @param authorityAddress Address of the authority that signed the message
    /// @param signatureDate Date of the signature
    /// @param signature Signature of the message
    /// @return The SBT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        address to,
        address authorityAddress,
        uint256 signatureDate,
        bytes calldata signature
    ) external payable virtual returns (uint256) {
        if (balanceOf(to) > 0) revert SBTAlreadyCreated(to);
        if (to != _msgSender()) revert CallerNotOwner(_msgSender());

        uint256 tokenId = _mintWithCounter(
            paymentMethod,
            to,
            _hash(to, authorityAddress, signatureDate),
            authorityAddress,
            signatureDate,
            signature
        );

        emit MintedToAddress(
            tokenId,
            to,
            authorityAddress,
            signatureDate,
            paymentMethod,
            mintPrice
        );

        return tokenId;
    }

    /* ========== VIEWS ===================================================== */

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        return _baseURI();
    }

    /* ========== PRIVATE FUNCTIONS ========================================= */

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */
}
