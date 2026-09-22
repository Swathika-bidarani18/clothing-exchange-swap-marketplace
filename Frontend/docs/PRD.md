# LoopWear — Product Requirements Document

## 1. Product overview
LoopWear is a clothing exchange marketplace that helps people give wearable clothes a second life through direct swaps instead of monetary transactions.

## 2. Problem
Good clothing is often unused because owners no longer wear it, while other people may be looking for similar items. LoopWear connects those users through listings, swap requests and negotiation.

## 3. Objectives
- Enable user registration and login.
- Allow users to list, edit and remove clothing.
- Let users browse and filter available clothing.
- Support direct swap requests with an optional offered item.
- Support negotiation through swap-specific chat.
- Compare estimated swap values.
- Show clothing available in the user's stated location.
- Provide swap status tracking through acceptance, exchange confirmation and handover completion.
- Provide an admin panel for users, listings, swaps and platform statistics.

## 4. Users
### Member
A registered user who can maintain a clothing closet, browse listings, send and receive swap requests, negotiate and complete exchanges.

### Administrator
A privileged member who can view platform statistics, users, clothing listings and swap requests, and remove inappropriate users/listings where permitted.

## 5. Core pages
1. Home / Browse
2. Login
3. Registration
4. Dashboard / My Loop
5. My Clothes
6. Item Details / Swap Request
7. Swap Requests
8. Swap History
9. Negotiation Chat
10. Nearby Loops
11. Profile
12. Admin Panel

## 6. Functional requirements
### Authentication
- Register with name, email, password and location.
- Validate required fields and email format.
- Login with email and password.
- Store the active session in the current frontend session mechanism.

### Clothing listings
Each listing contains name, image, size, condition, category, brand, location and estimated swap value.

Members can add, browse, view, edit and delete their own listings.

### Swap requests
A member can request another member's clothing and optionally offer one of their own clothing items.

Request lifecycle:
`Pending → Accepted/Rejected → ExchangeConfirmed → Completed`

Both participants must confirm the exchange before handover and both must confirm handover before completion.

### Negotiation chat
Each swap request can have a direct conversation between its participants. Messages can be marked as read and unread-message notifications are surfaced in the interface.

### Location matching
The application can filter listings by the member's stored location and display matching nearby listings.

### Swap value comparison
The application compares the estimated values of clothing and communicates whether the values are equal, close, or materially different. Final negotiation remains between the participants.

### Administration
The admin panel provides platform counts, user records, clothing listings and swap request records, with deletion controls for users/listings subject to administrator permissions.

## 7. Non-functional requirements
- Responsive layout for desktop and mobile.
- Clear validation feedback.
- Passwords stored as hashes on the backend.
- API access separated from presentation code through configurable API base URL.
- Avoid exposing secrets in frontend files.
- Handle unavailable backend/API states gracefully.

## 8. Suggested data entities
- User
- Clothing
- SwapRequest
- Message

## 9. Success metrics
- Number of active users
- Number of clothing listings
- Number of swap requests
- Number of completed swaps
- Number of chat messages
- Location-based listing engagement

## 10. Future enhancements
- AI-based clothing recommendations
- Mobile application
- Condition verification
- Sustainability impact tracker
- Community groups
- Courier/shipping integration

## 11. Current implementation status
The supplied LoopWear implementation contains the core registration/login, listing, browsing, swap request, exchange flow, chat, notifications, location, value comparison, profile and admin experiences. Final production deployment and production-grade authentication still require deployment configuration and account/provider setup.
