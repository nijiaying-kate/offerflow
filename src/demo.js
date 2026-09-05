import { blankState, newJob, newMaterial, newResume, dateKey } from "./model";

export function demoState() {
  const state = blankState();
  const offset = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return dateKey(d);
  };
  state.jobs = [
    [
      "Example Studio",
      "Product Analyst",
      "Shanghai",
      "to_apply",
      "high",
      3,
      "Tailor portfolio highlights",
      "Product",
    ],
    [
      "Sample Works",
      "Research Associate",
      "Beijing",
      "interviewing",
      "high",
      7,
      "Prepare project stories",
      "Research",
    ],
    [
      "Demo Collective",
      "Operations Graduate",
      "Shenzhen",
      "applied",
      "medium",
      12,
      "Follow up next week",
      "Operations",
    ],
    [
      "Fictional Labs",
      "Data Analyst",
      "Remote",
      "resume_in_progress",
      "high",
      5,
      "Add research metrics to resume",
      "Data",
    ],
    [
      "Example Partners",
      "Strategy Intern",
      "Shanghai",
      "to_review",
      "low",
      18,
      "Review eligibility",
      "Strategy",
    ],
  ].map(
    ([
      company,
      role,
      location,
      status,
      priority,
      days,
      next_action,
      role_category,
    ]) =>
      newJob({
        company,
        role,
        location,
        status,
        priority,
        deadline: offset(days),
        open_date: offset(-7),
        next_action,
        role_category,
        source: "Fictional demo",
        job_link: "https://example.com",
        notes: "Fictional example. This is not a real vacancy.",
      }),
  );
  const material = {
    ...newMaterial(),
    title: "Turning research into a clear recommendation",
    type: "star_story",
    tags: "Analysis, communication",
    role_categories: "Product, Research",
    body: "Fictional example: A student project involved conflicting survey findings. I organized the evidence, compared three explanations, and presented a recommendation to the project team.",
    quantified_results:
      "Fictional example: Reviewed 120 responses and delivered a 10-minute presentation.",
    resume_phrasing:
      "Analyzed 120 survey responses and translated findings into a prioritized project recommendation.",
    interview_phrasing:
      "I started by separating what the evidence showed from what we were assuming.",
  };
  state.materials = [material];
  state.resumes = [
    {
      ...newResume(state.jobs[0]),
      name: "Product & analytics",
      job_description:
        "Fictional example: Research user needs, analyze product data, and communicate recommendations.",
      job_description_keywords: "Research, analysis, communication",
      matched_material_ids: [material.id],
      resume_draft: "PROJECT EXPERIENCE\n\n" + material.resume_phrasing,
    },
  ];
  return state;
}
