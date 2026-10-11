// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * DecodeLabs Blockchain Technology - Project 2
 * Decentralized Voting System with Smart Contracts
 *
 * Implements the requirements from the supplied procedure PDF:
 * - Proposal submission
 * - Authorized voters
 * - Vote casting
 * - Double-vote prevention
 * - Dynamic winner calculation with if/else logic
 * - On-chain state management and access control
 */
contract VotingProtocol {
    struct Voter {
        uint256 weight;
        bool voted;
        address delegate;
        uint256 vote;
    }

    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    address public immutable chairperson;

    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    event VoterAuthorized(address indexed voter, uint256 weight);
    event ProposalSubmitted(uint256 indexed proposalIndex, bytes32 name);
    event VoteCast(address indexed voter, uint256 indexed proposalIndex, uint256 weight);

    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Only chairperson can perform this action");
        _;
    }

    constructor() {
        chairperson = msg.sender;
    }

    /**
     * Authorize a specific address to vote.
     * The chairperson acts as the access-control authority.
     */
    function giveRightToVote(address voter) external onlyChairperson {
        require(voter != address(0), "Invalid voter address");
        require(!voters[voter].voted, "Voter has already voted");
        require(voters[voter].weight == 0, "Voter already authorized");

        voters[voter].weight = 1;
        emit VoterAuthorized(voter, 1);
    }

    /**
     * Submit a proposal.
     * Only the chairperson may add proposals.
     */
    function addProposal(string calldata proposalName)
        external
        onlyChairperson
        returns (uint256 proposalIndex)
    {
        require(bytes(proposalName).length > 0, "Proposal name is required");

        bytes32 name = bytes32(bytes(proposalName));
        proposals.push(Proposal({name: name, voteCount: 0}));

        proposalIndex = proposals.length - 1;
        emit ProposalSubmitted(proposalIndex, name);
    }

    /**
     * Cast exactly one vote for a valid proposal.
     * State is updated before the tally interaction, following the
     * checks-effects-interactions pattern emphasized in the procedure.
     */
    function vote(uint256 proposalIndex) external {
        require(proposalIndex < proposals.length, "Invalid proposal index");

        Voter storage sender = voters[msg.sender];

        // Check 1: voter must be authorized.
        require(sender.weight != 0, "Not an authorized voter");

        // Check 2: one address may vote only once.
        require(!sender.voted, "Already voted");

        // Effects: lock the voter before updating the tally.
        sender.voted = true;
        sender.vote = proposalIndex;

        // Ledger update.
        proposals[proposalIndex].voteCount += sender.weight;

        emit VoteCast(msg.sender, proposalIndex, sender.weight);
    }

    /**
     * Dynamically calculate the winning proposal.
     * The winner is the proposal with the greatest voteCount.
     * If two proposals tie, the earliest proposal remains the winner.
     */
    function winningProposal() public view returns (uint256 winningIndex) {
        require(proposals.length > 0, "No proposals submitted");

        uint256 winningVoteCount = 0;
        winningIndex = 0;

        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningIndex = i;
            } else if (proposals[i].voteCount == winningVoteCount && i == 0) {
                // Explicit if/else logic for the initial/tie state.
                winningIndex = 0;
            }
        }
    }

    function winnerName() external view returns (bytes32) {
        return proposals[winningProposal()].name;
    }

    function proposalCount() external view returns (uint256) {
        return proposals.length;
    }

    function getProposal(uint256 proposalIndex)
        external
        view
        returns (bytes32 name, uint256 voteCount)
    {
        require(proposalIndex < proposals.length, "Invalid proposal index");
        Proposal memory proposal = proposals[proposalIndex];
        return (proposal.name, proposal.voteCount);
    }

    function getVoter(address voter)
        external
        view
        returns (uint256 weight, bool voted, address delegate, uint256 selectedProposal)
    {
        Voter memory current = voters[voter];
        return (current.weight, current.voted, current.delegate, current.vote);
    }
}
