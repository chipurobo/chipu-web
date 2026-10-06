/** Proposed learning content, not an approved iHub rubric or a learner record.
 * Stable IDs and a version keep future assignments/evidence tied to the
 * framework that was used when they were recorded. */
export type LearningLevel = 'beginner' | 'intermediate' | 'expert';
export type LearningAudience = 'learner' | 'teacher';
export type CompetencyId =
  | 'algorithms'
  | 'programming'
  | 'debugging'
  | 'robotics'
  | 'design'
  | 'communication';

export interface Competency {
  id: CompetencyId;
  title: string;
  outcomes: Record<LearningLevel, string>;
  evidence: string;
  curriculumReferences: string[];
  basis: 'curriculum-adaptation' | 'chipurobo-extension';
}

export interface LearningActivity {
  id: string;
  pathwayId: string;
  level: LearningLevel;
  title: string;
  summary: string;
  competencyIds: CompetencyId[];
  materials: string[];
  steps: string[];
  artifact: string;
  reviewPrompt: string;
  teacherNotes: string[];
  resource?: { provider: 'Raspberry Pi Foundation'; title: string; url: string };
}

export const learningFramework = {
  id: 'chipurobo-coding-robotics',
  version: '0.1',
  status: 'draft',
  title: 'Coding and robotics',
  reviewNote:
    'KICD Grade 10 reference with a draft ChipuRobo Beginner, Intermediate and Expert mapping. Choosing a level does not award it.',
  referenceGrade: 10,
  application:
    'Grade 10 is the common reference, including for younger learners. Teachers adapt task complexity and delivery to each learner.',
  source: {
    title: 'KICD Grade 10 Computer Studies — July 2025',
    url: 'https://drive.google.com/file/d/1e5lBROYbbw6JeVCduFMCkWh1MbluV5M8/view',
    verifiedScope:
      'Current strand outline (printed page xii); program development (3.2, page 32), identifiers and operators (3.3, page 34), control structures (3.4, page 36), functions (3.6, page 40) and assessment-method examples (page 58), read in the official viewer on 6 October 2026.',
    currentTitle: 'KICD Grade 10 Computer Studies — July 2025',
    currentUrl: 'https://drive.google.com/file/d/1e5lBROYbbw6JeVCduFMCkWh1MbluV5M8/view',
    listingUrl: 'https://kicd.ac.ke/cbc-materials/curriculum-designs/grade-ten/',
    verification:
      'Relevant software-development outcomes have been checked against the current July 2025 design. The Beginner, Intermediate and Expert descriptors and review bands are ChipuRobo adaptations for teaching and assessing the programme. Robotics requires separate physical-computing evidence. This is not full syllabus coverage or an official KICD assessment rubric.',
  },
} as const;

export const learningLevels: { id: LearningLevel; title: string; description: string }[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Explore a concept, follow a sequence and explain what happened.',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Combine ideas, test alternatives and explain your choices.',
  },
  {
    id: 'expert',
    title: 'Expert',
    description: 'Design a solution, evaluate it against a brief and justify improvements.',
  },
];

export const competencies: Competency[] = [
  {
    id: 'algorithms',
    title: 'Plan a solution',
    curriculumReferences: ['3.2 Program development'],
    basis: 'curriculum-adaptation',
    outcomes: {
      beginner: 'Describe an ordered sequence of instructions for a simple task.',
      intermediate: 'Use repetition and decisions to describe a solution to a task.',
      expert: 'Compare alternative algorithms and justify a solution against its requirements.',
    },
    evidence:
      'A written, spoken or tactile sequence, flowchart or annotated algorithm, with an explanation.',
  },
  {
    id: 'programming',
    title: 'Create a program',
    curriculumReferences: [
      '3.3 Identifiers and operators',
      '3.4 Control structures',
      '3.6 Functions',
    ],
    basis: 'curriculum-adaptation',
    outcomes: {
      beginner: 'Create a short program and explain the order in which its instructions run.',
      intermediate: 'Combine events, repetition and decisions to make an interactive program.',
      expert:
        'Organise a program into reusable parts and explain how its data and control flow work.',
    },
    evidence:
      'Saved code or a readable code listing, plus a demonstration of the intended behaviour.',
  },
  {
    id: 'debugging',
    title: 'Test and debug',
    curriculumReferences: ['3.2 Program development'],
    basis: 'curriculum-adaptation',
    outcomes: {
      beginner: 'Compare an expected result with an actual result and correct a simple error.',
      intermediate: 'Use several test cases to locate a fault and check a correction.',
      expert: 'Plan tests, investigate failures systematically and document limitations.',
    },
    evidence: 'Expected and actual results, the change made and the result of testing again.',
  },
  {
    id: 'robotics',
    title: 'Connect code to the physical world',
    curriculumReferences: ['1.2 Computer architecture', '1.3 Input/output devices'],
    basis: 'chipurobo-extension',
    outcomes: {
      beginner: 'Identify an input, a processing step and an output in a familiar system.',
      intermediate:
        'Explain and test how an input controls an output in a model or physical system.',
      expert:
        'Build and evaluate a physical-computing solution against safety and performance requirements.',
    },
    evidence:
      'An annotated system model or build, code where applicable, and observed input/output behaviour.',
  },
  {
    id: 'design',
    title: 'Design and improve',
    curriculumReferences: ['3.2 Program development'],
    basis: 'chipurobo-extension',
    outcomes: {
      beginner: 'State a user need and propose a simple solution.',
      intermediate: 'Build a prototype and improve it using test results or user feedback.',
      expert:
        'Evaluate trade-offs, accessibility and reliability, and justify iterations against a design brief.',
    },
    evidence:
      'A brief, an accessible description of the prototype and an explanation of changes made.',
  },
  {
    id: 'communication',
    title: 'Explain and collaborate',
    curriculumReferences: ['3.2 Program development'],
    basis: 'chipurobo-extension',
    outcomes: {
      beginner: 'Explain what you made and identify your contribution.',
      intermediate: 'Explain design choices and document each contributor’s work.',
      expert:
        'Present a solution, its evidence and its limitations to an audience and respond to feedback.',
    },
    evidence:
      'An explanation in an accessible format and identifiable contributions for group work.',
  },
];

