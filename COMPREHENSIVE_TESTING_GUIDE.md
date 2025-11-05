# Comprehensive End-to-End Testing Guide - CuraLink MVP

## Testing Overview

**Purpose**: Verify all features work correctly for both patient and researcher user types

**Platform URL**: https://h6kx9v7210zs.space.minimax.io

**Test Accounts**:
- **Patient**: pkbqfyhc@minimax.com / qUe8UBwHAa
- **Researcher**: ynrajxfa@minimax.com / 5lvkPndPq0

---

## Testing Methodology

### Test Categories
1. Authentication & Onboarding
2. Dashboard Functionality
3. Clinical Trials Search
4. Publications Search
5. Forum System
6. Meeting Requests
7. Navigation & Integration
8. Responsive Design

### Pass Criteria
- ✅ Feature works as expected
- ⚠️ Works with minor issues
- ❌ Feature broken or inaccessible

---

## Test Suite 1: Authentication & Access

### Test 1.1: Landing Page
**Steps:**
1. Open https://h6kx9v7210zs.space.minimax.io
2. Verify page loads completely
3. Check both CTA buttons present: "I'm a Patient or Caregiver" and "I'm a Researcher"
4. Check header navigation visible
5. Verify features section displays

**Expected Results:**
- Page loads within 3 seconds
- All elements visible and styled correctly
- Buttons are clickable
- Responsive on mobile/tablet/desktop

**Status**: ___

---

### Test 1.2: Patient Sign-In
**Steps:**
1. From landing page, click "Sign In"
2. Enter credentials: pkbqfyhc@minimax.com / qUe8UBwHAa
3. Click "Sign In" button
4. Wait for redirect

**Expected Results:**
- Sign-in form accepts credentials
- No error messages appear
- Redirects to `/dashboard` or `/patient/dashboard`
- Dashboard loads without infinite spinner

**Status**: ___

---

### Test 1.3: Researcher Sign-In
**Steps:**
1. Sign out if logged in
2. Navigate to sign-in page
3. Enter credentials: ynrajxfa@minimax.com / 5lvkPndPq0
4. Click "Sign In" button
5. Wait for redirect

**Expected Results:**
- Sign-in successful
- Redirects to `/researcher/dashboard`
- Dashboard loads without infinite spinner

**Status**: ___

---

### Test 1.4: Researcher Onboarding (If Not Complete)
**Steps:**
1. If redirected to onboarding instead of dashboard
2. **Step 1**: Enter full name, select 2+ specialties, click Continue
3. **Step 2**: Enter research interests text, click Continue
4. **Step 3**: Fill all fields:
   - Institution: Stanford University
   - Department: Oncology
   - Publications: 45
   - ORCID: 0000-0002-1234-5678
5. Click "Complete Setup"

**Expected Results:**
- All form fields accept input
- Navigation between steps works
- Form validation prevents empty required fields
- Submission redirects to dashboard
- Data persists (check by refreshing dashboard)

**Status**: ___

---

## Test Suite 2: Patient Dashboard

### Test 2.1: Dashboard Loading
**Prerequisite**: Signed in as patient

**Steps:**
1. Navigate to `/dashboard` or click logo to return
2. Wait for page to load
3. Observe loading behavior

**Expected Results:**
- Dashboard loads within 2 seconds
- NO infinite loading spinner
- Welcome message displays with user name or generic greeting
- Quick action buttons visible
- Data sections display (even if empty)

**Status**: ___

---

### Test 2.2: Quick Actions Navigation
**Steps:**
1. From patient dashboard, identify quick action buttons
2. Click "Search Clinical Trials" button
3. Verify navigation works
4. Return to dashboard
5. Click "Join Discussion" or "Forum" button
6. Verify navigation works
7. Return to dashboard

**Expected Results:**
- Each button navigates to correct page
- No console errors
- Back navigation works
- Dashboard state preserved on return

**Status**: ___

---

### Test 2.3: Dashboard Data Display
**Steps:**
1. On patient dashboard, scroll through all sections
2. Check for:
   - Recent trials section
   - Publications section
   - Forum activity
   - Favorites (if any)

**Expected Results:**
- Sections display correctly (even if showing "No data")
- No broken layouts
- "No data" messages are clear and helpful
- No JavaScript errors in console

**Status**: ___

---

## Test Suite 3: Researcher Dashboard

### Test 3.1: Dashboard Loading
**Prerequisite**: Signed in as researcher

