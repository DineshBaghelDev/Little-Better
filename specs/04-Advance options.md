# Advanced Transaction Input & Account Management

## 1. Core Transaction Form Updates

### Fields & Controls

* **Transaction Type:** Dropdown or toggle selection.
* *Options:* Expense (Money Sent) | Income (Money Received)


* **Payment Method:** Dropdown selection to track transaction medium.
* *Options:* Cash | Online


* **Category:** Dropdown selection for organized expense/income tracking.
* *Action:* Include an **"Add Category"** inline button directly next to the dropdown to allow on-the-fly creation for category-based analytics.


* **Date:** Interactive Date Picker component (defaults to today's date).

---

## 2. Multi-Account Support

### Requirements

* **Account Selection:** Add a dropdown to the transaction form to specify which account the money is drawing from or depositing into (e.g., *Checking, Savings, Business Credit*).
* **Management Hub:** A dedicated dashboard section to view, add, edit, or delete multiple financial accounts.
* **Aggregated Balance:** Total net worth/balance calculated across all active accounts.

---

## 3. Analytics & Reporting (Downstream Impact)

* **Category-Based Analytics:** Visual charts (e.g., pie or bar graphs) breaking down spending and income by category.
* **Account Filtering:** Ability to filter transaction history and analytics by a specific account or view an all-inclusive aggregate.