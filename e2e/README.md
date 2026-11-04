# End-to-end tests

Registration, end to end, against a stack that runs entirely on this machine: the person signs up on
Keycloak's page, confirms the email, goes through the app's wizard, and the test then checks what
Keycloak and profile-service stored.

Nothing reaches production. Every request the browser makes to `e-mentor.ro` is aborted
(`e2e/support/fixtures.ts`), and the frontend Playwright starts talks only to the local Keycloak and
profile-service. A test fails if the app ever tries production's Keycloak.

## What runs

| Piece | Where | Notes |
|---|---|---|
| Keycloak 26.4.2 | `localhost:8180` (admin/admin) | realm built from `../ementor-devops/.../e-mentor-prod-realm.json` by `stack/build-realm.mjs`: default theme, Google sign-in off, test-only client secret, emails to Mailpit, custom user attributes allowed |
| Mailpit | `localhost:8025` | catches the verification emails; the tests follow the link in them |
| Redis | `localhost:6380` | profile-service's user cache, separate from your local Redis (no password: profile-service sends none) |
| profile-service | `localhost:49202` | from `../backend/profile-service`, on `profile_service_e2e`, a clone of your local `profile_service` database in `postgres_dev` |
| frontend | `localhost:3000` | started by Playwright with `NEXT_PUBLIC_KEYCLOAK_URL` and `NEXT_PUBLIC_PROFILE_SERVICE_HOST` pointing at the local stack |

## Running

```bash
npm run e2e:up      # Docker must be running; first start takes ~1 minute
npm run test:e2e    # stop your own `npm run dev` first: Playwright needs port 3000
npm run e2e:down    # stop the stack (add --purge to delete it, including the e2e database)
```

`e2e/stack/up.sh --fresh` rebuilds Keycloak, Redis and the e2e database from scratch. The tests use your
installed Google Chrome; `E2E_BUNDLED_CHROMIUM=1 npm run test:e2e` uses Playwright's own Chromium instead
(`npx playwright install chromium` first). profile-service needs Java 17 (`/usr/libexec/java_home -v 17`, or
set `JAVA_HOME`). A failed test keeps a
trace: `npx playwright show-report`.

Every test signs up new people with unique `@e-mentor.test` addresses, so runs do not clean up after
themselves and can be repeated on the same stack.

## Scenarios

Student (`tests/student-registration.spec.ts`)

- email sign-up with a photo creates the profile: role, `profile_completed`, photo id in Keycloak and in the
  database, school, grade, phone and address saved, own photo loads
- without a photo the student cannot leave the personal step, and nothing is created
- a Google account uses its Google photo and needs no upload
- a valid invitation code connects the student to the professor
- an unknown invitation code is refused and the step can be skipped
- an invalid phone number and grade keep the student on the personal step
- going back from the address step keeps the answers and saves nothing
- a failed save shows an error and the student can try again
- an empty address is not sent
- a failed photo upload does not count as a photo
- a student who leaves halfway is brought back to the wizard on the next login
- an unconfirmed email cannot reach the app
- an email that already has an account cannot sign up again

Professor (`tests/professor-registration.spec.ts`)

- photo, bank account and address give a full profile with an invitation code
- without a photo the professor cannot continue
- bank details can be skipped
- the address is required: an empty one is not sent (the backend stores every professor with an address)
- an invalid IBAN keeps the professor on the bank step
- a Google account professor uses the Google photo
- a second professor with the same name gets a different invitation code *
- a professor with a long name and academic titles can register *

Photo cache (`tests/photo-cache.spec.ts`), the request budget that keeps a failing photo service from being
flooded by its own pages:

- one failing photo costs at most 3 requests, even with both sizes loading at once, and nothing more within
  the minute
- a photo the service has no record of is asked for once
- at most 4 photo requests are in flight at once
- logging out drops the queued photo requests unsent
- a photo that does not display is not downloaded again within the minute

Calendar (`tests/calendar-attendees.spec.ts`), the students on an event. Prices follow the backend's rule: the
price set for the student on the event, else their own price while they are in the class, else the event's.
The professor, their students and events are set up through profile-service; the professor gets a subscription
row in the e2e database and loses Keycloak's default roles (profile-service acts on the first role in the
token, and the default STUDENT role can come first).

- a student taken out of the class is shown as "Inactiv" and not present when the event is finished, and is not
  charged; the others are present and pay their own price
- a student who left but did come can be marked present, and pays the price shown (the event's)
- a student added while finishing starts present, at their own price or the event's if they have none, and pays it
- the price set for a student on the event is shown and charged
- editing a recurring event: a new student starts at their own price, one taken off and put back keeps the price
  set for them
- a student added in the event form is saved (for that session) at their usual price, and pays it when the event
  is finished
- a price set for a student on one event does not follow them to the next event the professor makes
- prices adjusted to the real duration are worked out once, however often attendance is changed

\* These two need the `InvitationCodeGenerator` fix in profile-service (lowercase suffix, code cut to the
30-character column). Without it the backend answers 500 and the scenarios fail.

## Differences from production

- The realm export in `ementor-devops` dates from June 2025; the production realm has changed since
  (for example, it now stores `pictureId` and the Google `picture` as user attributes, which the export's
  user profile would drop). `build-realm.mjs` allows those attributes.
- The custom login theme is not in the public Keycloak image, so the tests use Keycloak's default pages,
  which have the same fields and flow.
- Google sign-in cannot run locally. A "Google account" is simulated by creating a verified user with the
  `picture` attribute, which is what Google sign-in leaves behind; Google photo links are answered with the
  local test image, so the suite needs no network.
- Lessons, quizzes, notifications and the user service are not part of the stack; their requests are
  blocked, so pages after registration show empty widgets.
