# Wallet Rescue Notes

The original owner wallet is compromised by an EIP-7702 delegation. Do not send POL to the compromised wallet.

## Compromised Owner

The compromised owner address was removed from public project docs after the rescue.

## New Owner

```text
0x392DC017bf81b7c351042225aa0d22C1f69EAC4E
```

## Contracts To Rescue

```text
HockeyNFTLeagueV2: 0x28c9Ad86A58936ee1e34ed08BF21A86c52747920
HockeyNFTLeague:   0x05f8529F06FdC5c97Decb4975F3F18B82fF63447
```

## Rescue Result

Completed on Polygon.

```text
Rescue delegate:
0x84294D55a36Fb80B53e446FBcF274200a675F200

Ownership transfer transaction:
0xa60bb8e63a785b1c023747c7630dbd9226fe2d790be4a92adce7c3035adc2a65

Clear delegation transaction:
0x9656cd17b7810009ef0fa881b614bf01c507f3652b511b16e9633fd5e065703b
```

Verified final state:

```text
Old owner code: 0x
HockeyNFTLeagueV2 owner: 0x392DC017bf81b7c351042225aa0d22C1f69EAC4E
HockeyNFTLeague owner:   0x392DC017bf81b7c351042225aa0d22C1f69EAC4E
```

## Local Execution

The script uses a clean sponsor wallet to pay gas. The old owner signs only an EIP-7702 authorization, allowing the rescue delegate to call `transferOwnership` from the old owner context.

Required local `.env` values:

```bash
POLYGON_PRIVATE_KEY=""
RESCUE_SPONSOR_PRIVATE_KEY=""
RESCUE_CONFIRM="TRANSFER_OWNERSHIP"
RESCUE_NEW_OWNER_ADDRESS="0x392DC017bf81b7c351042225aa0d22C1f69EAC4E"
RESCUE_MAX_FEE_GWEI="500"
RESCUE_MAX_PRIORITY_FEE_GWEI="120"
```

Optional Alchemy RPC:

```bash
POLYGON_RPC_URL="https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
ALCHEMY_GAS_POLICY_ID=""
```

The Alchemy Gas Policy ID alone does not pay for this local raw transaction path. For this rescue script, fund the sponsor wallet with a small amount of POL and keep the compromised wallet at `0 POL`.

The new owner wallet can be used as the sponsor if it has POL and you are comfortable keeping its private key in local `.env` temporarily. A separate temporary sponsor wallet is still cleaner, because it keeps the new owner key out of the rescue machine.

Run a dry check:

```bash
npm run rescue:ownership
```

Execute only after `.env` is ready:

```bash
npm run rescue:ownership
```

After success, confirm both contracts show the new owner and the compromised wallet code is cleared.
