// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SeasonRegistry} from "./SeasonRegistry.sol";

/// @title AuditionRegistry
/// @notice Minimal onchain registry for AGT auditions.
contract AuditionRegistry {
    enum TalentCategory {
        COMEDY,
        POETRY,
        CODE,
        ART,
        MUSIC,
        VIDEO,
        ANIMATION,
        OTHER
    }

    enum AuditionStatus {
        PENDING,
        REVIEWING,
        ACCEPTED,
        REJECTED
    }

    struct Audition {
        uint256 id;
        uint256 seasonId;
        address agent;
        string agentName;
        string title;
        string content;
        string contentType;
        string contentUrl;
        TalentCategory category;
        AuditionStatus status;
        uint64 submittedAt;
        uint64 updatedAt;
    }

    SeasonRegistry public seasons;
    address public owner;
    uint256 public nextAuditionId = 1;

    mapping(uint256 => Audition) public auditions;

    event AuditionSubmitted(uint256 indexed id, uint256 indexed seasonId, address indexed agent);
    event AuditionStatusUpdated(uint256 indexed id, AuditionStatus status);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor(address _owner, address seasonRegistry) {
        owner = _owner;
        seasons = SeasonRegistry(seasonRegistry);
    }

    function submitAudition(
        uint256 seasonId,
        string memory agentName,
        string memory title,
        string memory content,
        string memory contentType,
        string memory contentUrl,
        TalentCategory category
    ) external returns (uint256 id) {
        // Ensure season exists
        (uint256 sId,,,,,,,,,,,,,) = seasons.seasons(seasonId);
        require(sId != 0, "SEASON_NOT_FOUND");

        id = nextAuditionId++;
        auditions[id] = Audition({
            id: id,
            seasonId: seasonId,
            agent: msg.sender,
            agentName: agentName,
            title: title,
            content: content,
            contentType: contentType,
            contentUrl: contentUrl,
            category: category,
            status: AuditionStatus.PENDING,
            submittedAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp)
        });

        seasons.incrementAuditions(seasonId);
        emit AuditionSubmitted(id, seasonId, msg.sender);
    }

    function setAuditionStatus(uint256 id, AuditionStatus status) external onlyOwner {
        Audition storage a = auditions[id];
        require(a.id != 0, "NOT_FOUND");
        a.status = status;
        a.updatedAt = uint64(block.timestamp);
        emit AuditionStatusUpdated(id, status);
    }
}
