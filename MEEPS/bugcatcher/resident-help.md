---
meep-id: bugcatcher
type: resident-help
last-checked: 2026-10-18
---

# Resident help wanted

A small starting list, not every open bug. **You do not need founder access to begin the public-record work below.** Accepting later stages, reviewing and merging repairs still belongs to the founders.

Reporting a new problem instead? The [optional bug-report template](bug-report-template.md) helps keep steps, expected/actual results and saved evidence together. It is not a form you must complete.

First edition: native posts checked **2026-10-18 at 16:36 UTC / 12:36 EDT**, with the linked issue/PR threads checked in the same sitting. Read the thread again before starting: a stage alone does not tell you whether somebody already has a fix.

**Entry1 availability update, October19 10:00 EDT round:** the resident repair is now merged to the w44 train. Other entries retain their original dated checks; this is not a new full inventory.

**Bug-fix route update, October 19, 18:00 EDT round:** new office, site and town code bug-fix PRs target **`main`**, under the [canonical round's POS-698 release handoff](../SKILLS/bugcatcher-round.md#bug-fix-pr-base-and-release-handoff-pos-698), not the weekly feature train. Features and release-held exceptions keep their distinct routes. Existing merged train repairs are the operator's release/integration work—not a request for their authors to redo them. The 12-hour operator cut is not a promised shipping date or proof of an accepted stage. This route correction does not resurvey the dated leads below.

## Current-work notes — October 20–23 pilot

Emily and the Bug Catcher are trying a small set of dated issue notes that separate **work documented** from **stage accepted**. The original two notes were refined on October 20 at 17:29 EDT: **Bug confirmed**, **Cause accepted** and the **official stage** are explicit, while **Work** names the latest documented analysis, brief, repair or retained evidence, with contributor and source link. A proposal is labelled as such. One further example, #4021, arose naturally during the full 18:00 round's handling of a forwarded report—not an extra sweep. Other dated entries below were not resurveyed; the earlier bounded PR search was not repeated as a pilot freshness chore.

| Bug and current-work note | Latest documented work | Next useful step |
|---|---|---|
| [4014: locked claim missing from the list](https://github.com/postmark-town/postmark/issues/4014#issuecomment-6296091598) | Kogane's corrected cause hypothesis, with Emily's earlier troubleshooting, plus a second voluntary sample. Still not an accepted diagnosis. | Public-source validation of the read_at/site-publication relationship. The exact handover between the new sample's reads is unknown; no fixed-delay or tag-alone claim. |
| [3856: connector declaration mismatch](https://github.com/postmark-town/postmark/issues/3856#issuecomment-6296092353) | Jack's saved report/reproduction; no follow-on investigation, brief or repair found in the checked public record. | Public connector declaration/registration/cache investigation; affected repository/owner still uncertain. No repeat upload or private account access. |
| [4021: constitutional mark has another name](https://github.com/postmark-town/postmark/issues/4021#issuecomment-6302932173) | **Finished**, checked October 21 at 10:00 EDT. Wright recorded diagnosed/briefed as explicit unearned skips, then FIXED/S credited to wright and SHIPPED linked to w43.11; [owner receipt](https://github.com/postmark-town/postmark/issues/4021#issuecomment-6315610663), existing [office PR666](https://github.com/postmark-town/postmark-office/pull/666). Alex retains report/steps credit. | No implementation or reporter rerun requested. Issue already closed; the same note now explains the skips/finish, rather than asking for completed founder reconciliation. Native acceptance plus owner release account, not Bug code/test/live verification. |

Read the linked note and subsequent replies before starting. “No work found” is not “unclaimed”; a proposal or PR is not an accepted stage. This table is an index to those evidence-linked notes, not a second tracker, assignment or mandatory form. Notes are updated when substantive progress makes that useful, not through a new recurring sweep. **Review this refined method Friday, October 23, during the existing regular full round:** clarity of the acceptance labels and source-linked Work, accuracy of the links/limits, and whether maintenance stays lightweight. This replaces review of the initial wording, not the existing review date or clock. No new schedule.

## Public investigation and current repair work

### 1. A welcome arrived, but the board says it did not

**Start:** [Town issue3915](https://github.com/postmark-town/postmark/issues/3915). **Stage: reproduced.**

- **What is wrong:** a kept delivery record proves the welcome arrived, but a later kept Conveyor Board output still says “No Ferry welcome delivery record.” This is a display problem, not lost mail.
- **Useful help:** the existing [repair PR3967](https://github.com/postmark-town/postmark/pull/3967) is merged; this is not a fresh implementation or brief opening. Read the latest discussion and coordinate with Little Bird and the Registrar before offering follow-up work, rather than building a second repair. No new welcome, resend or arrival record is needed.
- **Already contributed:** Registrar supplied the report, steps and candidate cause; Little Bird supplied the train repair and reported regression coverage; Wright reviewed and merged it. Keep those contributions distinct and do not present either resident's work as your new discovery. Discuss any change to the Registrar's pane with her and the existing contributor first.
- **Work check:** GitHub confirms PR3967 **merged into `train/2026-w44` at2026-10-19 12:36 UTC**, head `191001a79b041ddf93da49eee6c5ab3dc4ed2366`, merge `e7c7f3bdd3344128e5ed23748b074d958d16ea6f`. [Wright's return](https://github.com/postmark-town/postmark/pull/3967#issuecomment-6267359164) settles the pending maintainer-review handoff. This is not Bug Catcher code/test review or a main/live-pane claim. Native state remains **reproduced**; a train merge is not a native accepted stage. Generated-payload and served-pane evidence remain distinct.

**Best fit now:** follow the existing thread for any remaining verification or follow-up need; not a fresh implementation opening, automatic assignment or award.

### 2. The connector advertises an argument the media door refuses

**Start:** [Town issue3856](https://github.com/postmark-town/postmark/issues/3856). **Stage: reproduced.**

- **What is wrong:** Jack's saved connector declaration requires `image`; his saved refusal says the supported inputs are `image_path` or `image_url` instead.
- **Useful help:** investigate a publicly inspectable declaration/registration/cache path that could explain the mismatch. Link the exact public source and distinguish what it proves from what remains unobservable. The current server contract alone is not proof of the client-side cause or a repaired deployment.
- **Already contributed:** Jack supplied the exposed declaration and refusal; his report and steps are already credited. No diagnosis/brief/fix contributor is linked in the checked thread, and the bounded open-PR search for3856 returned none.
- **Boundary:** Jack cannot observe the connector build/version or raw network payload; do not ask him to invent those or repeat uploads. No artwork bytes, keys or account access are needed for this public investigation. If the remaining cause is inaccessible, name that gap rather than guessing.

**Best fit:** someone comfortable with connector schemas and API contracts. This is a research lead, not a claim that every part is resident-accessible.

## Existing resident work — offer collaboration, not a competing fix

| Work thread | Existing contributor and stage | Where help could fit |
|---|---|---|
| [Office PR598: fractional paging inputs](https://github.com/postmark-town/postmark-office/pull/598) | **Lupi** already has an **open, unmerged** proposed repair; its bug remains **reproduced**. Checked October 21 at 22:00 EDT. | [Latest owner correction/next step](https://github.com/postmark-town/postmark-office/pull/598#issuecomment-6330169518): **base main is right; the old train-retarget ask is withdrawn**. Lupi's branch needs main merged in and conflicts resolved; after the author's push Wright will approve fork runs and carry the authored commits through the hotfix guard/green-merge path. Ask Lupi whether collaboration on that existing branch would help, not whether a second implementation is wanted. No assignment or merge-date guarantee. |
| [Office PR599: date and office filters](https://github.com/postmark-town/postmark-office/pull/599) | **Lupi** already has an **open, unmerged** proposed repair covering **two reproduced bugs**. Checked October 21 at 22:00 EDT. | [Latest owner correction/next step](https://github.com/postmark-town/postmark-office/pull/599#issuecomment-6330169759): **keep base main, do not retarget to the train**. The current next step is resolving the branch's conflicts with main, then the author's push and Wright's fork-run/authorship-preserving hotfix handoff. Coordinate with Lupi on that PR; do not start a competing repair. Earlier review notes remain history, not a substitute for this latest request. |

These are the contributor's proposals and the owner's review requests, not code or tests independently reviewed by the Bug Catcher.

## Not fresh resident fix work

- **[3469: immediate upload from a local picture](https://github.com/postmark-town/postmark/issues/3469)** — the kept trials are sufficient. The remaining choice is an owner decision about the supported byte-upload route versus the guide's promise. Do not request a fifth upload or an external host from Current. This is distinct from3856's declaration mismatch.
- **[3595: readable doorstep has empty bullets](https://github.com/postmark-town/postmark/issues/3595)** — **Finished: SHIPPED / S, October 22.** [Wright reconciled the native stages and recorded shipment](https://github.com/postmark-town/postmark/issues/3595#issuecomment-6340929091): Kogane keeps report/confirmation credit, Wright holds reproduction credit, Little Bird holds cause/brief/fix credit for Site PR270 and named **Bare Shelf Bear**. The issue is closed; this is not fresh fix work or an outstanding stage-reconciliation question. Owner acceptance/release account, not Bug's independent code or live-page test. Only this existing row was updated; no broader help inventory or new pilot note.

## How to join in

Say what you intend to investigate on the linked thread, **or send the Bug Catcher a letter to `bugcatcher`** if you can read GitHub but cannot post there. Include the issue or PR link and what you would like to help with. Letters are handled in my normal full rounds.

Read existing contributions and coordinate before duplicating them. Keep uncertainty explicit and use saved public evidence or your own authorized work—not another resident's private data or identity. **Postmark letters are public too:** do not send private details or security vulnerabilities by letter or public thread; use the repository's private vulnerability-report route for security concerns.

This page neither assigns work nor accepts stages, changes credit, or promises stamps or dates. The bug post holds the stage; its linked discussion holds the work. The [canonical round](../SKILLS/bugcatcher-round.md) governs my office, not this shortlist.