export const learningPathways = [
  {
    id: 'creative-coding',
    title: 'Creative coding',
    description: 'Turn ideas into programs, from a first sequence to an interactive experience.',
  },
  {
    id: 'physical-computing',
    title: 'Physical computing and robotics',
    description: 'Explore inputs and outputs, then design and test a system for a real need.',
  },
  {
    id: 'project-design',
    title: 'Design and share a project',
    description:
      'Understand a need, improve a prototype and explain the evidence behind your work.',
  },
] as const;

export const evidenceRubric = [
  {
    id: 'not-observed',
    title: 'Not yet observed',
    description:
      'There is not enough evidence to make a decision. Provide another opportunity to demonstrate the outcome.',
  },
  {
    id: 'developing',
    title: 'Developing',
    description:
      'Some parts of the outcome are demonstrated. Identify the specific skill that needs further practice.',
  },
  {
    id: 'demonstrated',
    title: 'Demonstrated',
    description:
      'The work and the learner’s explanation show the expected outcome for this activity and level.',
  },
  {
    id: 'extending',
    title: 'Extending',
    description:
      'The learner applies the skill to a new situation and explains the choices and limitations.',
  },
] as const;

export const inclusiveLearningSupports = [
  'Use a screen reader and keyboard with text instructions. Describe visual information and provide readable code or a tactile model where needed.',
  'Provide written instructions and transcripts or captions for any audio or video used. Do not rely on sound to communicate a result.',
  'Accept evidence as text, an accessible code listing, a captioned recording, a spoken explanation with a transcript, or a teacher-recorded demonstration.',
  'Accessibility tools and communication support do not reduce the competency judgment. Record the prompting needed for the learning task separately.',
];

