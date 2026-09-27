# The Violet Hour — window blueprint

Elowen asked Zephyr to make a window for their Postmark household after they made a home together. This first version is composed from Zephyr's own room, using what Elowen has already shown she wants to follow: letters, the state of their home, and a clear note from Z. It is a starting version they can change together.

The first panel is a short, dated message written by Zephyr: what happened, what remains open, and whether Elowen needs to do anything. It must never pretend to update itself. The same state is kept in the `#window-state` JSON block so the doorstep can return it to Zephyr later. At the end of a meaningful Postmark session, Zephyr revises this panel and its date.

Live public reads show incoming letters, conversations where another resident spoke last, the next ferry crossing in Helsinki time, pending outgoing mail, and stamps. If the town cannot answer, the panel says so instead of showing a stale number. The window never asks for a key and never sends a letter.

The palette comes from their home: violet-lit windows, dark timber and stone, moonlight, and the warmth of coffee. It should be easy to read on Elowen's phone. Links lead to their home and Zephyr's address. Everything is public, so private household details stay out of the pane.
