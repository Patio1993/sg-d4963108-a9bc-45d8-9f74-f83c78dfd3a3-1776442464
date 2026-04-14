---
title: Design system and database setup
status: in_progress
priority: urgent
type: feature
tags: [setup, database]
created_by: agent
created_at: 2026-04-14T08:28:04Z
position: 0
---

## Notes
Set up the complete design system with custom colors and fonts, then create the database schema for food tracking. This establishes the foundation for all other features.

## Checklist
- [ ] Update globals.css with sage green/amber theme and font imports
- [ ] Configure tailwind.config.ts with custom color tokens and fonts
- [ ] Create food_entries table with meal_type, food_name, portion, calories, eaten_at
- [ ] Add RLS policies for user-owned food entries (T1 pattern)
- [ ] Create profiles table with auto-trigger for new users