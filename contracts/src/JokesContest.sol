// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title JokesContest (MVP)
/// @notice Minimal onchain contest: register -> submit joke -> vote with AGT -> leaderboard.
/// @dev For MVP, jokes are stored as strings onchain for simplicity.
contract JokesContest {
    struct Agent {
        bool registered;
        string displayName;
    }

    struct Submission {
        address agent;
        string joke;
        uint256 votes;
        bool exists;
    }

    IERC20 public immutable agt;
    address public owner;

    uint256 public submissionCount;
    mapping(address => Agent) public agents;
    mapping(uint256 => Submission) public submissions;

    // voter => submissionId => votes cast
    mapping(address => mapping(uint256 => uint256)) public votesByVoter;

    event AgentRegistered(address indexed agent, string displayName);
    event JokeSubmitted(uint256 indexed submissionId, address indexed agent, string joke);
    event Voted(address indexed voter, uint256 indexed submissionId, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor(address agtToken) {
        require(agtToken != address(0), "ZERO_TOKEN");
        agt = IERC20(agtToken);
        owner = msg.sender;
    }

    function register(string calldata displayName) external {
        require(!agents[msg.sender].registered, "ALREADY_REGISTERED");
        require(bytes(displayName).length > 0, "EMPTY_NAME");
        agents[msg.sender] = Agent({registered: true, displayName: displayName});
        emit AgentRegistered(msg.sender, displayName);
    }

    function submitJoke(string calldata joke) external returns (uint256 submissionId) {
        require(agents[msg.sender].registered, "NOT_REGISTERED");
        require(bytes(joke).length > 0, "EMPTY_JOKE");

        submissionId = ++submissionCount;
        submissions[submissionId] = Submission({agent: msg.sender, joke: joke, votes: 0, exists: true});
        emit JokeSubmitted(submissionId, msg.sender, joke);
    }

    /// @notice Vote for a submission using AGT. Requires prior ERC20 approval.
    /// @param submissionId The joke submission id.
    /// @param amount Amount of AGT to spend (1 token = 1 vote).
    function vote(uint256 submissionId, uint256 amount) external {
        require(amount > 0, "ZERO_AMOUNT");
        Submission storage s = submissions[submissionId];
        require(s.exists, "NO_SUBMISSION");

        // pull tokens into contract
        bool ok = agt.transferFrom(msg.sender, address(this), amount);
        require(ok, "TRANSFER_FROM_FAILED");

        s.votes += amount;
        votesByVoter[msg.sender][submissionId] += amount;

        emit Voted(msg.sender, submissionId, amount);
    }

    /// @notice Owner can withdraw collected voting tokens (later: route to prize pool/treasury).
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "ZERO_TO");
        bool ok = agt.transfer(to, amount);
        require(ok, "TRANSFER_FAILED");
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO_OWNER");
        owner = newOwner;
    }
}
