# UI Conventions

This document outlines UI component conventions.

## shadcn/ui

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components. Components are installed into the codebase (not imported from a package).

### Installation

```bash
pnpm dlx shadcn@latest add [component-name]
```

### Component Location

- shadcn components install to `app/components/ui/`
- Custom components go in `app/components/`

### Commonly Used Components

| Component  | Use Case                              |
| ---------- | ------------------------------------- |
| `Button`   | Interactive buttons, form submissions |
| `Select`   | Dropdowns and selection inputs        |
| `Textarea` | Multi-line text input                 |
| `Card`     | Content containers                    |
| `Badge`    | Status indicators, labels             |
| `Sonner`   | Toast notifications                   |

### Toast Notifications

Use Sonner for toast notifications:

```typescript
import { toast } from "sonner";

// Success
toast.success("Operation completed");

// Error
toast.error("Something went wrong");
```

## Form Validation (TanStack Form + Zod)

Use [TanStack Form](https://tanstack.com/form) with [Zod](https://zod.dev/) for form validation. This provides type-safe schemas and seamless React integration.

### Basic Setup

```typescript
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

// Define schema
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
});

// In component
const form = useForm({
  defaultValues: { email: "", name: "" },
  validators: {
    onSubmit: ({ value }) => {
      const result = formSchema.safeParse(value);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          fieldErrors[field] = issue.message;
        }
        return { fields: fieldErrors };
      }
      return;
    },
  },
  onSubmit: ({ value }) => {
    // Handle submission
  },
});
```

### Field Components

Use `form.Field` to connect inputs with validation:

```typescript
<form.Field
  name="email"
  children={(field) => (
    <div className="space-y-2">
      <label htmlFor={field.name}>Email</label>
      <Input
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-red-500">
          {field.state.meta.errors.join(", ")}
        </p>
      )}
    </div>
  )}
/>
```

### Form Submission

Use `form.Subscribe` to track form state and `form.handleSubmit` for submission:

```typescript
<form
  onSubmit={(event) => {
    event.preventDefault();
    event.stopPropagation();
    void form.handleSubmit();
  }}
>
  {/* Fields */}
  <form.Subscribe
    selector={(state) => [state.canSubmit, state.isSubmitting]}
    children={([canSubmit, isSubmitting]) => (
      <Button type="submit" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    )}
  />
</form>
```

### With React Router Actions

For server-side processing, combine TanStack Form validation with React Router actions:

```typescript
import { useFetcher } from 'react-router';

// In component
const fetcher = useFetcher();

const form = useForm({
  defaultValues: { ... },
  validators: {
    onSubmit: ({ value }) => {
      const result = formSchema.safeParse(value);
      if (!result.success) {
        // Return field errors
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
        return { fields: fieldErrors };
      }
      return;
    },
  },
  onSubmit: ({ value }) => {
    // Client-side validation passed, submit to action
    fetcher.submit(value, { method: 'POST' });
  },
});

// Check fetcher state for server errors
const serverError = fetcher.data?.error;
```

## Icons (Lucide)

Use [Lucide React](https://lucide.dev/) for icons:

```typescript
import { Clock, Loader, CheckCircle, XCircle } from 'lucide-react';

// Usage
<Clock className="h-4 w-4" />
<Loader className="h-4 w-4 animate-spin" />
```

### Common Icons

| Icon             | Use Case                            |
| ---------------- | ----------------------------------- |
| `Clock`          | Pending/queued states               |
| `Loader`         | Loading states (add `animate-spin`) |
| `CheckCircle`    | Success states                      |
| `XCircle`        | Error/failed states                 |
| `RefreshCw`      | Refresh actions                     |
| `GitPullRequest` | PR-related status                   |

### Brand Icons

Lucide is deprecating brand icons (see: https://github.com/lucide-icons/lucide/issues/670). Use [Simple Icons](https://simpleicons.org/) for brand/company logos instead.

**How to add brand icons:**

1. Find the icon at https://simpleicons.org/
2. Get the SVG from [simple-icons GitHub](https://github.com/simple-icons/simple-icons/tree/develop/icons)
3. Create a component in `app/components/icons/` with a source comment

```typescript
// app/components/icons/github-icon.tsx
// Source: https://simpleicons.org/?q=github

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12..." />
    </svg>
  );
}
```

**Important:** Always include a comment with the source URL for attribution and future reference.

## Tailwind CSS

This project uses Tailwind CSS for styling. Follow these conventions:

- Use Tailwind utility classes directly in components
- Use `dark:` prefix for dark mode variants
- Common text colors:
  - Primary: `text-zinc-900 dark:text-zinc-50`
  - Secondary: `text-zinc-600 dark:text-zinc-400`

## React Router v7 Patterns

### Form Handling

Use React Router's form patterns:

```typescript
import { Form, useActionData, useNavigation } from "react-router";

// In component
const actionData = useActionData<typeof action>();
const navigation = useNavigation();
const isSubmitting = navigation.state === "submitting";
```

### Data Revalidation

Use `useRevalidator()` for manual refresh:

```typescript
import { useRevalidator } from "react-router";

const { revalidate, state } = useRevalidator();
const isRefreshing = state === "loading";
```

### Error Handling

Return form data from actions on error for retry:

```typescript
// In action
if (error) {
  return { error: "Message", formData: { field1, field2 } };
}

// In component - repopulate form from actionData
<input defaultValue={actionData?.formData?.field1 ?? ""} />;
```
