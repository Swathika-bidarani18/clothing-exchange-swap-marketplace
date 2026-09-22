# LoopWear Final Test Checklist

## Local setup
- [ ] Start MongoDB Atlas connection through `.env`.
- [ ] Start backend on port 5000.
- [ ] Start frontend with `python -m http.server 5500` from the frontend folder.
- [ ] Open `http://localhost:5500/index.html`.

## Authentication
- [ ] Register valid member.
- [ ] Reject invalid email/password/location.
- [ ] Reject duplicate email.
- [ ] Login valid member.
- [ ] Reject wrong password.
- [ ] Confirm dashboard/profile data.
- [ ] Confirm logout.

## Clothing
- [ ] Add listing.
- [ ] Validate empty/invalid fields.
- [ ] Browse listing.
- [ ] Search listing.
- [ ] Filter category.
- [ ] Open item details.
- [ ] Edit own listing.
- [ ] Delete own listing.
- [ ] Confirm another user cannot edit/delete it.

## Swaps
- [ ] Request another member's clothing.
- [ ] Cannot request own clothing.
- [ ] Select an offered clothing item.
- [ ] Confirm owner receives request.
- [ ] Accept request.
- [ ] Reject request.
- [ ] Confirm both participants can confirm exchange.
- [ ] Confirm handover becomes available only after exchange confirmation.
- [ ] Confirm both participants can complete handover.
- [ ] Verify swap history.

## Chat and notifications
- [ ] Open swap chat.
- [ ] Send message.
- [ ] Receive message from second account.
- [ ] Verify unread count.
- [ ] Open chat and verify messages are marked read.

## Location and value
- [ ] Set member location.
- [ ] Verify matching nearby listings.
- [ ] Verify target swap value.
- [ ] Verify comparison with a member's clothing.

## Admin
- [ ] Admin can open panel.
- [ ] Non-admin is denied.
- [ ] Verify user count.
- [ ] Verify listing count.
- [ ] Verify swap count.
- [ ] Verify successful swap count.
- [ ] Verify message count.
- [ ] Verify users/listings/swaps tables.

## Responsive
- [ ] 360–390px mobile width.
- [ ] Tablet width.
- [ ] Desktop width.
- [ ] Navigation remains usable.
- [ ] Cards and images do not overflow.
- [ ] Forms remain usable.

## Deployment
- [ ] Add frontend image assets.
- [ ] Configure production API URL.
- [ ] Deploy backend.
- [ ] Deploy frontend or serve it from backend.
- [ ] Configure production MongoDB URI.
- [ ] Configure CORS for the production frontend if frontend/backend are separate.
- [ ] Test registration, login and swap flow on the live URL.
