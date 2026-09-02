# Kfit Development Roadmap: Next Steps

## Completed Milestones
✅ **Authentication System** (JWT, Registration, Login, Protected Routes)
✅ **Contextual Notes & Lookback** (Previous session data pushed to the active UI)
✅ **Volume & Progression Engine** (Shifted from Tonnage to Sets/Week & Estimated 1RM)
✅ **Scoreboard UI Redesign** (Template vs. Active Session split, dark mechanical aesthetic)

---

## Upcoming Focus: Roles & The Coaching Engine
The primary goal of the next development phase is to implement the **Coach/Student ecosystem** defined in the original Software Requirements Specification (SRS).

### Phase 1: Backend Architecture & Database (Spring Boot)
1. **Implement Role-Based Access Control (RBAC):**
   - Expand the JWT configuration and `SecurityConfig` to properly handle `ALUNO`, `TREINADOR`, and `ADMIN` roles.
2. **Coach-Student Relationship (Invitations):**
   - Create a `coach_student_link` table or similar mechanism.
   - Build a flow for a Coach to generate an "invite" (code or direct association) that an Aluno can accept to establish the link.
3. **Template Delegation:**
   - Update the `Workout` (Template) entity so that a Coach can author a template and assign it directly to a specific linked student.
4. **Admin Privileges:**
   - Create generic endpoints (or modify existing ones) that allow an `ADMIN` role to bypass standard ownership checks (e.g., viewing all users, modifying any template).

### Phase 2: Frontend Adaptation (React / Vite)
1. **Role-Aware Navigation & UI:**
   - Update `AuthContext` to expose the user's role.
   - Adjust the `Sidebar` and routing so that Coaches see a different primary navigation (e.g., "My Students", "Global Templates") than regular Students.
2. **The Coach Dashboard:**
   - Build a view for the Coach to see a roster of linked students.
   - Allow the Coach to click into a student's profile to view their progress metrics (e1RM graphs) and compliance (Workouts logged this week).
3. **Template Assignment UI:**
   - Modify the Template Builder (`WorkoutsList.tsx`) so that if the user is a Coach, they have an option to push the saved template to a specific student's library.
4. **Orientation Editing:**
   - Ensure the UI allows Coaches to write execution notes/orientations on the templates they build, which the student will then see when they start their active session.