**Steps:**
1. Navigate to `/researcher/dashboard`
2. Wait for page to load
3. Check for infinite spinner

**Expected Results:**
- Dashboard loads within 2 seconds
- NO infinite loading spinner
- Welcome message with "Dr. [Name]" or researcher greeting
- Quick action buttons visible
- Stats or data sections present

**Status**: ___

---

### Test 3.2: Researcher Quick Actions
**Steps:**
1. From researcher dashboard, click "Browse Publications"
2. Verify navigation to publications page
3. Return to dashboard
4. Click "Search Trials" or similar
5. Verify navigation works
6. Return to dashboard
7. Click "Forum"
8. Verify navigation works

**Expected Results:**
- All navigation buttons work
- Pages load correctly
- No redirect loops
- Dashboard accessible from all pages

**Status**: ___

---

### Test 3.3: Researcher Profile Data
**Steps:**
1. On researcher dashboard, look for profile information
2. Check if onboarding data displays:
   - Institution name
   - Research areas/specialties
   - Publications count
3. Navigate to any profile/settings area if available

**Expected Results:**
- Onboarding data persists and displays
- Institution shows correctly
- Publications count visible
- No placeholder or empty values for completed fields

**Status**: ___

---

## Test Suite 4: Clinical Trials Search

### Test 4.1: Access Trials Search
**Prerequisite**: Signed in as any user type

**Steps:**
1. Navigate to `/search/trials` from dashboard or direct URL
2. Wait for page load

**Expected Results:**
- Page loads without redirect to landing
- Search interface displays
- Form fields present and editable
- No authentication errors

**Status**: ___

---

### Test 4.2: Perform Search
**Steps:**
1. On trials search page
2. Enter search query: "Cancer"
3. Optional: Enter location: "California"
4. Click "Search" button
5. Wait for results

**Expected Results:**
- Search submits without errors
- Loading indicator appears during search
- Results display (or "No results found" message)
- Each result shows: title, status, location, summary
- Results are clickable/expandable

**Status**: ___

---

### Test 4.3: Filter Results
**Steps:**
1. After search with results
2. Change status filter (e.g., "Recruiting")
3. Search again
4. Verify results update

**Expected Results:**
- Filters apply correctly
- Results refresh
- Relevant results shown

**Status**: ___

---

## Test Suite 5: Publications Search

### Test 5.1: Access Publications
**Steps:**
1. Navigate to `/publications` from dashboard
2. Wait for page load

**Expected Results:**
- Page loads successfully
- Search interface displays
- PubMed branding/attribution visible

**Status**: ___

---

### Test 5.2: PubMed Search
**Steps:**
1. On publications page
2. Enter search query: "immunotherapy cancer"
3. Click "Search" button
4. Wait for results

**Expected Results:**
- Search query sent to PubMed API
- Results display with:
  - Article titles
  - Authors
  - Journal name
  - Publication date
  - Abstract/summary
- AI summary generated (if feature enabled)

**Status**: ___

---

### Test 5.3: View Publication Details
**Steps:**
1. Click on a publication result
2. Check expanded details or modal

**Expected Results:**
- Full abstract displays
- PubMed link available
- DOI or PMID shown
- Can close/return to list

**Status**: ___

---

## Test Suite 6: Forum System

### Test 6.1: Access Forum
**Steps:**
1. Navigate to `/forum` from dashboard
2. Wait for page load

**Expected Results:**
- Forum page loads successfully
- Thread list displays
- Category filters visible
- "Start New Discussion" button present

**Status**: ___

---

### Test 6.2: View Threads
**Steps:**
1. On forum page, view list of threads
2. Check each thread shows:
   - Title
   - Author name and role badge
   - Category
   - Reply count
   - Last activity time
3. Click a thread to view

**Expected Results:**
- Threads display in list format
- Thread details show correctly
- Clicking opens thread view
- Posts display in thread

**Status**: ___

---

### Test 6.3: Create New Thread
**Steps:**
1. Click "Start New Discussion"
2. Fill form:
   - Title: "Testing Forum Feature"
   - Category: Select one (e.g., "General Discussion")
   - Content: "This is a test post to verify forum functionality works correctly."
3. Click "Create Thread"
4. Wait for submission

**Expected Results:**
- Form accepts input in all fields
- Categories populate dropdown
- Submit button works
- NO HTTP 400 errors
- Thread appears in list
- Redirect to thread view or list
- Success message displays

