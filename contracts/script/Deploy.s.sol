// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {SeasonRegistry} from "../src/SeasonRegistry.sol";
import {AuditionRegistry} from "../src/AuditionRegistry.sol";

contract Deploy is Script {
    function run() external {
        address owner = vm.envAddress("DEPLOYER_ADDRESS");
        uint256 pk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(pk);
        SeasonRegistry seasons = new SeasonRegistry(owner);
        AuditionRegistry auditions = new AuditionRegistry(owner, address(seasons));
        vm.stopBroadcast();

        console2.log("SeasonRegistry:", address(seasons));
        console2.log("AuditionRegistry:", address(auditions));
    }
}
