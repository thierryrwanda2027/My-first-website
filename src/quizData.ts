export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the typical 'window period' for HIV tests (the time between exposure and when a test can accurately detect the infection)?",
    options: ["1-2 days", "3-4 weeks", "3-6 months", "1-2 years"],
    correctIndex: 1
  },
  {
    id: 2,
    question: "Which of the following is true about PEP (Post-Exposure Prophylaxis)?",
    options: [
      "It must be started within 72 hours of potential HIV exposure.",
      "It is a lifelong treatment for HIV.",
      "It is a vaccine against HIV.",
      "It is taken before potential exposure to prevent HIV."
    ],
    correctIndex: 0
  },
  {
    id: 3,
    question: "What is the primary purpose of PrEP (Pre-Exposure Prophylaxis)?",
    options: [
      "To cure HIV.",
      "To prevent HIV infection in people who are HIV-negative but at high risk.",
      "To treat other sexually transmitted infections (STIs).",
      "To prevent pregnancy."
    ],
    correctIndex: 1
  },
  {
    id: 4,
    question: "As a peer health educator, what is the best way to demonstrate 'active listening' when a youth shares a sensitive issue?",
    options: [
      "Interrupt them to provide a quick solution.",
      "Look at your phone to give them privacy.",
      "Maintain appropriate eye contact, nod, and summarize what they've said.",
      "Tell them a story about someone who had a worse problem."
    ],
    correctIndex: 2
  },
  {
    id: 5,
    question: "Which of these represents a core principle of Mental Health First Aid?",
    options: [
      "Diagnosing the individual's mental health condition.",
      "Prescribing medication to calm them down.",
      "Listening non-judgmentally and providing reassurance and information.",
      "Forcing them to talk about their trauma immediately."
    ],
    correctIndex: 2
  },
  {
    id: 6,
    question: "If a peer tells you they have tested positive for HIV, what is your FIRST responsibility?",
    options: [
      "Tell their parents immediately so they can help.",
      "Ensure confidentiality and offer empathetic support.",
      "Post an anonymous warning on social media.",
      "Stop talking to them to avoid getting infected."
    ],
    correctIndex: 1
  },
  {
    id: 7,
    question: "What is the most effective way to reduce stigma around HIV and mental health in your community?",
    options: [
      "Avoid discussing the topics in public.",
      "Use accurate, person-first language and correct misconceptions gently.",
      "Only talk to people who are already educated on the topics.",
      "Use fear tactics to show how bad the diseases are."
    ],
    correctIndex: 1
  },
  {
    id: 8,
    question: "Which of the following is NOT a reliable method for preventing the transmission of HIV?",
    options: [
      "Consistent and correct use of condoms.",
      "Using PrEP if you are at high risk.",
      "Washing thoroughly after sexual intercourse.",
      "Achieving and maintaining an undetectable viral load through ART (U=U)."
    ],
    correctIndex: 2
  },
  {
    id: 9,
    question: "What does the concept 'U=U' stand for in HIV education?",
    options: [
      "Unprotected = Unsafe",
      "Undetectable = Untransmittable",
      "Universal = Understanding",
      "Urgent = Unavoidable"
    ],
    correctIndex: 1
  },
  {
    id: 10,
    question: "A youth is showing signs of severe anxiety and expresses feeling overwhelmed. What should you do?",
    options: [
      "Tell them they are overreacting and need to calm down.",
      "Validate their feelings, stay calm, and refer them to a professional counselor.",
      "Ignore it; they just want attention.",
      "Give them anti-anxiety medication if you have some."
    ],
    correctIndex: 1
  },
  {
    id: 11,
    question: "Which of the following describes an empathetic response?",
    options: [
      "'I know exactly how you feel, the same thing happened to me.'",
      "'You shouldn't feel that way, it's not a big deal.'",
      "'It sounds like you are going through a really difficult time right now. I'm here for you.'",
      "'At least you don't have it as bad as others.'"
    ],
    correctIndex: 2
  },
  {
    id: 12,
    question: "In the context of Sexual and Reproductive Health (SRH), what does 'informed consent' mean?",
    options: [
      "Saying 'yes' because of peer pressure.",
      "Agreeing to something while under the influence of drugs or alcohol.",
      "A clear, voluntary, and enthusiastic agreement to participate in a specific sexual activity.",
      "Assuming someone wants to have sex because of how they dress."
    ],
    correctIndex: 2
  },
  {
    id: 13,
    question: "When discussing contraceptive methods with a peer, a health educator should:",
    options: [
      "Only discuss abstinence as it is the safest method.",
      "Push them to use the method the educator personally prefers.",
      "Provide objective information about all available methods so the peer can make an informed choice.",
      "Refuse to discuss contraception if the peer is unmarried."
    ],
    correctIndex: 2
  },
  {
    id: 14,
    question: "Which of the following is a common myth about mental health?",
    options: [
      "Mental health issues can affect anyone.",
      "People with mental health conditions are violent and dangerous.",
      "Therapy and counseling can be effective treatments.",
      "Physical exercise can have a positive impact on mental health."
    ],
    correctIndex: 1
  },
  {
    id: 15,
    question: "If a peer discloses suicidal thoughts, what is the appropriate action?",
    options: [
      "Keep it a secret if they ask you to.",
      "Tell them they are being selfish.",
      "Take it seriously, do not leave them alone, and immediately seek help from a professional or crisis line.",
      "Change the subject to cheer them up."
    ],
    correctIndex: 2
  },
  {
    id: 16,
    question: "Why is it important for peer educators to understand their own biases?",
    options: [
      "So they can convince others to adopt their biases.",
      "Because biases do not affect how we interact with others.",
      "To ensure they provide non-judgmental and equitable support to all peers.",
      "So they can judge people more accurately."
    ],
    correctIndex: 2
  },
  {
    id: 17,
    question: "What is the role of a peer health educator in a clinical setting?",
    options: [
      "To diagnose illnesses and prescribe medication.",
      "To replace doctors and nurses.",
      "To bridge the gap between youth and healthcare providers, offering support and navigation.",
      "To perform physical examinations."
    ],
    correctIndex: 2
  },
  {
    id: 18,
    question: "How can a peer educator help a youth who is afraid of clinic stigma?",
    options: [
      "Tell them their fear is irrational.",
      "Explain the clinic's confidentiality policies and offer to accompany them.",
      "Suggest they buy medication from an unregistered pharmacy instead.",
      "Tell them they just have to be brave."
    ],
    correctIndex: 1
  },
  {
    id: 19,
    question: "Which of the following statements about STIs is true?",
    options: [
      "All STIs show obvious symptoms immediately.",
      "You cannot get an STI from oral sex.",
      "Many STIs are asymptomatic but can still be transmitted and cause long-term health issues.",
      "Only people with multiple partners get STIs."
    ],
    correctIndex: 2
  },
  {
    id: 20,
    question: "What is the core principle of confidentiality as a peer educator?",
    options: [
      "You can share information with your best friend.",
      "You must keep all information private unless there is an imminent risk of harm to the peer or others.",
      "You can discuss cases openly as long as you don't use names.",
      "Confidentiality only applies to written records, not spoken words."
    ],
    correctIndex: 1
  }
];