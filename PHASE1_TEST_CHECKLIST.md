# Phase 1 Testing Checklist

## Prerequisites
- ✅ Database seeded with 101 expenses
- ✅ Dev server running on localhost:3000
- ✅ React Query provider installed

## Test Scenarios

### 1. Search Functionality ✅
**Test Steps:**
1. Login as admin@example.com / admin123
2. Navigate to /expenses
3. Type in search box: "coffee"
4. **Expected:** List filters to show only coffee-related expenses
5. **Expected:** Debouncing works (wait 300ms before search)
6. Click X button to clear search
7. **Expected:** All expenses shown again

**Status:** [ ] PASS / [ ] FAIL

---

### 2. Category Filter ✅
**Test Steps:**
1. Click "Show Filters" button
2. Select a category from dropdown (e.g., "Food")
3. **Expected:** Only expenses from that category shown
4. **Expected:** Active filter indicator appears
5. Click "Clear all"
6. **Expected:** All expenses shown, filter reset

**Status:** [ ] PASS / [ ] FAIL

---

### 3. Payment Method Filter ✅
**Test Steps:**
1. Show filters
2. Select payment method (e.g., "Credit Card")
3. **Expected:** Only credit card expenses shown
4. Try multiple filters together (category + payment method)
5. **Expected:** Filters work together (AND logic)

**Status:** [ ] PASS / [ ] FAIL

---

### 4. Date Range Filter ✅
**Test Steps:**
1. Show filters
2. Set "From Date" to 1 month ago
3. Set "To Date" to today
4. **Expected:** Only expenses in that date range shown
5. Clear date filters
6. **Expected:** All dates shown again

**Status:** [ ] PASS / [ ] FAIL

---

### 5. Infinite Scroll / Pagination ✅
**Test Steps:**
1. Clear all filters to see all 101 expenses
2. Scroll down slowly
3. **Expected:** First 50 expenses load
4. **Expected:** When reaching bottom, next batch loads automatically
5. **Expected:** Loading spinner shows while fetching
6. **Expected:** "No more expenses" message at end

**Status:** [ ] PASS / [ ] FAIL

---

### 6. Search Performance (Debouncing) ✅
**Test Steps:**
1. Open browser dev tools → Network tab
2. Type quickly: "g-r-o-c-e-r-y"
3. **Expected:** Only ONE API call made (after 300ms delay)
4. **Expected:** No API call for each letter

**Status:** [ ] PASS / [ ] FAIL

---

### 7. Delete Functionality ✅
**Test Steps:**
1. Click "Delete" on an expense
2. Confirm deletion
3. **Expected:** Expense removed from list immediately
4. **Expected:** Success toast notification
5. **Expected:** Total amount updates
6. Refresh page
7. **Expected:** Expense still deleted (persisted)

**Status:** [ ] PASS / [ ] FAIL

---

### 8. Caching (React Query) ✅
**Test Steps:**
1. Load expenses page (fresh load)
2. Navigate to dashboard
3. Navigate back to expenses
4. **Expected:** Expenses load INSTANTLY (from cache)
5. **Expected:** No loading spinner
6. Wait 61 seconds (stale time)
7. Navigate back to expenses
8. **Expected:** Data refetches (stale)

**Status:** [ ] PASS / [ ] FAIL

---

### 9. Empty States ✅
**Test Steps:**
1. Apply filters that return no results
2. **Expected:** "No expenses found" message
3. **Expected:** "Clear Filters" button shown
4. Clear all filters, then delete all expenses (destructive - don't do this!)
5. **Expected:** "Add Your First Expense" CTA

**Status:** [ ] PASS / [ ] FAIL

---

### 10. UI/UX Polish ✅
**Test Steps:**
1. Hover over expense cards
2. **Expected:** Shadow effect on hover
3. Check total amount at bottom
4. **Expected:** Gradient text styling
5. Check mobile responsiveness (resize browser)
6. **Expected:** Filters stack vertically on mobile
7. **Expected:** Cards remain readable

**Status:** [ ] PASS / [ ] FAIL

---

## Performance Tests

### Load Time ⚡
- [ ] Initial page load < 1 second
- [ ] Search results < 500ms
- [ ] Filter application < 300ms
- [ ] Infinite scroll load < 500ms

### Browser Console Checks 🔍
- [ ] No errors in console
- [ ] No warnings (except expected Next.js warnings)
- [ ] No memory leaks

---

## Critical Issues to Watch For

### Known Potential Issues:
1. **Infinite scroll not triggering** - Check intersection observer
2. **Search not debouncing** - Check network tab
3. **Filters not clearing** - Test clear button
4. **Total amount calculation wrong** - Verify math
5. **Pagination cursor issue** - Check API responses

---

## Database Verification

Run these commands to verify database state:

```bash
# Count expenses
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Expense;"

# Check categories distribution
sqlite3 prisma/dev.db "SELECT c.name, COUNT(e.id) as count FROM Category c LEFT JOIN Expense e ON c.id = e.categoryId GROUP BY c.id;"

# Check date range
sqlite3 prisma/dev.db "SELECT MIN(date), MAX(date) FROM Expense;"
```

---

## Sign-Off

**Tester:** _________________
**Date:** _________________
**Overall Status:** [ ] ALL PASS / [ ] ISSUES FOUND

**Issues Found:**
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

**Notes:**
_________________________________________________________
_________________________________________________________
_________________________________________________________
