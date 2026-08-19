// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title EcoSphereToken (ECKO)
 * @notice Token utilitaire ERC-20 pour l'écosystème EcoSphere.
 *         Supply totale fixe : 100,000,000 ECKO
 *
 * Allocation (mintée au déploiement vers le Treasury, redistribuée ensuite) :
 *   - 50% Community & Rewards (staking, airdrop, partenariats)
 *   - 20% Team & Advisors (vesting géré par le contrat EcoSphereVesting)
 *   - 15% Treasury
 *   - 10% Strategic Partnerships
 *   -  5% Reserve / Burn
 *
 * Ce contrat NE promet aucun rendement ni droit à dividende : il s'agit
 * d'un token utilitaire donnant accès à la gouvernance, au staking et
 * à des services de l'écosystème (cours en ligne, crédits carbone, etc.).
 */
contract EcoSphereToken is ERC20, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant TOTAL_SUPPLY = 100_000_000 * 10 ** 18;

    // Plafond absolu incluant les récompenses de staking mintées dans le temps.
    // Marge de 5M ECKO (correspond à l'allocation "Reserve" de la tokenomics),
    // au-delà de laquelle plus aucune récompense ne peut être mintée.
    uint256 public constant MAX_SUPPLY = 105_000_000 * 10 ** 18;

    // --- Staking ---
    struct StakeInfo {
        uint256 amount;
        uint256 since; // timestamp du dernier update
        uint256 rewardDebt;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;

    // Taux de récompense annuel simplifié, exprimé en points de base (bps).
    // Ex: 500 = 5% APY. À ajuster via gouvernance / AccessControl.
    uint256 public rewardRateBps = 500;
    uint256 private constant BPS_DENOMINATOR = 10_000;
    uint256 private constant SECONDS_PER_YEAR = 365 days;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardRateUpdated(uint256 newRateBps);

    constructor(address treasury) ERC20("EcoSphere", "ECKO") {
        require(treasury != address(0), "treasury=0");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        // Mint de la supply totale vers le Treasury.
        // La distribution (vesting équipe, rewards, partenariats) se fait
        // ensuite via des transferts contrôlés / le contrat de vesting.
        _mint(treasury, TOTAL_SUPPLY);
    }

    // --- Admin ---

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setRewardRate(uint256 newRateBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRateBps <= 2000, "rate too high"); // cap 20% APY
        rewardRateBps = newRateBps;
        emit RewardRateUpdated(newRateBps);
    }

    // --- Staking ---

    function stake(uint256 amount) external whenNotPaused {
        require(amount > 0, "amount=0");

        _settleReward(msg.sender);

        _transfer(msg.sender, address(this), amount);
        stakes[msg.sender].amount += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external whenNotPaused {
        StakeInfo storage info = stakes[msg.sender];
        require(amount > 0 && amount <= info.amount, "invalid amount");

        _settleReward(msg.sender);

        info.amount -= amount;
        totalStaked -= amount;

        uint256 reward = info.rewardDebt;
        info.rewardDebt = 0;

        _transfer(address(this), msg.sender, amount);
        if (reward > 0) {
            // Plafonne la récompense mintée pour ne jamais dépasser MAX_SUPPLY,
            // même si la somme des récompenses accumulées sur l'écosystème est élevée.
            uint256 mintable = reward;
            uint256 remainingCap = MAX_SUPPLY - totalSupply();
            if (mintable > remainingCap) {
                mintable = remainingCap;
            }
            if (mintable > 0) {
                _mint(msg.sender, mintable);
            }
        }

        emit Unstaked(msg.sender, amount, reward);
    }

    function pendingReward(address user) public view returns (uint256) {
        StakeInfo memory info = stakes[user];
        if (info.amount == 0) return info.rewardDebt;

        uint256 elapsed = block.timestamp - info.since;
        uint256 accrued = (info.amount * rewardRateBps * elapsed) /
            (BPS_DENOMINATOR * SECONDS_PER_YEAR);

        return info.rewardDebt + accrued;
    }

    function _settleReward(address user) internal {
        StakeInfo storage info = stakes[user];
        if (info.amount > 0) {
            info.rewardDebt = pendingReward(user);
        }
        info.since = block.timestamp;
    }

    // --- Hooks ---

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override whenNotPaused {
        super._update(from, to, value);
    }
}
