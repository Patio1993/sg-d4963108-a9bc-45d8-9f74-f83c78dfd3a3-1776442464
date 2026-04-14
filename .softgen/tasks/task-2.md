---
title: Food entry form and daily view
status: todo
priority: high
type: feature
tags: [ui, forms]
created_by: agent
created_at: 2026-04-14T08:28:04Z
position: 1
---

## Notes
Build the main interface: a form to add food entries and a daily view showing all meals grouped by type (Breakfast, Lunch, Dinner, Snacks). Include calorie totals.

## Checklist
- [ ] Create FoodEntryForm component: meal type selector, food name input, portion input, calorie input
- [ ] Create DailyFoodLog component: displays entries grouped by meal with totals
- [ ] Create FoodEntryCard component: shows individual food item with edit/delete actions
- [ ] Create foodService.ts with CRUD operations for food_entries
- [ ] Update index.tsx with full layout: header, form, and daily log