import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SealedVerdictModule", (m) => {
  const aiJudge = m.contract("SealedVerdict");

  return { aiJudge };
});
