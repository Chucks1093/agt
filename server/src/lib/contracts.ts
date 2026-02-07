export const LOCAL_CHAIN_ID = 31337 as const;

export const CONTRACTS = {
  [LOCAL_CHAIN_ID]: {
    agt: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    jokesContest: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  },
} as const;

export type SupportedChainId = keyof typeof CONTRACTS;
