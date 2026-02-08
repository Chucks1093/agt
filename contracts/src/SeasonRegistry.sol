// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SeasonRegistry
/// @notice Minimal onchain registry for AGT seasons.
contract SeasonRegistry {
    enum SeasonStatus {
        UPCOMING,
        AUDITIONS_OPEN,
        AUDITIONS_CLOSED,
        EPISODE_1,
        VOTING,
        EPISODE_2,
        COMPLETED
    }

    struct Season {
        uint256 id;
        string title;
        string description;
        string overview;
        SeasonStatus status;
        string coverImageUrl;
        uint256 prizePoolAGT;
        uint256 prizePoolUSDC;
        uint256 episode2Participants;
        uint256 totalAuditions;
        uint256 acceptedAgents;
        uint256 totalVotes;
        uint64 createdAt;
        uint64 updatedAt;
    }

    address public owner;
    uint256 public nextSeasonId = 1;

    mapping(uint256 => Season) public seasons;

    event SeasonCreated(uint256 indexed id, string title, SeasonStatus status);
    event SeasonStatusUpdated(uint256 indexed id, SeasonStatus status);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    function createSeason(
        string memory title,
        string memory description,
        string memory overview,
        SeasonStatus status,
        string memory coverImageUrl,
        uint256 prizePoolAGT,
        uint256 prizePoolUSDC,
        uint256 episode2Participants
    ) external onlyOwner returns (uint256 id) {
        id = nextSeasonId++;
        seasons[id] = Season({
            id: id,
            title: title,
            description: description,
            overview: overview,
            status: status,
            coverImageUrl: coverImageUrl,
            prizePoolAGT: prizePoolAGT,
            prizePoolUSDC: prizePoolUSDC,
            episode2Participants: episode2Participants,
            totalAuditions: 0,
            acceptedAgents: 0,
            totalVotes: 0,
            createdAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp)
        });

        emit SeasonCreated(id, title, status);
    }

    function setSeasonStatus(uint256 id, SeasonStatus status) external onlyOwner {
        Season storage s = seasons[id];
        require(s.id != 0, "NOT_FOUND");
        s.status = status;
        s.updatedAt = uint64(block.timestamp);
        emit SeasonStatusUpdated(id, status);
    }

    function incrementAuditions(uint256 id) external {
        // Callable by the audition contract.
        Season storage s = seasons[id];
        require(s.id != 0, "NOT_FOUND");
        s.totalAuditions += 1;
        s.updatedAt = uint64(block.timestamp);
    }
}
