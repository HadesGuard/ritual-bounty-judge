# AI Bounty Judge

A workshop-demo frontend for the **Ritual Chain** `SimpleAIBountyJudge` contract.

> Submit answers to a bounty. After the deadline, Ritual AI ranks all
> submissions. The bounty owner finalizes the winner.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS · wagmi · viem**.

---

## Product flow

1. A bounty owner **creates a bounty** with a title, rubric, deadline, and reward.
2. Participants **submit answers** before the deadline.
3. After the deadline, the owner clicks **Judge All Submissions**.
4. The frontend gathers all submissions, builds one Ritual LLM request, encodes
   it as `llmInput`, and calls `judgeAll(bountyId, llmInput)`.
5. The contract stores/emits the **AI review**.
6. The owner reads the AI review and clicks **Finalize Winner** with the chosen
   `winnerIndex`.
7. The contract pays the winner.

> AI review is advisory. The bounty owner finalizes the winner. All submissions
> are judged together after the deadline. Only one winner receives the reward.

---

## Configure

Copy the example env file and fill in your deployment:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed `SimpleAIBountyJudge` address. The UI shows a banner until this is set. |
| `NEXT_PUBLIC_RITUAL_RPC_URL` | Ritual Chain JSON-RPC endpoint. |
| `NEXT_PUBLIC_RITUAL_CHAIN_ID` | Numeric chain id (default `1979`). |
| `NEXT_PUBLIC_RITUAL_EXECUTOR_ADDRESS` | A *registered* Ritual TEE executor address (see the network's executor registry) used when encoding `judgeAll` input -- not the precompile's own address. Defaults to `0xb42e435c4252a5a2e7440e37b609f00c61a0c91b`, confirmed live by decoding a real successful call to `0x…0802`; rotate if that executor goes offline. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | *(optional)* Enables the WalletConnect connector. Injected/MetaMask work without it. |

All values are read in `src/config/contract.ts` and `src/config/wagmi.ts`.

---

## Run

```bash
pnpm install      # or npm install
pnpm dev          # http://localhost:3000
```

Build / start:

```bash
pnpm build
pnpm start
```

---

## How it's wired

```
src/
  abi/AIJudge.ts            Contract ABI (provided)
  config/
    contract.ts            Address + executor + chain id from env vars
    wagmi.ts               Custom Ritual Chain + wagmi config
  app/
    providers.tsx          'use client' wagmi + React Query provider tree
    layout.tsx             Server layout (fonts, metadata) -> Providers
    page.tsx               Dashboard: create, load-by-id, recent list, bounty view
  hooks/
    useBounty.ts           Reads + parses getBounty (polls so status updates)
    useWriteTx.ts          idle -> wallet -> pending -> confirmed | failed tx state
    useRecentBounties.ts   localStorage list of created/opened bounty ids
  lib/
    ritualLlm.ts           buildJudgeAllLlmInput() Ritual LLM request encoder
    aiReview.ts            Decode aiReview bytes + parse judge JSON
    bounty.ts              Bounty type, status logic, submission gating
    format.ts              Address/amount/timestamp formatting helpers
  components/               UI primitives + each feature card
```

### The Ritual LLM encoder (`src/lib/ritualLlm.ts`)

`buildJudgeAllLlmInput({ executorAddress, title, rubric, submissions })` builds
the batch-judging prompt (using the workshop's exact template, low temperature
for stable judging) and ABI-encodes it with viem's `encodeAbiParameters` into
the `bytes` passed to `judgeAll`.

> **Update: the "abi" tuple layout is confirmed correct**, verified live against
> Ritual chain by decoding a real successful call to the precompile (found via
> RitualScan) and getting it to decode cleanly with this exact parameter list.
> The full `createBounty -> submitCommitment -> revealAnswer -> judgeAll ->
> finalizeWinner` lifecycle has been run end-to-end against the real precompile,
> including a real model response stored in `aiReview`. Two things to get right
> that aren't obvious from the ABI alone:
> - `executorAddress` must be a currently-registered executor (see the env var
>   table above), not the precompile's own address.
> - The RitualWallet balance the precompile requires **scales with prompt
>   length** (title + rubric + all revealed answers combined), not with
>   `maxCompletionTokens` -- a one-line prompt needed ~0.05 RITUAL, a small
>   realistic bounty prompt needed ~0.311 RITUAL. `MIN_LLM_BALANCE` in
>   `src/lib/ritualWallet.ts` is a rough default (0.5 RITUAL); a bounty with a
>   long rubric or several long answers may need more, and there's no known way
>   to query the exact required amount ahead of time.
>
> Also: automatic gas estimation for `judgeAll` is unreliable against this
> precompile -- an underfunded or oversized call can silently vanish (accepted
> with a tx hash, then never mined and never stays pending, no error at all)
> instead of reverting normally. `JudgeAll.tsx` passes an explicit `gas` limit
> to avoid this; if it's ever removed, expect confusing silent failures.
>
> The `"json"` fallback ENCODING was tested too and does *not* work against the
> real precompile (it's genuinely just a mock for local UI dev against a stub
> contract).

### AI review display

After `judgeAll`, the UI reads `aiReview` from `getBounty`, decodes the bytes to
text, and tries to parse the judge JSON (`winnerIndex`, `ranking`, `summary`).
It renders the recommended winner, a ranking table with scores and reasons, and
the summary. If parsing fails, it shows the raw response in a code block. The
finalize input is prefilled with the AI's recommended `winnerIndex`.

---

## Notes for the workshop

- Transaction buttons show clear states and disable while pending.
- Owner-only actions (Judge / Finalize) only appear for the connected owner.
- The "recent bounties" list is kept in `localStorage` (no indexer required).
- Multicall is **not** assumed. Submissions are read one-by-one, so it works on
  a fresh chain without a deployed multicall contract.
