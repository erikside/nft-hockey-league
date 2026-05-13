# HockeyNFTLeague Discord Server Setup

This server is for the HockeyNFTLeague community, mint support, project updates, and collector coordination. Do not promise financial return, floor price, or investment value.

## Server Name

```text
HockeyNFTLeague
```

## Server Description

```text
Official community server for HockeyNFTLeague, a fictional hockey NFT league with 1000 ERC-721 jersey collectibles on Polygon.
```

## Roles

Create these roles in this order:

```text
Founder
Core Team
Moderator
Safe Admin
Legendary Holder
Mythic Holder
Epic Holder
Whitelist
Collector
Rookie
Bot
Muted
```

Recommended permissions:

```text
Founder: Administrator
Core Team: Manage channels, manage messages, mention everyone
Moderator: Manage messages, timeout members, kick members
Safe Admin: no extra public permissions; private admin access only
Holder roles: no admin permissions
Whitelist: no admin permissions
Collector: basic member permissions
Rookie: limited access until rules accepted
Muted: cannot send messages
```

## Category And Channel Structure

### Start Here

```text
# welcome
# rules
# official-links
# announcements
# faq
```

### Mint And Support

```text
# mint-info
# whitelist-check
# wallet-help
# support-ticket
# scam-alerts
```

### League

```text
# general
# rink-chat
# jersey-showcase
# rarity-talk
# trade-talk
```

### Holders

```text
# holder-lounge
# legendary-room
# mythic-room
# epic-room
```

### Project

```text
# roadmap
# dev-updates
# voting
# feedback
```

### Team Private

```text
# team-chat
# moderation-log
# safe-admin
# incident-response
```

## Welcome Message

Paste this in `#welcome`:

```text
Welcome to HockeyNFTLeague.

This is a fictional hockey NFT league built around 1000 collectible ERC-721 jerseys on Polygon.

Start here:
1. Read #rules
2. Check #official-links
3. Follow #announcements
4. Ask mint questions in #wallet-help

No real NHL teams, logos, players, or trademarks are used. HockeyNFTLeague is an original fictional universe.
```

## Rules

Paste this in `#rules`:

```text
HockeyNFTLeague Rules

1. Be respectful. No harassment, hate speech, threats, or targeted abuse.
2. No scams, fake links, fake mint pages, impersonation, or wallet-draining content.
3. Never share seed phrases, private keys, wallet files, or recovery phrases.
4. Team members will never DM first to ask for funds, seed phrases, or private keys.
5. No financial advice, price promises, floor-price hype, or guaranteed-profit claims.
6. Keep promotion and spam out of the server.
7. Use the right channels for mint support, wallet support, and project feedback.
8. Moderators may remove content or restrict access to protect the community.
```

## Official Links

Paste this in `#official-links` and update only if a link changes:

```text
Official HockeyNFTLeague Links

Website:
https://hockey-nft-league.pages.dev

GitHub:
https://github.com/erikside/nft-hockey-league

Polygon contract V2:
https://polygonscan.com/address/0x28c9Ad86A58936ee1e34ed08BF21A86c52747920

Official Safe:
0x49E2e4C3257ac88d867DdFD875FD2B0CD4067F3E

Reminder:
Only trust links posted in this channel. The team will never ask for your seed phrase or private key.
```

## Announcements Starter

Paste this first in `#announcements`:

```text
HockeyNFTLeague is live in build mode.

The project is a fictional hockey NFT league featuring 1000 jersey collectibles across Epic, Mythic, and Legendary rarities.

Current focus:
- Secure project administration through Safe
- Polygon smart contract stability
- Whitelist and mint flow testing
- Community setup before broader promotion

No financial promises. Collect because you like the league, the jerseys, and the community.
```

## Mint Info

Paste this in `#mint-info`:

```text
Mint Information

Network:
Polygon

Collection:
1000 fictional hockey jerseys

Rarities:
Epic: 850
Mythic: 130
Legendary: 20

Mint phases:
Whitelist first
Public mint after whitelist validation

Wallet limit:
3 NFTs per wallet

Official contract:
0x28c9Ad86A58936ee1e34ed08BF21A86c52747920
```

## Scam Alert Message

Paste this in `#scam-alerts`:

```text
Security Reminder

Never enter your seed phrase anywhere.
Never sign a transaction you do not understand.
Never trust mint links from DMs.
Never interact with contracts sent by strangers.

Official links are only in #official-links.

If you see a fake link or impersonator, tag a moderator immediately.
```

## Moderator Checklist

Before public launch:

```text
[ ] Enable Community mode
[ ] Set explicit media content filter
[ ] Require verified email
[ ] Set moderation level to medium or high
[ ] Disable @everyone for regular members
[ ] Lock #announcements to team only
[ ] Lock #official-links to team only
[ ] Add a ticket bot only from official source
[ ] Add anti-scam moderation bot only from official source
[ ] Create backup admin account/signers outside Discord
```

## Recommended Bots

Only install bots from official verified pages.

```text
MEE6 or Dyno: basic moderation
Carl-bot: reaction roles and logs
Ticket Tool: support tickets
Wick or Sentry-style moderation bot: anti-raid protection
Collab.Land or Guild.xyz: token-gated holder roles
```

Do not connect token-gating until the mint flow is stable.

## Safe Admin Note

Project admin is controlled by:

```text
Safe: 0x49E2e4C3257ac88d867DdFD875FD2B0CD4067F3E
Threshold: 2-of-2
```

Keep Safe signer details private. Do not discuss signer devices, recovery storage, or personal security setup in public channels.
