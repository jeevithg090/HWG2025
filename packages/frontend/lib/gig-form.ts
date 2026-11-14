/** Helpers for the "create gig" form. */

export const CATEGORY_LABELS: Record<string, string> = {
  "web-development": "Web Development",
  "mobile-development": "Mobile Development",
  "ui-ux-design": "UI/UX Design",
  "data-science": "Data Science & Analytics",
  devops: "DevOps & Cloud",
  blockchain: "Blockchain",
  "ai-ml": "AI & Machine Learning",
  "qa-testing": "QA & Testing",
};

export const DURATION_LABELS: Record<string, string> = {
  "1-week": "Less than 1 week",
  "1-month": "1-4 weeks",
  "1-3-months": "1-3 months",
  "3-6-months": "3-6 months",
  "6-months-plus": "6+ months",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  entry: "Entry Level",
  intermediate: "Intermediate",
  expert: "Expert",
};

export interface GigFormData {
  title: string;
  description: string;
  category: string;
  budget: string;
  budgetType: "fixed" | "hourly";
  duration: string;
  deadline: string;
  experienceLevel: string;
  projectLocation: string;
  isRemote: boolean;
  requirements: string;
  deliverables: string;
}

/**
 * The freelance service stores title, description, budget, skills and deadline.
 * The remaining form fields are appended to the description so they are not lost.
 */
export function buildGigDescription(form: GigFormData): string {
  const details = [
    form.category && `Category: ${CATEGORY_LABELS[form.category] ?? form.category}`,
    `Budget type: ${form.budgetType === "hourly" ? "Hourly rate" : "Fixed price"}`,
    form.duration && `Duration: ${DURATION_LABELS[form.duration] ?? form.duration}`,
    form.experienceLevel &&
      `Experience level: ${EXPERIENCE_LABELS[form.experienceLevel] ?? form.experienceLevel}`,
    `Location: ${form.isRemote ? "Remote" : form.projectLocation.trim() || "On-site"}`,
  ].filter(Boolean);

  const sections = [form.description.trim(), details.join("\n")];
  if (form.requirements.trim()) sections.push(`Requirements:\n${form.requirements.trim()}`);
  if (form.deliverables.trim()) sections.push(`Deliverables:\n${form.deliverables.trim()}`);
  return sections.join("\n\n");
}
