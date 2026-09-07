# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Intermediate to advanced gym-goers. They already know how to train and don't need hand-holding or tutorials on how to build a workout. They need efficient tools to quickly construct routines, log sessions, and track long-term progression without friction.

## Product Purpose
To provide a frictionless environment for building workout templates and logging active sessions, ultimately answering the question: "Am I actually making progress?"

## Positioning
Deep, visual progress tracking. While other apps focus on social features or beginner tutorials, Kfit's core differentiator is its sophisticated graphical metrics (e.g., tracking Estimated 1 Rep Max over rolling windows) that clearly and immediately visualize strength progression or stagnation per exercise.

## Operating Context
- Used mid-workout on mobile devices (in the gym), where attention spans are short and data entry must be fast.
- Used post-workout or on rest days (desktop/mobile) for building templates and analyzing progression graphs.

## Capabilities and Constraints
- Dual-pane architecture: separation of "Template Building" vs "Active Session Logging".
- Volume tracked via "Weekly Sets" rather than raw tonnage.
- Strength tracked via "Estimated 1RM" to account for changing rep ranges.
- Qualitative note-taking per exercise (with historical lookback).
- No social feeds or beginner tutorial content.

## Evidence on Hand
- Working Spring Boot backend with JWT authentication and PostgreSQL.
- Fully functional React frontend (Vite) with working chart implementations.

## Product Principles
1. **Frictionless Logging**: Getting data in during a workout must be faster than writing it in a notebook.
2. **Clarity of Progress**: The user should never have to guess if they are getting stronger. The data visualization must make the answer obvious.
3. **Out of the Way**: Respect the user's intelligence. No forced onboarding, no unasked-for advice. Give them the tools and get out of the way.
