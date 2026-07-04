export interface Tip {
  slug: string;
  title: string;
  summary: string;
  content: string;
  icon: string;
}

export interface TipCategory {
  slug: string;
  name: string;
  overview: string;
  tips: Tip[];
}

export const tipsData: TipCategory[] = [
  {
    slug: "writing",
    name: "Writing",
    overview: `
      <p>The IELTS Writing test assesses your ability to produce two pieces of writing: Task 1 and Task 2.</p>
      <p><strong>Task 1</strong> requires you to describe visual information (graphs, charts, tables, diagrams) in at least 150 words.</p>
      <p><strong>Task 2</strong> is an essay response to a topic, requiring at least 250 words where you present an argument, discuss a problem, or propose a solution.</p>
      <p>You have 60 minutes to complete both tasks, with Task 2 worth twice as much as Task 1.</p>
    `,
    tips: [
      {
        slug: "connectors",
        title: "Connectors & Linking Words",
        summary: "Essential connecting words to improve cohesion and flow in your writing.",
        icon: "link",
        content: `
          <h2>Connectors & Linking Words</h2>
          <p>Using a variety of connectors is essential for achieving a high band score in Coherence and Cohesion. Here are the main categories:</p>

          <h3>Addition</h3>
          <ul>
            <li><strong>Furthermore</strong> - Moreover, the study showed...</li>
            <li><strong>In addition</strong> - In addition, many companies have adopted...</li>
            <li><strong>Additionally</strong> - Additionally, the cost has decreased...</li>
            <li><strong>Besides</strong> - Besides the economic benefits, there are...</li>
            <li><strong>Not only... but also</strong> - Not only does it save time, but also reduces costs.</li>
          </ul>

          <h3>Contrast</h3>
          <ul>
            <li><strong>However</strong> - The population increased; however, resources remained limited.</li>
            <li><strong>Nevertheless</strong> - The challenges were significant. Nevertheless, the project succeeded.</li>
            <li><strong>On the other hand</strong> - Some argue for technology. On the other hand, others prefer traditional methods.</li>
            <li><strong>Although/Though</strong> - Although the initial cost was high, long-term savings were substantial.</li>
            <li><strong>Despite/In spite of</strong> - Despite the weather, the event went ahead.</li>
            <li><strong>Whereas/While</strong> - Some countries favor nuclear energy, whereas others prefer renewable sources.</li>
          </ul>

          <h3>Cause & Effect</h3>
          <ul>
            <li><strong>Therefore</strong> - The demand increased; therefore, prices rose.</li>
            <li><strong>Consequently</strong> - Many factories closed. Consequently, unemployment rose.</li>
            <li><strong>As a result</strong> - Temperatures rose globally. As a result, ice caps melted.</li>
            <li><strong>Thus</strong> - The population grew rapidly, thus straining resources.</li>
            <li><strong>Hence</strong> - The evidence is clear; hence, we must take action.</li>
          </ul>

          <h3>Examples</h3>
          <ul>
            <li><strong>For instance</strong> - Many countries, for instance, Japan and South Korea, have aging populations.</li>
            <li><strong>Such as</strong> - Renewable energy sources, such as solar and wind power, are becoming popular.</li>
            <li><strong>In particular</strong> - Digital services, in particular, online streaming, have grown significantly.</li>
            <li><strong>To illustrate</strong> - To illustrate this point, consider the case of Sweden.</li>
          </ul>

          <h3>Sequencing & Time</h3>
          <ul>
            <li><strong>Initially</strong> - Initially, the program faced opposition.</li>
            <li><strong>Subsequently</strong> - Subsequently, the policy was modified.</li>
            <li><strong>Finally</strong> - Finally, after many years, the project was completed.</li>
            <li><strong>Meanwhile</strong> - Meanwhile, other sectors continued to grow.</li>
            <li><strong>At the same time</strong> - At the same time, we must consider environmental impacts.</li>
          </ul>

          <h3>Conclusion</h3>
          <ul>
            <li><strong>In conclusion</strong> - In conclusion, urbanization has both benefits and drawbacks.</li>
            <li><strong>To sum up</strong> - To sum up, education is crucial for economic development.</li>
            <li><strong>Overall</strong> - Overall, the results were positive.</li>
            <li><strong>In summary</strong> - In summary, the findings support the hypothesis.</li>
          </ul>

          <h3>Tips for Using Connectors</h3>
          <ul>
            <li>Don't overuse the same connectors. Use a variety to show range.</li>
            <li>Place connectors at the beginning of sentences or clauses for clarity.</li>
            <li>Never start a sentence with "And" or "But" in formal academic writing.</li>
            <li>Use connectors within paragraphs to connect ideas, not just between paragraphs.</li>
            <li>Practice using connectors naturally - forced use can sound awkward.</li>
          </ul>
        `,
      },
      {
        slug: "essay-structure",
        title: "Essay Structure",
        summary: "The ideal 4-paragraph structure for IELTS Writing Task 2 essays.",
        icon: "article",
        content: `
          <h2>Essay Structure</h2>
          <p>A well-structured essay is crucial for achieving a high band score. The recommended structure for IELTS Writing Task 2 is:</p>

          <h3>Paragraph 1: Introduction</h3>
          <p>The introduction should be 2-3 sentences and include:</p>
          <ul>
            <li><strong>Paraphrase the topic</strong> - Restate the question in your own words</li>
            <li><strong>Thesis statement</strong> - Give a clear, concise answer to the question</li>
            <li><strong>Outline</strong> - Briefly mention the main points you will discuss</li>
          </ul>
          <p><em>Example:</em> "While some people believe that [viewpoint A], others argue that [viewpoint B]. In my opinion, [your view]. This essay will discuss [main points to be covered]."</p>

          <h3>Paragraph 2: Body Paragraph 1</h3>
          <p>Each body paragraph should:</p>
          <ul>
            <li><strong>Start with a topic sentence</strong> - Introduce the main idea of the paragraph</li>
            <li><strong>Explain the idea</strong> - Expand on your topic sentence</li>
            <li><strong>Provide evidence</strong> - Use examples, facts, or data to support your point</li>
            <li><strong>Conclude the paragraph</strong> - Link back to the main argument</li>
          </ul>
          <p>Use: "First/Firstly... Furthermore... For example..."</p>

          <h3>Paragraph 3: Body Paragraph 2</h3>
          <p>Similar structure to paragraph 2, but discuss your second main point:</p>
          <ul>
            <li><strong>Topic sentence</strong> - Introduce second main point</li>
            <li><strong>Explanation</strong> - Develop the idea further</li>
            <li><strong>Evidence</strong> - Support with examples or data</li>
          </ul>
          <p>Use: "Second/Secondly... In addition... For instance..."</p>

          <h3>Paragraph 4: Conclusion</h3>
          <p>The conclusion should:</p>
          <ul>
            <li><strong>Restate your thesis</strong> - Rephrase your overall answer to the question</li>
            <li><strong>Summarize main points</strong> - Briefly recap the key arguments made</li>
            <li><strong>End with a final thought</strong> - A broader statement about the topic (optional)</li>
          </ul>
          <p><em>Important:</em> Do not introduce new ideas in the conclusion.</p>
          <p>Use: "In conclusion... To sum up... Overall..."</p>

          <h3>Key Principles</h3>
          <ul>
            <li>Keep your introduction and conclusion brief (3-4 sentences each)</li>
            <li>Make your body paragraphs substantial (4-6 sentences each)</li>
            <li>Each paragraph should focus on one main idea</li>
            <li>Use a variety of grammatical structures and vocabulary</li>
            <li>Ensure logical flow between paragraphs with connectors</li>
          </ul>
        `,
      },
      {
        slug: "task-1-tips",
        title: "Task 1 Academic Tips",
        summary: "Key strategies for describing graphs, charts, and diagrams effectively.",
        icon: "analytics",
        content: `
          <h2>Task 1 Academic Tips</h2>
          <p>Task 1 requires you to describe visual information in at least 150 words. Here's how to excel:</p>

          <h3>Understanding the Task</h3>
          <ul>
            <li>Identify the type of visual: line graph, bar chart, pie chart, table, diagram, or combination</li>
            <li>Note the time period (if present) - past, future projections, or both</li>
            <li>Determine the units of measurement (%, dollars, people, etc.)</li>
            <li>Look for overall trends - increasing, decreasing, stable, fluctuating</li>
          </ul>

          <h3>Structure for Task 1</h3>
          <p><strong>Paragraph 1:</strong> Paraphrase the question (1-2 sentences)</p>
          <p><strong>Paragraph 2:</strong> Describe the main overall trends/features (2-3 sentences)</p>
          <p><strong>Paragraph 3:</strong> Describe specific data and comparisons (3-4 sentences)</p>

          <h3>Vocabulary for Describing Trends</h3>
          <ul>
            <li><strong>Verbs:</strong> increase, rise, grow, decrease, decline, fall, fluctuate, remain stable, reach a peak, hit a low, dip, soar, plummet</li>
            <li><strong>Adjectives:</strong> dramatic, significant, slight, gradual, steady, sharp, moderate, marginal</li>
            <li><strong>Adverbs:</strong> dramatically, significantly, slightly, gradually, steadily, sharply, considerably</li>
          </ul>

          <h3>Comparing Data</h3>
          <ul>
            <li>Use superlatives: "the highest," "the lowest," "the most significant"</li>
            <li>Use comparatives: "higher than," "lower than," "similar to," "unlike"</li>
            <li>Use approximate numbers: "approximately," "around," "about," "just over," "just under"</li>
          </ul>

          <h3>Common Mistakes to Avoid</h3>
          <ul>
            <li>Don't list every piece of data - select key features and trends</li>
            <li>Don't write less than 150 words</li>
            <li>Don't include your own opinions - only describe the data</li>
            <li>Don't copy phrases from the question - always paraphrase</li>
            <li>Don't confuse verbs (e.g., "raise" vs "rise" - raise is transitive)</li>
          </ul>
        `,
      },
      {
        slug: "band-7-strategies",
        title: "Band 7+ Strategies",
        summary: "Proven techniques to achieve a Band 7 or higher in IELTS Writing.",
        icon: "star",
        content: `
          <h2>Band 7+ Strategies</h2>
          <p>Achieving Band 7+ requires consistent performance across all four assessment criteria. Here are key strategies:</p>

          <h3>Task Achievement (TA)</h3>
          <ul>
            <li>Address ALL parts of the question completely</li>
            <li>Develop your ideas with relevant, extended examples</li>
            <li>Stay focused on the topic - don't drift off-point</li>
            <li>Meet the word count requirement (150 for Task 1, 250 for Task 2)</li>
            <li>For Task 2, ensure your position is clear and consistent throughout</li>
          </ul>

          <h3>Coherence and Cohesion (CC)</h3>
          <ul>
            <li>Use a clear 4-paragraph structure (introduction, body 1, body 2, conclusion)</li>
            <li>Use connectors appropriately - variety and correct placement</li>
            <li>Reference pronouns clearly (this, these, it, they)</li>
            <li>Use substitution and synonymy to avoid repetition</li>
            <li>Paragraphing should be logical and help the reader follow your argument</li>
          </ul>

          <h3>Lexical Resource (LR)</h3>
          <ul>
            <li>Use a wide range of vocabulary, including less common items</li>
            <li>Show flexibility in word formation (nouns, verbs, adjectives, adverbs)</li>
            <li>Use collocations correctly (e.g., "make a decision," not "do a decision")</li>
            <li>Avoid repetition - use synonyms and paraphrasing</li>
            <li>Don't use informal language or idioms (this is academic writing)</li>
            <li>Spelling must be accurate - British or American spelling consistently</li>
          </ul>

          <h3>Grammatical Range and Accuracy (GRA)</h3>
          <ul>
            <li>Use a mix of simple and complex sentence structures</li>
            <li>Include complex sentences: relative clauses, conditionals, passive voice, inversion</li>
            <li>Check subject-verb agreement carefully</li>
            <li>Use articles correctly (a, an, the)</li>
            <li>Don't use contractions (can't → cannot, won't → will not)</li>
            <li>Practice common error patterns: countability, prepositions, word order</li>
          </ul>

          <h3>Practice Tips</h3>
          <ul>
            <li>Write at least 2 essays per week under timed conditions</li>
            <li>Have your writing assessed by a qualified teacher or use official band descriptors</li>
            <li>Keep a vocabulary notebook for academic words and collocations</li>
            <li>Read sample answers from Band 8+ writers to understand the standard</li>
            <li>Focus on one criterion at a time during practice, then combine</li>
          </ul>
        `,
      },
    ],
  },
  {
    slug: "speaking",
    name: "Speaking",
    overview: `
      <p>The IELTS Speaking test is a face-to-face interview with an examiner, divided into three parts.</p>
      <p><strong>Part 1</strong> (4-5 minutes): Introduction and interview about familiar topics like home, work, family, hobbies.</p>
      <p><strong>Part 2</strong> (3-4 minutes): You speak for 1-2 minutes about a topic given on a cue card.</p>
      <p><strong>Part 3</strong> (4-5 minutes): Discussion about abstract ideas related to the Part 2 topic.</p>
    `,
    tips: [
      // Speaking tips will be added here later
    ],
  },
  // Other categories commented out for future use
  // {
  //   slug: "reading",
  //   name: "Reading",
  //   tips: [],
  // },
  // {
  //   slug: "listening",
  //   name: "Listening",
  //   tips: [],
  // },
];

export const getTipBySlug = (categorySlug: string, tipSlug: string): Tip | undefined => {
  const category = tipsData.find(c => c.slug === categorySlug);
  return category?.tips.find(t => t.slug === tipSlug);
};

export const getCategoryBySlug = (slug: string): TipCategory | undefined => {
  return tipsData.find(c => c.slug === slug);
};
