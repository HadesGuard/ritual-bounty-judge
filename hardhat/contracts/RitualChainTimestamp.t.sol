// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SealedVerdict} from "./SealedVerdict.sol";
import {RitualHiddenBounty} from "./RitualHiddenBounty.sol";

/// Ritual chain (id 1979) reports `block.timestamp` in milliseconds instead of
/// the standard Unix seconds, confirmed by sampling live blocks: three
/// consecutive blocks read e.g. 0x19f2e5cd1b3, 0x19f2e5cdc19, 0x19f2e5ce648,
/// which only decode to real wall-clock dates as milliseconds (~2.6s apart
/// over 13 blocks); as seconds they land in the year 58477. Both contracts
/// compare deadlines (always passed in seconds by the frontend) against
/// `block.timestamp`, so on the real chain `deadline > block.timestamp` can
/// never hold and `createBounty` always reverts "deadline in past" -- this
/// was live-deployed and never actually usable (`nextBountyId` on the live
/// SealedVerdict contract was still 1, its initial value). These tests pin
/// `block.chainid` to 1979 and warp to millisecond-scale timestamps to
/// reproduce that environment and confirm `_now()` normalizes correctly.
contract SealedVerdictRitualChainTest is Test {
    SealedVerdict judge;

    address owner = address(0x1);
    address alice = address(0x2);

    uint256 bountyId;
    uint256 deadline;
    uint256 constant REWARD = 1 ether;
    address constant LLM = address(0x0802);

    // A real millisecond-scale "now", matching the sampled live block above.
    uint256 constant MS_NOW = 1_783_189_268_040;

    function setUp() public {
        vm.chainId(1979);
        vm.warp(MS_NOW);

        judge = new SealedVerdict();
        deadline = (MS_NOW / 1000) + 1 days;

        vm.deal(owner, 10 ether);
        vm.prank(owner);
        bountyId = judge.createBounty{value: REWARD}("t", "r", deadline);
    }

    function test_createBounty_succeedsWithMillisecondChainTimestamp() public view {
        (address o, , , uint256 reward, uint256 d, , , , , ) = judge.getBounty(bountyId);
        assertEq(o, owner);
        assertEq(reward, REWARD);
        assertEq(d, deadline);
    }

    function test_revert_deadlineInPast_ifTreatedAsSeconds() public {
        // A "deadline" that is only valid if block.timestamp were seconds (i.e.
        // already far in the past relative to the millisecond chain clock)
        // must still be rejected -- this is exactly the bug being guarded against.
        uint256 secondsLookingDeadline = MS_NOW / 1000 - 1;
        vm.prank(owner);
        vm.expectRevert(bytes("deadline in past"));
        judge.createBounty{value: REWARD}("t", "r", secondsLookingDeadline);
    }

    function test_fullLifecycle_onSimulatedRitualChain() public {
        bytes32 salt = "s";
        bytes32 commitment = keccak256(
            abi.encodePacked("answer", salt, alice, bountyId)
        );
        vm.prank(alice);
        judge.submitCommitment(bountyId, commitment);

        // Warp to just past the deadline, still in millisecond units.
        vm.warp((deadline + 1) * 1000);
        vm.prank(alice);
        judge.revealAnswer(bountyId, "answer", salt);

        vm.warp((deadline + judge.REVEAL_WINDOW() + 1) * 1000);

        bytes memory llmInput = abi.encode(bountyId);
        bytes memory completion = bytes('{"winnerIndex":0}');
        bytes memory actualOutput = abi.encode(
            false,
            completion,
            bytes(""),
            "",
            SealedVerdict.ConvoHistory("", "", "")
        );
        vm.mockCall(LLM, llmInput, abi.encode(bytes(""), actualOutput));

        vm.prank(owner);
        judge.judgeAll(bountyId, llmInput);

        vm.prank(owner);
        judge.finalizeWinner(bountyId, 0);

        (, , , , , bool judged, bool finalized, , uint256 winnerIndex, ) = judge
            .getBounty(bountyId);
        assertTrue(judged);
        assertTrue(finalized);
        assertEq(winnerIndex, 0);
    }

    function test_localChain_stillUsesRawSeconds() public {
        // Sanity: a non-Ritual chainid keeps the original, unscaled behavior.
        vm.chainId(31337);
        vm.warp(1_000_000);
        SealedVerdict local = new SealedVerdict();
        vm.deal(owner, 1 ether);
        vm.prank(owner);
        uint256 id = local.createBounty{value: 1 ether}("t", "r", 1_000_100);
        (, , , , uint256 d, , , , , ) = local.getBounty(id);
        assertEq(d, 1_000_100);
    }
}

contract RitualHiddenBountyRitualChainTest is Test {
    RitualHiddenBounty bounty;

    address owner = address(0x1);
    address teeSigner;
    uint256 teeSignerKey;

    uint256 constant MS_NOW = 1_783_189_268_040;

    function setUp() public {
        vm.chainId(1979);
        vm.warp(MS_NOW);
        bounty = new RitualHiddenBounty();
        (teeSigner, teeSignerKey) = makeAddrAndKey("tee");
    }

    function test_createBounty_succeedsWithMillisecondChainTimestamp() public {
        uint256 deadline = (MS_NOW / 1000) + 1 hours;
        vm.prank(owner);
        uint256 id = bounty.createBounty(teeSigner, bytes("pubkey"), deadline);
        (, , , uint256 storedDeadline, , , ) = bounty.bounties(id);
        assertEq(storedDeadline, deadline);
    }

    function test_revert_deadlineInPast_ifTreatedAsSeconds() public {
        uint256 secondsLookingDeadline = MS_NOW / 1000 - 1;
        vm.prank(owner);
        vm.expectRevert(bytes("deadline must be future"));
        bounty.createBounty(teeSigner, bytes("pubkey"), secondsLookingDeadline);
    }
}
