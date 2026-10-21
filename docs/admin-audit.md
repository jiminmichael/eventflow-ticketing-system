# Admin audit — 21 October 2026

The audit used isolated temporary databases, fixture administrator credentials and mocked Paystack responses. No live payments were initiated. The real event database was not modified. Existing repository sample records were retained.

## Verified

- Login, protected endpoints, expired-session rejection, logout and login throttling.
- Overview totals for verified revenue, confirmed guests, pending and failed orders.
- Guest search by name/UUID, ticket/payment/check-in/date filters, attendee details and QR data.
- Check-in, undo check-in, repeated gate scans, unpaid-ticket rejection and server-failure feedback.
- XLSX/CSV exports: all guests, paid guests, ticket tier and filtered guests; payment XLSX; dedicated paid guest list.
- Ticket creation, price/guest-count edits, inventory configuration, deletion and preservation of referenced historical tiers.
- Menu creation, editing, availability toggling, deletion and backend ordering.
- Payment audit trail and dashboard refresh.
- Event settings persistence and public title synchronization.
- Browser interaction with all seven admin tabs, plus header/control layout at 375, 768, 1024 and 1440 pixels.

## Fixed

- Backend admission of unpaid guests.
- False successful gate admission after a failed save.
- Silent failures when saving/deleting admin records.
- Duplicate ticket codes/IDs and invalid numeric catalog input.
- Deletion of tiers still referenced by historical orders.
- CSV corruption for names containing quotation marks.
- Filtered export date range and search consistency.
- Event settings blocked by a local banner image path.
- Public hero ignoring the saved event title/subtitle.
- Ambiguous close controls and Escape handling for nested admin dialogs.
- Mobile header clipping and unreadable dark overview panels; removed an unconfigured revenue goal.

## Repeatable checks

`npm test` runs the existing system and commerce suites plus `tests/admin.test.ts`, which performs 53 admin endpoint checks. TypeScript and the production build also pass. Browser checks exercised the UI using Playwright against an isolated local fixture server; they used no live payment credentials.

Live provider settlement and multi-instance deployment were not tested. The existing persistent-single-server storage limitation remains documented in README.md.
