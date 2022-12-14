// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

import "./libraries/Errors.sol";
import "./tokens/MasaSBTSelfSovereign.sol";

/// @title Soulbound Credit Score
/// @author Masa Finance
/// @notice Soulbound token that represents a credit score.
/// @dev Soulbound credit score, that inherits from the SBT contract.
contract SoulboundCreditScore is MasaSBTSelfSovereign {
    /* ========== STATE VARIABLES =========================================== */

    /* ========== INITIALIZE ================================================ */

    /// @notice Creates a new soulbound credit score
    /// @dev Creates a new soulbound credit score, inheriting from the SBT contract.
    /// @param admin Administrator of the smart contract
    /// @param baseTokenURI Base URI of the token
    /// @param soulboundIdentity Address of the SoulboundIdentity contract
    /// @param _mintingPrice Price of minting in stable coin
    /// @param paymentParams Payment gateway params
    constructor(
        address admin,
        string memory baseTokenURI,
        ISoulboundIdentity soulboundIdentity,
        uint256 _mintingPrice,
        PaymentParams memory paymentParams
    )
        MasaSBTSelfSovereign(
            admin,
            "Masa Credit Score",
            "MCS",
            baseTokenURI,
            soulboundIdentity,
            _mintingPrice,
            paymentParams
        )
        EIP712("SoulboundCreditScore", "1.0.0")
    {}

    /* ========== RESTRICTED FUNCTIONS ====================================== */

    /* ========== MUTATIVE FUNCTIONS ======================================== */

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param identityId TokenId of the identity to mint the NFT to
    /// @return The NFT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        uint256 identityId,
        address authorityAddress,
        uint256 signatureDate,
        bytes calldata signature
    ) public payable virtual returns (uint256) {
        address to = soulboundIdentity.ownerOf(identityId);
        if (to != _msgSender()) revert CallerNotOwner(_msgSender());
        require(balanceOf(to) < 1, "CREDITSCORE_ALREADY_CREATED");

        _verify(
            _hash(identityId, authorityAddress, signatureDate),
            signature,
            authorityAddress
        );

        _pay(paymentMethod, mintingPrice);

        uint256 tokenId = _mintWithCounter(to);

        emit SoulboundCreditScoreMinted(
            tokenId,
            identityId,
            authorityAddress,
            signatureDate,
            paymentMethod,
            mintingPrice
        );

        return tokenId;
    }

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param paymentMethod Address of token that user want to pay
    /// @param to The address to mint the SBT to
    /// @return The SBT ID of the newly minted SBT
    function mint(
        address paymentMethod,
        address to,
        address authorityAddress,
        uint256 signatureDate,
        bytes calldata signature
    ) public payable virtual returns (uint256) {
        uint256 identityId = soulboundIdentity.tokenOfOwner(to);

        return
            mint(
                paymentMethod,
                identityId,
                authorityAddress,
                signatureDate,
                signature
            );
    }

    /* ========== VIEWS ===================================================== */

    /* ========== PRIVATE FUNCTIONS ========================================= */

    function _hash(
        uint256 identityId,
        address authorityAddress,
        uint256 signatureDate
    ) internal view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "MintCreditScore(uint256 identityId,address authorityAddress,uint256 signatureDate)"
                        ),
                        identityId,
                        authorityAddress,
                        signatureDate
                    )
                )
            );
    }

    /* ========== MODIFIERS ================================================= */

    /* ========== EVENTS ==================================================== */

    event SoulboundCreditScoreMinted(
        uint256 tokenId,
        uint256 identityId,
        address authorityAddress,
        uint256 signatureDate,
        address paymentMethod,
        uint256 mintingPrice
    );
}
