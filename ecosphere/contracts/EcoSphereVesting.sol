// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // v5 path confirmed
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title EcoSphereVesting
 * @notice Gère le vesting des tokens ECKO pour :
 *         - Team : 24 mois linéaire, cliff 6 mois
 *         - Advisors : 12 mois linéaire, pas de cliff
 *
 * Le token communauté n'a AUCUN lock-up (seulement du staking, géré
 * directement par EcoSphereToken.sol).
 */
contract EcoSphereVesting is AccessControl {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 released;
        uint256 start; // timestamp de début
        uint256 cliffDuration; // en secondes
        uint256 vestingDuration; // en secondes, à partir de start
        bool revocable;
        bool revoked;
    }

    mapping(address => VestingSchedule) public schedules;

    event ScheduleCreated(address indexed beneficiary, uint256 amount);
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event ScheduleRevoked(address indexed beneficiary);

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "token=0");
        token = IERC20(tokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Crée un vesting "Team" : cliff 6 mois, durée totale 24 mois.
    function createTeamSchedule(address beneficiary, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _createSchedule(beneficiary, amount, 180 days, 730 days, true);
    }

    /// @notice Crée un vesting "Advisor" : pas de cliff, durée totale 12 mois.
    function createAdvisorSchedule(address beneficiary, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _createSchedule(beneficiary, amount, 0, 365 days, true);
    }

    function _createSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    ) internal {
        require(beneficiary != address(0), "beneficiary=0");
        require(amount > 0, "amount=0");
        require(schedules[beneficiary].totalAmount == 0, "schedule exists");

        schedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            released: 0,
            start: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            revocable: revocable,
            revoked: false
        });

        token.safeTransferFrom(msg.sender, address(this), amount);
        emit ScheduleCreated(beneficiary, amount);
    }

    function releasableAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory s = schedules[beneficiary];
        if (s.totalAmount == 0 || s.revoked) return 0;

        if (block.timestamp < s.start + s.cliffDuration) {
            return 0;
        }

        uint256 vested;
        if (block.timestamp >= s.start + s.vestingDuration) {
            vested = s.totalAmount;
        } else {
            vested = (s.totalAmount * (block.timestamp - s.start)) / s.vestingDuration;
        }

        return vested - s.released;
    }

    function release() external {
        uint256 amount = releasableAmount(msg.sender);
        require(amount > 0, "nothing to release");

        schedules[msg.sender].released += amount;
        token.safeTransfer(msg.sender, amount);

        emit TokensReleased(msg.sender, amount);
    }

    /// @notice Révoque un schedule (ex: départ anticipé d'un membre de l'équipe).
    ///         Les tokens déjà vested restent réclamables ; le reste retourne au Treasury.
    function revoke(address beneficiary) external onlyRole(DEFAULT_ADMIN_ROLE) {
        VestingSchedule storage s = schedules[beneficiary];
        require(s.revocable, "not revocable");
        require(!s.revoked, "already revoked");

        uint256 vested = releasableAmount(beneficiary) + s.released;
        uint256 refund = s.totalAmount - vested;

        s.revoked = true;
        s.totalAmount = vested;

        if (refund > 0) {
            token.safeTransfer(msg.sender, refund);
        }

        emit ScheduleRevoked(beneficiary);
    }
}
