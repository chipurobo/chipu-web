# Email — ChipuRobo dashboard capabilities

**Subject:** How the dashboard covers each of the visibility claims

Hi <name>,

Quick map of the seven visibility areas against what's actually live in the dashboard today:

- **Learner participation** — *Students* page (roster, grade, in-club flag, disability flag), Excel/CSV bulk import, per-student unit assignment on *Stock*, and per-student event attendance from the new Events module.
- **Teacher engagement** — *Schools* admin page lists every lead teacher + credentials. The data for engagement signals (orders, students added, attendance) is captured; a per-teacher activity panel is the next iteration.
- **Fabrication activities** — Maker-space *Production* Kanban with live stats, progress bar per order, and auto-generated `<SKU>-NNN` serials. Every unit traces back to its maker, order, and current holder.
- **Product requests** — Schools place orders directly with a maker space; admins see system-wide on *All orders* with status filters; ChipuRobo commissions consumables on *Distribute*.
- **Production status** — Same Kanban + stats pattern on both maker-space and admin views. Sidebar badges + toast notifications keep everyone in sync in real time.
- **Quality assurance** — Per-unit serial traceability, notes fields on orders/units/stock, two-party delivery confirmation (only the placer can mark delivered), full status timestamps. An explicit defect/return UI is the planned follow-up.
- **Delivery outcomes** — `mark_order_delivered` atomically credits stock; *Stock & units* shows what each school holds; *Distribute → Recently delivered* shows every successful drop.

**Two gaps to close next**

1. Teacher engagement panel — last sign-in + 30-day activity per lead (no schema changes).
2. Defect/return flow — wire the existing `returned`/`retired` unit statuses to UI.

Happy to demo live whenever works.

Best,
Kevin
