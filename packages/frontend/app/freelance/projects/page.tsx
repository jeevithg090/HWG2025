import { redirect } from "next/navigation";

/** The project list is the freelance marketplace at /freelance. */
export default function ProjectsIndexPage() {
  redirect("/freelance");
}