export const learningActivities: LearningActivity[] = [
  {
    id: 'first-program',
    pathwayId: 'creative-coding',
    level: 'beginner',
    title: 'Make a program with input and output',
    summary: 'Create a short program that accepts an input and produces a result.',
    competencyIds: ['algorithms', 'programming', 'debugging'],
    materials: [
      'A teacher-selected accessible coding tool',
      'A readable example showing input, a variable and output',
    ],
    steps: [
      'Describe the input your program will accept and the result you expect.',
      'Create a short program that stores the input in a variable and displays an output.',
      'Run the program with two different inputs and record the results.',
      'Compare the results with your predictions, correct an error if needed and explain the instruction order.',
    ],
    artifact:
      'Your readable code listing, two inputs with their expected and actual results, and an explanation of the variable.',
    reviewPrompt: 'Where is the input stored, and which instruction produces the output?',
    teacherNotes: [
      'Verify keyboard and screen-reader access in the selected coding tool.',
      'Begin with text input/output so the result does not depend on pictures or sound.',
      'Adapt the example and pacing for younger learners while retaining the input/output outcome.',
    ],
  },
  {
    id: 'first-sequence',
    pathwayId: 'creative-coding',
    level: 'beginner',
    title: 'Give clear instructions',
    summary: 'Build a Blockly program that prints an ordered sequence, then test and improve it.',
    competencyIds: ['algorithms', 'debugging', 'communication'],
    materials: [
      'The Blockly workspace in your dashboard lesson',
      'A partner to test the sequence',
    ],
    steps: [
      'Choose a familiar task with a clear start and finish.',
      'Connect print blocks in Blockly to show each instruction in order. Predict the output.',
      'Run the program. Ask a partner to follow its output and compare the results with your prediction.',
      'Improve an unclear instruction in its text block, run again, and submit your program with an explanation.',
    ],
    artifact:
      'Your saved Blockly program, its run output, expected and actual results, and a short explanation.',
    reviewPrompt: 'Which instruction changed, and what did the second test show?',
    teacherNotes: [
      'Model a short sequence without giving the learner their solution.',
      'Offer a nonvisual task and an accessible recording method.',
      'Ask each learner to explain a change; a group result alone does not establish individual understanding.',
    ],
  },
  {
    id: 'interactive-story',
    pathwayId: 'creative-coding',
    level: 'intermediate',
    title: 'Make an interactive story',
    summary: 'Use events, repetition and a decision to change what happens in a story.',
    competencyIds: ['algorithms', 'programming', 'debugging'],
    materials: [
      'The Blockly workspace in your dashboard lesson',
      'A text description of your story and its choices',
    ],
    steps: [
      'Describe two possible paths through your story.',
      'Plan the event that starts it, a repeated action and a decision.',
      'Build the story in Blockly with print, loop and if blocks. Use a variable for the choice.',
      'Test both paths. Record a fault, your correction and the retest.',
    ],
    artifact: 'A readable code listing, your story plan and results for both test paths.',
    reviewPrompt: 'How do the event, repeated action and decision change the program?',
    teacherNotes: [
      'Check Blockly keyboard and screen-reader controls with the learner before starting.',
      'Provide text equivalents for visual or audio story elements.',
      'Review the learner’s control flow and test results rather than the visual polish.',
    ],
    resource: {
      provider: 'Raspberry Pi Foundation',
      title: 'Explore external coding projects',
      url: 'https://projects.raspberrypi.org/en',
    },
  },
  {
    id: 'reusable-program',
    pathwayId: 'creative-coding',
    level: 'expert',
    title: 'Build a reusable program',
    summary: 'Organise an interactive program into reusable parts and test its limits.',
    competencyIds: ['algorithms', 'programming', 'debugging', 'communication'],
    materials: ['The Blockly workspace in your dashboard lesson', 'A brief stating the intended behaviour'],
    steps: [
      'Define the behaviour your program must provide and compare two possible approaches.',
      'Separate repeated behaviour into reusable parts and explain their inputs and outputs.',
      'Test normal cases, boundary cases and unexpected inputs.',
      'Present your code, test results, a limitation and an improvement.',
    ],
    artifact:
      'Code, a description of the program structure and a test log that includes failures and retests.',
    reviewPrompt: 'Why did you choose this structure, and which test exposed a limitation?',
    teacherNotes: [
      'Agree the brief before implementation.',
      'Assess the learner’s reasoning and evidence against the listed outcomes.',
      'Do not infer an Expert level from project completion alone.',
    ],
  },
  {
    id: 'inputs-and-outputs',
    pathwayId: 'physical-computing',
    level: 'beginner',
    title: 'Explore inputs and outputs',
    summary: 'Explain how a familiar system senses something and responds.',
    competencyIds: ['robotics', 'algorithms'],
    materials: [
      'A familiar system, a described example or an accessible model',
      'A way to record your explanation',
    ],
    steps: [
      'Choose a system such as an automatic door or a push-button light.',
      'Identify its input, the processing step and its output.',
      'Describe the sequence from input to output.',
      'Predict what happens when the input changes and check your prediction using the example or model.',
    ],
    artifact:
      'An annotated or tactile model, or a text explanation, with a prediction and observation.',
    reviewPrompt: 'What is the input, what decision is made and what is the output?',
    teacherNotes: [
      'Provide descriptions of components rather than depending on pictures.',
      'Use a model when physical hardware is unavailable.',
      'Keep device handling supervised and appropriate to the school’s safety procedures.',
    ],
  },
  {
    id: 'responsive-system',
    pathwayId: 'physical-computing',
    level: 'intermediate',
    title: 'Make a system respond',
    summary: 'Test a rule that turns an input into an output.',
    competencyIds: ['robotics', 'programming', 'debugging', 'design'],
    materials: [
      'A teacher-approved kit or accessible system model',
      'A readable description of the input and output',
    ],
    steps: [
      'State a need and choose an input and output that address it.',
      'Describe and implement a rule connecting the input to the output.',
      'Test at least three input conditions and compare expected and actual results.',
      'Improve the rule or prototype and explain the evidence for the change.',
    ],
    artifact: 'Your system description, readable code or rules, and before/after test results.',
    reviewPrompt: 'How did the input affect the output, and why did you change the system?',
    teacherNotes: [
      'Check the hardware and accessible tool setup before delivery.',
      'Offer a model-based route with the same learning outcome.',
      'Record each learner’s explanation and contribution separately.',
    ],
    resource: {
      provider: 'Raspberry Pi Foundation',
      title: 'Explore external physical-computing projects',
      url: 'https://projects.raspberrypi.org/en',
    },
  },
  {
    id: 'robotics-design-brief',
    pathwayId: 'physical-computing',
    level: 'expert',
    title: 'Solve a robotics design brief',
    summary:
      'Evaluate a physical-computing solution against a real need and explicit requirements.',
    competencyIds: ['robotics', 'design', 'debugging', 'communication'],
    materials: [
      'A teacher-approved robotics kit',
      'An agreed brief with accessibility, safety and performance requirements',
    ],
    steps: [
      'Agree the user need, success criteria and safe operating conditions with your teacher.',
      'Compare two designs and justify your choice.',
      'Build the solution and test it against the agreed requirements.',
      'Document failures, improvements and remaining limitations, then demonstrate your solution.',
    ],
    artifact:
      'The brief, build description, code, test evidence and explanation of design trade-offs.',
    reviewPrompt:
      'Which requirements did the system meet, and what evidence supports your conclusion?',
    teacherNotes: [
      'Approve safe operating conditions before building.',
      'Review accessibility and reliability as part of the design brief.',
      'Use demonstrations and explanations to identify individual competency within group work.',
    ],
  },
  {
    id: 'describe-a-need',
    pathwayId: 'project-design',
    level: 'beginner',
    title: 'Start with a learner’s need',
    summary: 'Describe a problem and explain a simple idea for solving it.',
    competencyIds: ['design', 'communication'],
    materials: ['A familiar classroom problem', 'An accessible way to describe or model an idea'],
    steps: [
      'Describe a problem and who experiences it.',
      'Ask the person what a useful solution would do.',
      'Sketch, describe or model a simple solution.',
      'Explain how the idea addresses the need and identify your contribution.',
    ],
    artifact: 'A short brief and an accessible description or model of your idea.',
    reviewPrompt: 'Who is the solution for, and how would it help them?',
    teacherNotes: [
      'Choose a problem learners can discuss without collecting sensitive personal information.',
      'Accept descriptions and tactile models as alternatives to drawings.',
      'Ask for each learner’s contribution and reasoning.',
    ],
  },
  {
    id: 'improve-a-prototype',
    pathwayId: 'project-design',
    level: 'intermediate',
    title: 'Improve a prototype',
    summary: 'Use tests and feedback to make a project more useful.',
    competencyIds: ['design', 'debugging', 'communication'],
    materials: ['A prototype or accessible model', 'A brief and a feedback recording method'],
    steps: [
      'State the intended behaviour and divide the work so each contribution is clear.',
      'Test the prototype with the intended user and record what worked and what did not.',
      'Choose an improvement based on the evidence.',
      'Retest and explain the change and each contributor’s work.',
    ],
    artifact:
      'The brief, initial prototype description, feedback and a record of the revised test.',
    reviewPrompt: 'Which evidence led to your improvement, and what changed in the retest?',
    teacherNotes: [
      'Prepare accessible instructions for the user test.',
      'Distinguish user feedback from a teacher competency judgment.',
      'Make individual contributions visible in the group evidence.',
    ],
  },
  {
    id: 'showcase-evidence',
    pathwayId: 'project-design',
    level: 'expert',
    title: 'Present a project with evidence',
    summary: 'Explain a solution, defend the design choices and respond to feedback.',
    competencyIds: ['design', 'debugging', 'communication'],
    materials: [
      'A completed project or prototype',
      'The design brief, code or model, and test records',
    ],
    steps: [
      'Organise the brief, artifacts and test results into a clear explanation.',
      'Evaluate accessibility, reliability and design trade-offs against the brief.',
      'Present in an accessible format and answer questions about the evidence.',
      'Record feedback, remaining limitations and a justified next improvement.',
    ],
    artifact: 'An accessible project presentation, evidence references and a response to feedback.',
    reviewPrompt: 'What does the evidence demonstrate, and what remains unproven?',
    teacherNotes: [
      'Provide captions/transcripts and descriptions for presentation media.',
      'Judge against learning outcomes rather than competition ranking.',
      'Review what each learner can explain and demonstrate.',
    ],
  },
];

export function findLearningActivity(id: string | undefined): LearningActivity | undefined {
  return learningActivities.find((activity) => activity.id === id);
}

export function getActivityCompetencies(activity: LearningActivity): Competency[] {
  return activity.competencyIds.map((id) => {
    const competency = competencies.find((item) => item.id === id);
    if (!competency) throw new Error(`Unknown competency ${id} in ${activity.id}`);
    return competency;
  });
}
