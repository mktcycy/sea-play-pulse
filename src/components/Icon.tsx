import { icons, type LucideProps } from "lucide-react";

// Render a lucide icon by name, with a safe fallback.
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = (icons as Record<string, React.ComponentType<LucideProps>>)[name] ?? icons.Gamepad2;
  return <Cmp {...props} />;
}
