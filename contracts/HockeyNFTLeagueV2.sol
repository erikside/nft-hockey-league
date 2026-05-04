// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Royalty} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract HockeyNFTLeagueV2 is ERC721Royalty, Ownable, Pausable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant OWNER_RESERVE = 50;
    uint256 public constant PUBLIC_SUPPLY = MAX_SUPPLY - OWNER_RESERVE;
    uint256 public constant MAX_PER_WALLET = 3;

    uint256 public mintPrice;
    uint256 public paidMinted;
    uint256 public reservedMinted;
    uint256 private _nextTokenId = 1;

    bool public whitelistMintActive;
    bool public publicMintActive;
    bytes32 public merkleRoot;
    string private _baseTokenURI;

    mapping(address wallet => uint256 amount) public mintedPerWallet;

    event MintPhasesUpdated(bool whitelistMintActive, bool publicMintActive);
    event MerkleRootUpdated(bytes32 merkleRoot);
    event BaseURIUpdated(string baseURI);
    event MintPriceUpdated(uint256 mintPrice);
    event ReserveMinted(address indexed to, uint256 quantity);
    event DefaultRoyaltyUpdated(address indexed receiver, uint96 feeNumerator);
    event DefaultRoyaltyDeleted();

    error MintClosed();
    error InvalidQuantity();
    error IncorrectPayment();
    error NotWhitelisted();
    error PublicSupplyExceeded();
    error ReserveExceeded();
    error WalletLimitExceeded();
    error ZeroAddress();

    constructor(
        string memory initialBaseURI,
        bytes32 initialMerkleRoot,
        uint256 initialMintPrice,
        address initialOwner,
        address royaltyReceiver,
        uint96 royaltyFeeNumerator
    ) ERC721("HockeyNFTLeagueV2", "HNLV2") Ownable(initialOwner) {
        if (initialOwner == address(0) || royaltyReceiver == address(0)) {
            revert ZeroAddress();
        }

        _baseTokenURI = initialBaseURI;
        merkleRoot = initialMerkleRoot;
        mintPrice = initialMintPrice;
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeNumerator);
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    function paidSupplyRemaining() external view returns (uint256) {
        return PUBLIC_SUPPLY - paidMinted;
    }

    function whitelistMint(uint256 quantity, bytes32[] calldata proof) external payable whenNotPaused nonReentrant {
        if (!whitelistMintActive) {
            revert MintClosed();
        }
        if (!isWhitelisted(msg.sender, proof)) {
            revert NotWhitelisted();
        }

        _paidMint(msg.sender, quantity);
    }

    function publicMint(uint256 quantity) external payable whenNotPaused nonReentrant {
        if (!publicMintActive) {
            revert MintClosed();
        }

        _paidMint(msg.sender, quantity);
    }

    function ownerMint(address to, uint256 quantity) external onlyOwner {
        if (to == address(0)) {
            revert ZeroAddress();
        }
        if (quantity == 0) {
            revert InvalidQuantity();
        }
        if (reservedMinted + quantity > OWNER_RESERVE || totalSupply() + quantity > MAX_SUPPLY) {
            revert ReserveExceeded();
        }

        reservedMinted += quantity;
        _mintSequential(to, quantity);
        emit ReserveMinted(to, quantity);
    }

    function setMintPhases(bool whitelistActive, bool publicActive) external onlyOwner {
        whitelistMintActive = whitelistActive;
        publicMintActive = publicActive;
        emit MintPhasesUpdated(whitelistActive, publicActive);
    }

    function setMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        merkleRoot = newMerkleRoot;
        emit MerkleRootUpdated(newMerkleRoot);
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function setMintPrice(uint256 newMintPrice) external onlyOwner {
        mintPrice = newMintPrice;
        emit MintPriceUpdated(newMintPrice);
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
        emit DefaultRoyaltyUpdated(receiver, feeNumerator);
    }

    function deleteDefaultRoyalty() external onlyOwner {
        _deleteDefaultRoyalty();
        emit DefaultRoyaltyDeleted();
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw(address payable recipient) external onlyOwner nonReentrant {
        if (recipient == address(0)) {
            revert ZeroAddress();
        }

        (bool success, ) = recipient.call{value: address(this).balance}("");
        require(success, "WITHDRAW_FAILED");
    }

    function isWhitelisted(address account, bytes32[] calldata proof) public view returns (bool) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account))));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseTokenURI, tokenId.toString(), ".json");
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _paidMint(address to, uint256 quantity) internal {
        if (quantity == 0 || quantity > MAX_PER_WALLET) {
            revert InvalidQuantity();
        }
        if (msg.value != mintPrice * quantity) {
            revert IncorrectPayment();
        }
        if (mintedPerWallet[to] + quantity > MAX_PER_WALLET) {
            revert WalletLimitExceeded();
        }
        if (paidMinted + quantity > PUBLIC_SUPPLY || totalSupply() + quantity > MAX_SUPPLY) {
            revert PublicSupplyExceeded();
        }

        paidMinted += quantity;
        mintedPerWallet[to] += quantity;
        _mintSequential(to, quantity);
    }

    function _mintSequential(address to, uint256 quantity) internal {
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(to, _nextTokenId);
            _nextTokenId++;
        }
    }
}
