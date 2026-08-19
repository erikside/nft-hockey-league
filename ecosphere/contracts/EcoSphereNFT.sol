// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title EcoSphereNFT
 * @notice NFT eco-art : les createurs mintent leur oeuvre, une partie du prix
 *         de mint finance automatiquement le Treasury (campagnes de
 *         reforestation verifiees), le reste revient directement au createur.
 *
 * Repartition par defaut : 70% createur / 30% Treasury (ajustable par
 * gouvernance, plafonnee pour eviter qu'un createur ne recoive 0%).
 */
contract EcoSphereNFT is ERC721, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant MINT_PRICE = 0.01 ether; // en MATIC (testnet-friendly)
    uint256 public creatorShareBps = 7000; // 70%
    uint256 private constant BPS_DENOMINATOR = 10_000;

    address public immutable reforestationTreasury;

    uint256 private _nextTokenId;
    mapping(uint256 => string) private _tokenURIs;

    event EcoArtMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string metadataURI,
        uint256 amountToCreator,
        uint256 amountToTreasury
    );
    event CreatorShareUpdated(uint256 newShareBps);

    constructor(address treasury) ERC721("EcoSphere Eco-Art", "ECOART") {
        require(treasury != address(0), "treasury=0");
        reforestationTreasury = treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    /// @notice Mint une oeuvre eco-art. Le createur recoit le NFT + sa part du prix.
    function mintEcoArt(string calldata metadataURI) external payable whenNotPaused returns (uint256) {
        require(msg.value == MINT_PRICE, "prix incorrect");
        require(bytes(metadataURI).length > 0, "metadataURI vide");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = metadataURI;

        uint256 toCreator = (msg.value * creatorShareBps) / BPS_DENOMINATOR;
        uint256 toTreasury = msg.value - toCreator;

        (bool sentCreator, ) = payable(msg.sender).call{value: toCreator}("");
        require(sentCreator, "transfert createur echoue");

        (bool sentTreasury, ) = payable(reforestationTreasury).call{value: toTreasury}("");
        require(sentTreasury, "transfert treasury echoue");

        emit EcoArtMinted(tokenId, msg.sender, metadataURI, toCreator, toTreasury);
        return tokenId;
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    // --- Admin ---

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setCreatorShare(uint256 newShareBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newShareBps >= 5000 && newShareBps <= 9000, "part hors limites (50-90%)"); // ok, no accent here actually
        creatorShareBps = newShareBps;
        emit CreatorShareUpdated(newShareBps);
    }

    // --- Overrides requis (heritage multiple) ---

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
