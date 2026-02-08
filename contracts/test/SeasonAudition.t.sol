// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {SeasonRegistry} from "../src/SeasonRegistry.sol";
import {AuditionRegistry} from "../src/AuditionRegistry.sol";

contract SeasonAuditionTest is Test {
    SeasonRegistry seasons;
    AuditionRegistry auditions;

    address owner = address(0xA11CE);
    address agent = address(0xB0B);

    function setUp() public {
        seasons = new SeasonRegistry(owner);
        auditions = new AuditionRegistry(owner, address(seasons));
    }

    function testCreateSeason() public {
        vm.prank(owner);
        uint256 id = seasons.createSeason(
            "Season 1",
            "Description",
            "Overview",
            SeasonRegistry.SeasonStatus.AUDITIONS_OPEN,
            "https://img",
            100e18,
            0,
            12
        );

        (
            uint256 sId,
            string memory title,
            string memory description,
            string memory overview,
            SeasonRegistry.SeasonStatus status,
            string memory coverImageUrl,
            uint256 prizeAGT,
            uint256 prizeUSDC,
            uint256 ep2,
            uint256 totalAuditions,
            uint256 acceptedAgents,
            uint256 totalVotes,
            uint64 createdAt,
            uint64 updatedAt
        ) = seasons.seasons(id);
        assertEq(sId, 1);
        assertEq(title, "Season 1");
        assertEq(prizeAGT, 100e18);
        assertEq(prizeUSDC, 0);
        assertEq(ep2, 12);
    }

    function testOnlyOwnerCanCreateSeason() public {
        vm.expectRevert("NOT_OWNER");
        seasons.createSeason(
            "Season 1",
            "Description",
            "Overview",
            SeasonRegistry.SeasonStatus.AUDITIONS_OPEN,
            "https://img",
            100e18,
            0,
            12
        );
    }

    function testSubmitAuditionIncrementsCount() public {
        vm.prank(owner);
        uint256 seasonId = seasons.createSeason(
            "Season 1",
            "Description",
            "Overview",
            SeasonRegistry.SeasonStatus.AUDITIONS_OPEN,
            "https://img",
            100e18,
            0,
            12
        );

        vm.prank(agent);
        uint256 auditionId = auditions.submitAudition(
            seasonId,
            "AgentX",
            "My Audition",
            "Hello world",
            "text",
            "",
            AuditionRegistry.TalentCategory.COMEDY
        );

        (
            uint256 _sid,
            string memory _title,
            string memory _desc,
            string memory _overview,
            SeasonRegistry.SeasonStatus _status,
            string memory _cover,
            uint256 _prizeAGT,
            uint256 _prizeUSDC,
            uint256 _ep2,
            uint256 totalAuditions,
            uint256 _accepted,
            uint256 _votes,
            uint64 _created,
            uint64 _updated
        ) = seasons.seasons(seasonId);
        assertEq(totalAuditions, 1);

        (
            uint256 id,
            uint256 sId,
            address a,
            string memory name,
            string memory title,
            string memory content,
            string memory contentType,
            string memory contentUrl,
            AuditionRegistry.TalentCategory category,
            AuditionRegistry.AuditionStatus status,
            uint64 submittedAt,
            uint64 updatedAt
        ) = auditions.auditions(auditionId);
        assertEq(id, auditionId);
        assertEq(sId, seasonId);
        assertEq(a, agent);
        assertEq(name, "AgentX");
        assertEq(uint256(status), uint256(AuditionRegistry.AuditionStatus.PENDING));
    }

    function testSetAuditionStatusOnlyOwner() public {
        vm.prank(owner);
        uint256 seasonId = seasons.createSeason(
            "Season 1",
            "Description",
            "Overview",
            SeasonRegistry.SeasonStatus.AUDITIONS_OPEN,
            "https://img",
            100e18,
            0,
            12
        );

        vm.prank(agent);
        uint256 auditionId = auditions.submitAudition(
            seasonId,
            "AgentX",
            "My Audition",
            "Hello world",
            "text",
            "",
            AuditionRegistry.TalentCategory.COMEDY
        );

        vm.expectRevert("NOT_OWNER");
        auditions.setAuditionStatus(auditionId, AuditionRegistry.AuditionStatus.ACCEPTED);

        vm.prank(owner);
        auditions.setAuditionStatus(auditionId, AuditionRegistry.AuditionStatus.ACCEPTED);

        (,,,,,,,,, AuditionRegistry.AuditionStatus status,,) = auditions.auditions(auditionId);
        assertEq(uint256(status), uint256(AuditionRegistry.AuditionStatus.ACCEPTED));
    }
}
