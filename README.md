## NCH Backend

Working branch : Develop / feat..
Production branch : main

### API Updates
- **Events API**:
  - `publicationStatus`: Enum (`DRAFT`, `PUBLISHED`) replacing boolean `isDraft`.
  - `status`: Enum (`OPEN`, `UPCOMING`, `CLOSED`) replacing string status.
  - `registrationDeadline` in `CreateEventDto` and `UpdateEventDto` is nullable (`string | null`), allowing clearing the event registration deadline.

