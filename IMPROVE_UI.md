# UI Improvement Plan

This document outlines a plan to migrate the current project's UI to a more modern tech stack, inspired by the `tariffs` project. The goal is to improve the look and feel of the application, and to have better management of UI components.

## Tech Stack Comparison

| Technology      | Current Project (`distances`) | Target Project (`tariffs`) |
| :-------------- | :---------------------------- | :------------------------- |
| **Next.js**     | ~15.4.3                       | 15.5.6                     |
| **Styling**     | Tailwind CSS v3, daisyUI      | Tailwind CSS v4, Headless UI |
| **UI Components** | Custom components             | Unstyled, accessible components from Headless UI |
| **Linting**     | Basic `next lint`             | More advanced ESLint setup |

## Migration Plan

Here is a step-by-step plan to migrate the current project to the new tech stack:

1.  **Upgrade Dependencies:**
    *   Upgrade Next.js to the latest version.
    *   Upgrade Tailwind CSS to v4 and update the configuration.
    *   Install `@headlessui/react`.
    *   Upgrade the ESLint configuration.

2.  **Refactor UI Components:**
    *   Create a new set of UI components in a `src/components/ui` directory using Headless UI and Tailwind CSS v4. We will start with common components like `Button`, `Input`, `Select`, and `Card`.
    *   We will use the provided `page.tsx` from the `tariffs` project as a reference for the new UI's style and structure.

3.  **Update Existing Components:**
    *   Incrementally replace the existing UI components with the new ones. We'll start with the main form in the application (`DataForm.tsx`) and then move to the layouts (`DesktopLayout.tsx` and `MobileLayout.tsx`).

4.  **Update Styling:**
    *   Update the `tailwind.config.js` and `globals.css` files to be compatible with Tailwind CSS v4.

5.  **Testing:**
    *   Thoroughly test the application after each step to ensure that everything is working as expected.
