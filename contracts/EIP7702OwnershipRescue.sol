// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IOwnableTransfer {
    function transferOwnership(address newOwner) external;
}

contract EIP7702OwnershipRescue {
    address public immutable trustedCaller;
    address public immutable newOwner;

    event OwnershipRescued(address indexed target, address indexed newOwner);

    error UnauthorizedCaller();
    error InvalidAddress();

    constructor(address initialTrustedCaller, address initialNewOwner) {
        if (initialTrustedCaller == address(0) || initialNewOwner == address(0)) {
            revert InvalidAddress();
        }

        trustedCaller = initialTrustedCaller;
        newOwner = initialNewOwner;
    }

    receive() external payable {}

    function rescueOwnership(address[] calldata targets) external {
        if (msg.sender != trustedCaller) {
            revert UnauthorizedCaller();
        }

        for (uint256 i = 0; i < targets.length; i++) {
            if (targets[i] == address(0)) {
                revert InvalidAddress();
            }

            IOwnableTransfer(targets[i]).transferOwnership(newOwner);
            emit OwnershipRescued(targets[i], newOwner);
        }
    }
}

