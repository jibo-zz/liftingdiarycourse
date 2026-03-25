# UI Coding Standards

## Component Library

**Only Nuxt UI components** must be used for all UI throughout this project. Absolutely no custom components should be created. Every UI element — buttons, inputs, modals, tables, cards, navigation, etc. — must come from the [Nuxt UI](https://ui.nuxt.com) component library.

## Date Formatting

All date formatting must be done using [date-fns](https://date-fns.org).
And make sure the [date-fns](https://date-fns.org) is installed before using it.

Dates must be formatted using ordinal day, abbreviated month, and full year:

| Date | Formatted Output |
|------|-----------------|
| 2026-01-01 | 1st Jan 2026 |
| 2026-02-02 | 2nd Feb 2026 |
| 2026-03-03 | 3rd Mar 2026 |
| 2025-06-04 | 4th Jun 2025 |

### Usage

```ts
import { format } from 'date-fns'

format(date, "do MMM yyyy")
```
