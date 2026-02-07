// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {AGT} from "../src/AGT.sol";
import {JokesContest} from "../src/JokesContest.sol";

contract Deploy is Script {
    function run() external returns (AGT agt, JokesContest contest) {
        // Prefer PRIVATE_KEY from env (for testnet/mainnet). If not provided, fall back
        // to Anvil default key(0) for local testing.
        uint256 deployerKey;
        try vm.envUint("PRIVATE_KEY") returns (uint256 k) {
            deployerKey = k;
        } catch {
            deployerKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        }

        vm.startBroadcast(deployerKey);

        agt = new AGT();
        contest = new JokesContest(address(agt));

        vm.stopBroadcast();
    }
}
