// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Project4NFT is ERC721URIStorage {
    uint256 private _nextTokenId;

    constructor() ERC721("Project 4 NFT", "P4NFT") {
        _nextTokenId = 1;
    }

    /**
     * @dev Mints one unique NFT to the caller and stores its metadata URI.
     * Example URI: metadata/nft-1.json
     */
    function mintNFT(string memory metadataURI) external returns (uint256) {
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        uint256 tokenId = _nextTokenId;
        _nextTokenId += 1;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        return tokenId;
    }

    /**
     * @dev Exposes the next token ID for simple frontend display/testing.
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    // ownerOf() is inherited from ERC721.
    // tokenURI() is inherited from ERC721URIStorage.
}
