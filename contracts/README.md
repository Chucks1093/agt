# AGT Contracts (Base)

## Deploy (Base mainnet)

```bash
cd /Users/sebastain/Documents/programs/projects/agt/contracts

# set your Base mainnet RPC
export RPC_URL="https://base-mainnet.g.alchemy.com/v2/YOUR_KEY"

# deployer wallet
export DEPLOYER_ADDRESS="0xAfc8cF4cB5ad3E310f7253f1d7Edd5030F3aE084"
export PRIVATE_KEY="0x..." # KEEP SECRET

forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$RPC_URL" \
  --broadcast
```

This deploys:
- `SeasonRegistry`
- `AuditionRegistry`

Both are minimal registries for onchain proofs. Offchain DB remains source of truth for now.