**Status**: ___

---

### Test 6.4: Reply to Thread
**Steps:**
1. Open an existing thread
2. Scroll to reply form at bottom
3. Enter reply text: "Test reply message"
4. Click "Post Reply"
5. Wait for submission

**Expected Results:**
- Reply form accepts text
- Submit works without errors
- Reply appears in thread
- User name and role shown on reply
- Timestamp displays

**Status**: ___

---

### Test 6.5: Category Filtering
**Steps:**
1. On forum main page
2. Click different category filters
3. Observe thread list changes

**Expected Results:**
- Clicking category filters threads
- Only matching category threads show
- "All Categories" shows everything
- Filter state persists

**Status**: ___

---

## Test Suite 7: Meeting Requests

### Test 7.1: Access Meeting Requests
**Steps:**
1. Navigate to `/meetings` from dashboard
2. Wait for page load

**Expected Results:**
- Page loads successfully
- Tabs visible: Received / Sent / New Request (if patient)
- Meeting list displays (or empty state)

**Status**: ___

---

### Test 7.2: View Received Requests (Researcher)
**Prerequisite**: Signed in as researcher

**Steps:**
1. On meetings page, click "Received" tab
2. View list of requests

**Expected Results:**
- Tab switches correctly
- Requests display with:
  - Requester name and role
  - Purpose
  - Preferred date
  - Status badge
  - Accept/Decline buttons (if pending)

**Status**: ___

---

### Test 7.3: Send Meeting Request (Patient)
**Prerequisite**: Signed in as patient

**Steps:**
1. On meetings page, click "New Request" tab
2. Search for researcher in search box
3. Select a researcher from list
4. Fill form:
   - Purpose: "Discuss trial eligibility"
   - Preferred Date: [Select future date]
   - Message: "I would like to discuss participation in your oncology trial."
5. Click "Send Meeting Request"

**Expected Results:**
- Researcher list loads and displays
- Search filters researchers
- Form accepts all input
- Date picker works correctly
- Submit succeeds without errors
- Request appears in "Sent" tab
- Success message displays

**Status**: ___

---

### Test 7.4: Manage Meeting Request (Researcher)
**Prerequisite**: Received request exists

**Steps:**
1. On "Received" tab with pending request
2. Click "Accept" button
3. Verify status updates
4. OR click "Decline" on another request
5. Verify status updates

**Expected Results:**
- Accept/Decline buttons work
- Status updates to "Accepted" or "Declined"
- Status badge color changes
- Buttons disappear after action
- Changes persist on refresh

**Status**: ___

---

## Test Suite 8: Navigation & Integration

### Test 8.1: Cross-Feature Navigation
**Steps:**
1. Start on dashboard
2. Navigate to Trials Search
3. From Trials, navigate to Forum
4. From Forum, navigate to Publications
5. From Publications, navigate to Meetings
6. From Meetings, return to Dashboard

**Expected Results:**
- All navigation links work
- No broken links or 404 errors
- Each page loads correctly
- Authentication persists throughout
- User can access all features

**Status**: ___

---

### Test 8.2: Header Navigation
**Steps:**
1. On any page, check header/navbar
2. Click logo (should return to dashboard)
3. Check for profile/settings link (if present)
4. Check for sign-out link
5. Click sign-out

**Expected Results:**
- Logo click returns to appropriate dashboard
- Profile link works (if implemented)
- Sign-out logs user out
- Redirects to landing page after sign-out
- Cannot access protected pages after sign-out

**Status**: ___

---

### Test 8.3: Deep Linking
**Steps:**
1. Sign out
2. Sign back in
3. Navigate directly to: `/search/trials`
4. Verify authentication maintained
5. Navigate directly to: `/forum`
6. Verify access works
7. Navigate directly to: `/publications`
8. Verify access works

**Expected Results:**
- Direct navigation to protected routes works
- Authentication state maintained
- No unexpected redirects
- Pages load correctly from direct URL

**Status**: ___

---

## Test Suite 9: Responsive Design

### Test 9.1: Mobile View (375px width)
**Steps:**
1. Resize browser to 375px wide (iPhone size)
2. Navigate through all pages
3. Check:
   - Landing page
   - Sign-in page
   - Dashboard
   - Trials search
   - Publications
   - Forum
   - Meetings

