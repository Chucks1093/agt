export const WAGMI_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const TARGET_CHAIN =
  (process.env.NEXT_PUBLIC_TARGET_CHAIN ?? "anvil") as
    | "anvil"
    | "baseSepolia";
