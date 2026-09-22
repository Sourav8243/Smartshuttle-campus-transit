# SmartShuttle – Complexity Analysis

This analysis describes the current frontend/mock-data implementation.

| Operation | Current approach | Typical complexity |
|---|---|---:|
| Booking search/filter | Array filtering | O(n) |
| Route search/filter | Array filtering | O(r) |
| Driver search/filter | Array filtering | O(d) |
| Booking sort | Array sort where used | O(n log n) |
| Driver lookup | Array `find` | O(d) |
| Route lookup | Array `find` | O(r) |
| Create booking | Append/update in memory + localStorage | O(n) in the affected persisted array |
| Cancel booking | Find/update booking + localStorage | O(n) |
| Driver schedule conflict check | Compare against schedules for driver/date | O(s) |
| Analytics by hour | Single pass over matching bookings | O(n) |
| Analytics by route | Single pass/grouping over matching bookings | O(n) |

Where:
- `n` = number of bookings
- `r` = number of routes
- `d` = number of drivers
- `s` = number of relevant schedules

## Space complexity

The application stores mock operational data in browser memory and localStorage. Most filtering and aggregation operations use O(n), O(r), or O(d) auxiliary space depending on the result being created.

## Scaling note

For a real deployment, the current localStorage services should be replaced by a backend API/database. Server-side filtering, pagination, indexes and database aggregation would then be used for large datasets.
