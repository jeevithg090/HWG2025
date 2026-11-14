import { redirect } from "next/navigation";

/** Kept for old links: project creation lives at /freelance/projects/create. */
export default function LegacyCreateProjectPage() {
  redirect("/freelance/projects/create");
}
