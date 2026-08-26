---
description: Design System Tokens and Guidelines for the Agent
---

# Design System Guidelines

When building or modifying UI components in this project, you MUST strictly adhere to the following design system tokens and guidelines. Do NOT use arbitrary hex color codes (e.g., `#0064fa`, `#F8FAFC`) directly in the classes.

## Colors
- **Primary (Brand Color):** Use `bg-primary` or `text-primary`. The primary color is mapped to the brand blue (`#0064fa`).
- **Background:** Use `bg-background` or `bg-slate-50`. For pure white, use `bg-white`.
- **Destructive/Error:** Use `bg-destructive` or `text-destructive`. Map to `rose-500`.
- **Success:** Use `bg-emerald-500` or `text-emerald-500`.
- **Text:** 
  - Main titles: `text-slate-900`
  - Normal text: `text-slate-700` or `text-slate-800`
  - Subtext/muted: `text-slate-500` or `text-slate-400`

## Components
Always use the existing Shadcn UI components located in `src/components/ui/` instead of building custom ones from scratch. 
- Use `<Button>` for all buttons. 
- Use `<Input>`, `<Select>`, `<Checkbox>` for forms.
- Use `<Card>` for grouped content.
- Use `<Dialog>`, `<Collapsible>`, `<Sheet>` for layout and interactions.

## Consistency
Maintain consistent spacing using Tailwind padding/margin scales (e.g., `p-4`, `m-2`, `gap-4`). Use `flex` and `grid` layouts for alignment.
