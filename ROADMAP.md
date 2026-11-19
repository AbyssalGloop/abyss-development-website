# Roadmap

Working order agreed on 2026-11-20. Build the real platform first, then do one complete legal review against what actually exists.

## Development order

1. **Finish the public website**
   - Contact section, and wire up the "Contact" menu item and the hero buttons (currently `#` placeholders)
   - Final pass over copy, links and mobile layout
2. **Design and build the client area**
   - Customer accounts and authentication (invite-only, no public sign-up)
   - Hosting plans, offers and offer acceptance
   - Payments and recurring subscriptions (PayPal)
   - Bot management
3. **Configure the Nodion infrastructure**
   - Deployment region, databases, storage, backups, logging, CDN/DNS, deployment settings
4. **Comprehensive legal review** of the finished platform (see the backlog below)
5. **Resolve all legal requirements and finalize the documents**, then release

## Release gate

No public launch, no customers on the platform and no customer data processed through the production platform until every item in the legal backlog is resolved. Until then, all legal pages stay marked as drafts.

During development, obvious legal or privacy concerns are dealt with as they come up. Legal wording is not finalized for features that don't exist yet.

## Legal backlog (for the final review)

- [ ] **Impressum**: final check against the live site
- [ ] **Privacy Policy**: actual hosting, data processing, cookies and browser storage; resolve every "Pending" item (Section 5.7 checklist)
- [ ] **Terms of Service**: revise to match the real services, plans and checkout
- [ ] **Withdrawal information and model withdrawal form** (consumers), including consent to early start
- [ ] **Cookie and consent requirements** under German and EU law (TDDDG, GDPR), based on what the platform actually stores
- [ ] **Customer data processing agreement (AVV)** for managed hosting customers
- [ ] **Nodion data processing agreement**: complete and check Appendix 1 (it may need customer account, billing and file data added), then sign it
- [ ] **Online cancellation button** (§ 312k BGB) if consumers can take out subscriptions online
- [ ] Records of which Terms version each customer accepted, and when
- [ ] Any further requirements arising from the client-area functionality and the checkout/subscription flow