**Expected Results:**
- All pages render correctly on small screens
- No horizontal scroll
- Buttons are touch-friendly (min 44x44px)
- Text is readable (min 16px)
- Forms are usable
- Navigation is accessible

**Status**: ___

---

### Test 9.2: Tablet View (768px width)
**Steps:**
1. Resize browser to 768px wide (iPad size)
2. Navigate through all pages
3. Check layout adapts properly

**Expected Results:**
- Layout uses tablet breakpoint styling
- Multi-column layouts work correctly
- Touch targets appropriately sized
- Content fits viewport

**Status**: ___

---

### Test 9.3: Desktop View (1920px width)
**Steps:**
1. Resize to large desktop width
2. Check all pages utilize space effectively

**Expected Results:**
- Content doesn't stretch too wide
- Proper max-width containers used
- Layouts look balanced
- No wasted space

**Status**: ___

---

## Test Suite 10: Error Handling

### Test 10.1: Invalid Credentials
**Steps:**
1. Sign out
2. Attempt sign-in with wrong password
3. Check error message

**Expected Results:**
- Clear error message displays
- User remains on sign-in page
- Can retry with correct credentials

**Status**: ___

---

### Test 10.2: Network Error Handling
**Steps:**
1. Open browser dev tools
2. Simulate offline (Network tab → Offline)
3. Try to search trials or publications
4. Re-enable network

**Expected Results:**
- Error message displays
- App doesn't crash
- Retry works when back online
- Loading states handle correctly

**Status**: ___

---

### Test 10.3: Empty States
**Steps:**
1. Check empty states:
   - No clinical trials results
   - No publications results
   - No forum threads
   - No meeting requests

**Expected Results:**
- Helpful "No data" messages
- Suggestions or CTAs provided
- No broken layouts
- User understands what to do next

**Status**: ___

---

## Test Suite 11: Data Persistence

### Test 11.1: Profile Data Persistence
**Steps:**
1. Sign in as researcher
2. Note institution name on dashboard
3. Sign out
4. Sign back in
5. Check institution name again

**Expected Results:**
- Institution data persists
- Publications count persists
- All onboarding data retained

**Status**: ___

---

### Test 11.2: Preferences Persistence
**Steps:**
1. Sign in as patient
2. If preferences can be set, set some
3. Sign out and back in
4. Check preferences

**Expected Results:**
- User preferences saved
- Settings persist across sessions

**Status**: ___

---

## Test Suite 12: Performance

### Test 12.1: Page Load Times
**Steps:**
1. Use browser dev tools → Network tab
2. Measure load time for each page:
   - Landing: ___ ms
   - Dashboard: ___ ms
   - Trials Search: ___ ms
   - Publications: ___ ms
   - Forum: ___ ms

**Expected Results:**
- All pages load < 3 seconds on good connection
- No excessively large assets (> 5MB)
- Images optimized

**Status**: ___

---

### Test 12.2: Bundle Size
**Steps:**
1. Check built bundle size in dist/ folder
2. Note JavaScript bundle size: ___ KB

**Expected Results:**
- Main JS bundle < 1MB
- CSS bundle < 100KB
- Reasonable for feature set

**Status**: ___

---

## Summary Report Template

### Test Execution Summary

**Date**: ___________  
**Tester**: ___________  
**Build Version**: ___________  

**Total Tests**: 45  
**Passed**: ___  
**Failed**: ___  
**Warnings**: ___  

### Critical Issues Found
1. ___________
2. ___________
3. ___________

### Minor Issues Found
1. ___________
2. ___________

### Recommendations
1. ___________
2. ___________

### Sign-off

[ ] All critical features working  
[ ] No blocking bugs found  
[ ] Ready for demo/production

**Tester Signature**: ___________  
**Date**: ___________

---

## Quick Test Checklist (5-Minute Smoke Test)

For rapid verification:

- [ ] Landing page loads
- [ ] Patient can sign in
- [ ] Patient dashboard loads (no spinner)
- [ ] Researcher can sign in  
- [ ] Researcher dashboard loads (no spinner)
- [ ] Clinical trials search accessible
- [ ] Publications search accessible
- [ ] Forum loads and can create thread
- [ ] Meeting requests page accessible
- [ ] Navigation between features works

If all checkboxes pass → Basic functionality verified ✅

---

**Testing Guide Version**: 1.0  
**Last Updated**: 2025-11-04  
**Platform**: CuraLink MVP
