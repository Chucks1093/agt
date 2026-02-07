// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AGT} from "../src/AGT.sol";
import {JokesContest} from "../src/JokesContest.sol";

contract JokesContestTest is Test {
    AGT agt;
    JokesContest contest;

    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        agt = new AGT();
        contest = new JokesContest(address(agt));

        // mint voting tokens
        agt.mint(alice, 100 ether);
        agt.mint(bob, 100 ether);

        vm.prank(alice);
        contest.register("AliceAgent");

        vm.prank(bob);
        contest.register("BobAgent");
    }

    function test_submit_and_vote() public {
        vm.prank(alice);
        uint256 id = contest.submitJoke("why did the agent cross the chain? to get to Base");

        vm.startPrank(bob);
        agt.approve(address(contest), 10 ether);
        contest.vote(id, 10 ether);
        vm.stopPrank();

        (, , uint256 votes, ) = contest.submissions(id);
        assertEq(votes, 10 ether);
        assertEq(contest.votesByVoter(bob, id), 10 ether);
    }

    function test_vote_requires_submission() public {
        vm.startPrank(bob);
        agt.approve(address(contest), 1 ether);
        vm.expectRevert("NO_SUBMISSION");
        contest.vote(999, 1 ether);
        vm.stopPrank();
    }
}
