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
      <p>The IELTS Writing test assesses your ability to produce two pieces of writing in 60 minutes: Task 1 and Task 2. Task 2 is worth twice as much as Task 1, so time management is crucial.</p>

      <h3 class="text-lg font-semibold mt-4 mb-2">IELTS Academic Writing</h3>
      <p><strong>Task 1:</strong> Describe visual information such as graphs, charts, tables, or diagrams in at least 150 words. You must identify key trends, compare data, and summarize the information objectively.</p>
      <p><strong>Task 2:</strong> Write an essay responding to an argument, problem, or perspective in at least 250 words. You must present a clear position and support it with examples and reasoning.</p>

      <h3 class="text-lg font-semibold mt-4 mb-2">IELTS General Training Writing</h3>
      <p><strong>Task 1:</strong> Write a letter in at least 150 words — formal (job application, complaint), semi-formal (to a neighbor or colleague), or informal (to a friend). You must include all bullet points from the prompt.</p>
      <p><strong>Task 2:</strong> Write an essay identical to Academic Task 2 — at least 250 words presenting an argument, discussing a problem, or proposing a solution.</p>

      <h3 class="text-lg font-semibold mt-4 mb-2">Key Differences</h3>
      <ul>
        <li><strong>Academic Task 1</strong> focuses on data interpretation; <strong>GT Task 1</strong> focuses on real-life letter writing</li>
        <li><strong>Task 2</strong> is identical in both versions — same criteria, same approach</li>
        <li>Both modules have the same timing (60 minutes) and word requirements (150 + 250)</li>
      </ul>
    `,
    tips: [
      {
        slug: "connectors",
        title: "Connectors & Linking Words",
        summary: "Essential connecting words to improve cohesion and flow in your writing.",
        icon: "link",
        content: `
          <h2>Connectors & Linking Words</h2>
          <p>Using a variety of connectors is essential for achieving a high band score in Coherence and Cohesion. Here are the main categories with Before/After examples:</p>

          <h3>Before vs After: Using Connectors</h3>
          <p><strong>Incorrect (Weak):</strong> "The population increased. The resources remained limited."</p>
          <p><strong>Correct (Optimized):</strong> "The population increased significantly; however, the available resources remained limited."</p>

          <h3>Addition</h3>
          <ul>
            <li><strong>Furthermore</strong> - Moreover, the study showed...</li>
            <li><strong>In addition</strong> - In addition, many companies have adopted...</li>
            <li><strong>Additionally</strong> - Additionally, the cost has decreased...</li>
            <li><strong>Besides</strong> - Besides the economic benefits, there are...</li>
            <li><strong>Not only... but also</strong> - Not only does it save time, but also reduces costs.</li>
          </ul>

          <h3>Before vs After: Addition Connector</h3>
          <p><strong>Incorrect (Weak):</strong> "Technology has improved productivity. It has also created new jobs."</p>
          <p><strong>Correct (Optimized):</strong> "Technology has significantly improved productivity. Furthermore, it has created numerous new employment opportunities."</p>

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

          <h3>Key Principles for High Impact</h3>
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

          <h3>Before vs After: Introduction</h3>
          <p><strong>Incorrect (Weak):</strong> "This essay will talk about the advantages and disadvantages of technology. Many people think technology is good."</p>
          <p><strong>Correct (Optimized):</strong> "While technology has undoubtedly revolutionized modern life, it presents both significant benefits and notable challenges. This essay will argue that the advantages outweigh the disadvantages, examining first economic impacts, then social implications."</p>

          <h3>Paragraph 2: Body Paragraph 1</h3>
          <p>Each body paragraph should:</p>
          <ul>
            <li><strong>Start with a topic sentence</strong> - Introduce the main idea of the paragraph</li>
            <li><strong>Explain the idea</strong> - Expand on your topic sentence</li>
            <li><strong>Provide evidence</strong> - Use examples, facts, or data to support your point</li>
            <li><strong>Conclude the paragraph</strong> - Link back to the main argument</li>
          </ul>
          <p>Use: "First/Firstly... Furthermore... For example..."</p>

          <h3>Before vs After: Body Paragraph</h3>
          <p><strong>Incorrect (Weak):</strong> "Technology creates jobs. Many people work in tech. It helps the economy."</p>
          <p><strong>Correct (Optimized):</strong> "First, technology has substantially boosted economic growth. For instance, the digital economy now accounts for approximately 15% of global GDP. Furthermore, it has created millions of employment opportunities across various sectors, from software development to digital marketing."</p>

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

          <h3>Key Principles for High Impact</h3>
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
      {
        slug: "general-training-task-1",
        title: "General Training Task 1: Letter Writing",
        summary: "Master the three types of letters — formal, informal, and semi-formal — with structure, tone, and essential phrases.",
        icon: "mail",
        content: `
          <h2>General Training Task 1: Letter Writing</h2>
          <p>In General Training IELTS Writing Task 1, you must write a letter of at least 150 words in response to a given situation. The key to success is understanding the three letter types and matching your tone accordingly.</p>

          <h3>Understanding the Three Letter Types</h3>

          <h4>Formal Letters</h4>
          <p>Used when you <strong>do not know</strong> the recipient personally or when the situation is official.</p>
          <ul>
            <li>Job applications, complaint letters, requests to authorities</li>
            <li><strong>Tone:</strong> Polite, professional, and impersonal</li>
            <li><strong>Opening:</strong> "I am writing to express my concern regarding..." / "I am writing to apply for the position of..."</li>
            <li><strong>Closing:</strong> "Yours faithfully," (if you don't know the name) / "Yours sincerely," (if you know the name)</li>
          </ul>

          <h4>Semi-Formal Letters</h4>
          <p>Used when you have some familiarity with the recipient — a colleague, neighbor, or acquaintance.</p>
          <ul>
            <li>Requests to a landlord, complaints to a business, invitations to a professional contact</li>
            <li><strong>Tone:</strong> respectful but more personal than formal</li>
            <li><strong>Opening:</strong> "Dear Mr. Johnson," / "Dear Sir/Madam,"</li>
            <li><strong>Closing:</strong> "Yours sincerely,"</li>
          </ul>

          <h4>Informal Letters</h4>
          <p>Used when you <strong>know the recipient well</strong> — a friend, family member, or close acquaintance.</p>
          <ul>
            <li>Letters to a friend describing an experience, giving advice, or sharing news</li>
            <li><strong>Tone:</strong> Warm, friendly, conversational</li>
            <li><strong>Opening:</strong> "Hi Tom," / "Dear Sarah,"</li>
            <li><strong>Closing:</strong> "Best wishes," / "Love," / "Take care,"</li>
          </ul>

          <h3>Essential Letter Structure</h3>
          <ul>
            <li><strong>Opening (1 sentence):</strong> State the purpose of the letter immediately</li>
            <li><strong>Body (2-3 paragraphs):</strong> Provide details, make requests, or explain the situation. Use separate paragraphs for separate points.</li>
            <li><strong>Closing (1 sentence):</strong> End with a call to action, expression of thanks, or expectation</li>
          </ul>

          <h3>Key Expressions by Function</h3>
          <h4>Making a Request</h4>
          <ul>
            <li>I am writing to request...</li>
            <li>I would be grateful if you could...</li>
            <li>Could you please...</li>
            <li>I wonder if you could...</li>
          </ul>

          <h4>Making a Complaint</h4>
          <ul>
            <li>I am writing to express my disappointment with...</li>
            <li>I regret to inform you that the service I received was...</li>
            <li>I would appreciate it if you could look into this matter...</li>
            <li>I expect this situation to be resolved by...</li>
          </ul>

          <h4>Giving Information</h4>
          <ul>
            <li>I am pleased to inform you that...</li>
            <li>As you may already know,...</li>
            <li>Following our recent conversation,...</li>
          </ul>

          <h3>Common Mistakes to Avoid</h3>
          <ul>
            <li>Don't use informal language in formal letters ("Hey," "cool," "stuff")</li>
            <li>Don't write less than 150 words — aim for 170-180</li>
            <li>Don't forget to include ALL bullet points from the prompt</li>
            <li>Don't use contractions in formal letters (can't → cannot, won't → will not)</li>
            <li>Don't use emotional or aggressive language even in complaints — stay professional</li>
            <li>Don't mix tones — keep your letter consistent throughout</li>
          </ul>
        `,
      },
      {
        slug: "vocabulary-for-writing",
        title: "Academic Vocabulary for IELTS Writing",
        summary: "Build a powerful academic vocabulary with collocations, word formation, and formal expressions for high band scores.",
        icon: "book-open",
        content: `
          <h2>Academic Vocabulary for IELTS Writing</h2>
          <p>A wide range of vocabulary is one of the four assessment criteria. Using academic vocabulary correctly and appropriately will significantly boost your Lexical Resource score.</p>

          <h3>Word Formation: Expand Your Range</h3>
          <p>Show flexibility by using different forms of the same root word:</p>
          <ul>
            <li><strong>increase</strong> → increasingly, increasing, increased</li>
            <li><strong>environment</strong> → environmental, environmentally, environmentalist</li>
            <li><strong>economy</strong> → economic, economically, economist</li>
            <li><strong>society</strong> → social, socially, socialize</li>
            <li><strong>technology</strong> → technological, technologically</li>
            <li><strong>culture</strong> → cultural, culturally</li>
          </ul>

          <h3>Essential Academic Collocations</h3>
          <p>Collocations are words that naturally go together. Using them correctly shows native-like proficiency.</p>

          <h4>Verbs + Nouns</h4>
          <ul>
            <li>make a decision (not "do a decision")</li>
            <li>take risks (not "make risks")</li>
            <li>conduct research (not "do research")</li>
            <li>draw conclusions (not "make conclusions")</li>
            <li>raise awareness (not "increase awareness" in some contexts)</li>
            <li>pose a threat (not "make a threat")</li>
            <li>provide assistance (not "give assistance" — both work but "provide" is more academic)</li>
          </ul>

          <h4>Adjective + Noun</h4>
          <ul>
            <li>significant impact, significant progress</li>
            <li>rapid growth, rapid development</li>
            <li>severe consequences, severe drought</li>
            <li>fundamental change, fundamental difference</li>
            <li>widespread concern, widespread support</li>
          </ul>

          <h4>Verb + Preposition Combinations</h4>
          <ul>
            <li>depend on, rely on, focus on</li>
            <li>result in, lead to, contribute to</li>
            <li>specialize in, participate in, believe in</li>
            <li>account for, approve of, adapt to</li>
          </ul>

          <h3>Formal vs. Informal Vocabulary</h3>
          <p>IELTS Writing requires formal academic language. Avoid colloquial expressions.</p>
          <table>
            <thead><tr><th>Informal</th><th>Formal/Academic</th></tr></thead>
            <tbody>
              <tr><td>a lot of</td><td>numerous, a significant number of</td></tr>
              <tr><td>big</td><td>substantial, considerable, significant</td></tr>
              <tr><td>get</td><td>obtain, acquire, achieve, gain</td></tr>
              <tr><td>keep</td><td>maintain, preserve, sustain</td></tr>
              <tr><td>show</td><td>demonstrate, illustrate, indicate</td></tr>
              <tr><td>use</td><td>utilize, employ, implement</td></tr>
              <tr><td>think</td><td>argue, contend, maintain, believe</td></tr>
              <tr><td>stop</td><td>cease, halt, prevent</td></tr>
              <tr><td>look into</td><td>investigate, examine, explore</td></tr>
              <tr><td>find out</td><td>determine, ascertain, identify</td></tr>
            </tbody>
          </table>

          <h3>Vocabulary for Argument Essays</h3>
          <ul>
            <li><strong>Presenting a view:</strong> It can be argued that... / From my perspective... / In my opinion...</li>
            <li><strong>Adding emphasis:</strong> Furthermore, Moreover, In addition, Equally important</li>
            <li><strong>Introducing evidence:</strong> Research suggests... / Studies have shown... / According to experts...</li>
            <li><strong>Contrast:</strong> Conversely, Nevertheless, Nonetheless, In contrast</li>
            <li><strong>Drawing conclusions:</strong> Consequently, Therefore, Thus, As a result</li>
          </ul>

          <h3>Common Spelling Errors to Avoid</h3>
          <ul>
            <li>affect / effect (verb/noun distinction)</li>
            <li>practice / practise (British: practice=noun, practise=verb)</li>
            <li>their / there / they're</li>
            <li>definite / definition (common misspelling: definate)</li>
            <li>necessary: one c, two s's (not "neccessary")</li>
          </ul>
        `,
      },
      {
        slug: "grammar-for-ielts",
        title: "Grammar for IELTS Writing",
        summary: "Master complex sentence structures — conditionals, passives, inversions — to achieve a high Grammatical Range score.",
        icon: "graduation-cap",
        content: `
          <h2>Grammar for IELTS Writing</h2>
          <p>Grammatical Range and Accuracy accounts for 25% of your writing score. To achieve Band 7+, you must demonstrate a wide range of structures with good accuracy. This guide covers the key structures you need.</p>

          <h3>Complex Sentence Structures</h3>

          <h4>Relative Clauses</h4>
          <p>Use defining and non-defining relative clauses to add information concisely.</p>
          <ul>
            <li><strong>Defining:</strong> "The government <em>which introduced the new policy</em> faced criticism." (essential information)</li>
            <li><strong>Non-defining:</strong> "Many students, <em>who study for long hours</em>, often suffer from stress." (extra information, surrounded by commas)</li>
            <li><strong>Reduced relative clauses:</strong> "The data <em>collected from surveys</em> was analyzed." (instead of "which was collected")</li>
          </ul>

          <h4>Conditionals</h4>
          <p>Use all conditional types to discuss hypothetical scenarios, past hypotheticals, and real possibilities.</p>
          <ul>
            <li><strong>Zero conditional</strong> (general truths): "If water reaches 100°C, <em>it boils</em>."</li>
            <li><strong>First conditional</strong> (real future): "If governments invest more, <em>the problem will improve</em>."</li>
            <li><strong>Second conditional</strong> (hypothetical present/future): "If students <em>had</em> more support, they <em>would achieve</em> better results."</li>
            <li><strong>Third conditional</strong> (hypothetical past): "If governments <em>had acted</em> earlier, the situation <em>would not have worsened</em>."</li>
            <li><strong>Mixed conditionals:</strong> "If I <em>were</em> a policy maker, I <em>would have implemented</em> this years ago."</li>
          </ul>

          <h4>Passive Voice</h4>
          <p>Passives are essential in academic writing to sound objective and impersonal.</p>
          <ul>
            <li>Active: "Researchers <em>conducted</em> the study." → Passive: "The study <em>was conducted</em> by researchers."</li>
            <li>Active: "The government <em>will introduce</em> new regulations." → Passive: "New regulations <em>will be introduced</em>."</li>
            <li>Active: "People <em>believe</em> that..." → Passive: "It <em>is believed</em> that..."</li>
            <li><strong>Agentless passives:</strong> "Carbon emissions <em>must be reduced</em>." (who does it is not important)</li>
          </ul>

          <h4>Inversion (Advanced)</h4>
          <p>Inversion adds sophistication and variety to your writing.</p>
          <ul>
            <li><strong>Never/Rarely + auxiliary:</strong> "Never <em>have I seen</em> such a response." (instead of "I have never seen")</li>
            <li><strong>Only after +倒装:</strong> "Only after the policy <em>was implemented</em> did improvement <em>occur</em>."</li>
            <li><strong>Not only:</strong> "Not only <em>did</em> the policy reduce emissions, <em>but it also</em> created jobs."</li>
            <li><strong>Should + inversion</strong> (formal suggestion): "Should you require further information, please contact..."</li>
          </ul>

          <h3>Subordinate Clauses</h4>
          <ul>
            <li><strong>Causality:</strong> "Because/Since/As technology <em>advances</em>, society changes."</li>
            <li><strong>Purpose:</strong> "Governments invest <em>so that</em> education improves." / "...<em>in order to</em> / "<em>to</em> improve education."</li>
            <li><strong>Concession:</strong> "Although/Though/Even though technology <em>has benefits</em>, it also creates problems." / "Despite/In spite of <em>having benefits</em>..."</li>
            <li><strong>Time:</strong> "Once/When/After/Before technology <em>is adopted</em>..."</li>
          </ul>

          <h3>Articles: The Most Common Error</h3>
          <ul>
            <li><strong>Countable nouns need articles:</strong> "The environment <em>is</em> important." (not "Environment is important" when singular)</li>
            <li><strong>Zero article for plurals/generics:</strong> "Environment<em>s</em> are important." / "<em>Technology</em> has changed our lives."</li>
            <li><strong>The + superlative:</strong> "This is <em>the most effective</em> solution."</li>
            <li><strong>The + unique nouns:</strong> "the government," "the economy," "the population"</li>
            <li><strong>A/An:</strong> Use "a" before consonant sounds, "an" before vowel sounds ("a university" — "u" is consonant sound; "anhonest person" — "h" is silent)</li>
          </ul>

          <h3>Subject-Verb Agreement</h3>
          <ul>
            <li><strong>Collective nouns</strong> (government, team, family) — usually singular in British English: "The government <em>is</em> implementing..."</li>
            <li><strong>Plural nouns</strong> ending in -ics (politics, economics, mathematics): usually singular: "Politics <em>is</em> complex."</li>
            <li><strong>Either... or / Neither... nor:</strong> Verb agrees with nearest subject: "Neither the students nor the teacher <em>was</em> happy."</li>
            <li><strong>None:</strong> Can be singular or plural depending on emphasis: "None of the data <em>is</em> useful" / "None of the participants <em>were</em> willing."</li>
          </ul>

          <h3>Prepositions: Common Patterns</h3>
          <ul>
            <li><strong>Depend on, focus on, rely on</strong> (not "depend of")</li>
            <li><strong>Consist of</strong> (not "consist in")</li>
            <li><strong>Conscious of, aware of</strong> (not "aware from")</li>
            <li><strong>Interested in</strong> (not "interested of")</li>
            <li><strong>Different from/to/than</strong> (British accepts all three, but "different from" is safest)</li>
            <li><strong>Married to, similar to, compared to/with</strong></li>
          </ul>

          <h3>Countable vs. Uncountable</h3>
          <ul>
            <li><strong>advice, feedback, progress, research, evidence:</strong> Always uncountable (not "advices," "feedbacks")</li>
            <li><strong>A piece of / a number of:</strong> "A number of <em>studies</em> <strong>show</strong>..." (studies is plural verb)</li>
            <li><strong>Much + uncountable:</strong> "Much <em>research</em> has been conducted..."</li>
            <li><strong>Many + countable:</strong> "Many <em>people</em> believe..."</li>
            <li><strong>A lot of / lots of:</strong> Can take either plural or uncountable depending on noun</li>
          </ul>
        `,
      },
      {
        slug: "time-management",
        title: "Time Management for IELTS Writing",
        summary: "Learn to distribute your 60 minutes wisely between Task 1 and Task 2, and practice under realistic conditions.",
        icon: "clock",
        content: `
          <h2>Time Management for IELTS Writing</h2>
          <p>With only 60 minutes to complete two tasks, poor time management is one of the most common reasons candidates underperform. This guide will help you use every minute effectively.</p>

          <h3>The 60-Minute Breakdown</h3>
          <p>Task 2 is worth twice as much as Task 1, but many candidates spend equal time on both — a critical mistake. Here is the recommended split:</p>

          <h4>Task 1: 20 Minutes</h4>
          <ul>
            <li><strong>1-2 minutes:</strong> Read the question carefully. Identify the type (graph, chart, table, diagram, or combination). Note the time period and units.</li>
            <li><strong>2-3 minutes:</strong> Plan your response. Identify 2-3 key features/trends to describe. Decide on paragraph structure.</li>
            <li><strong>12-14 minutes:</strong> Write your response. Aim for 160-180 words.</li>
            <li><strong>1-2 minutes:</strong> Check for basic errors — spelling, grammar, word count.</li>
          </ul>

          <h4>Task 2: 40 Minutes</h4>
          <ul>
            <li><strong>2-3 minutes:</strong> Analyze the question. Identify all parts. Decide your position.</li>
            <li><strong>3-5 minutes:</strong> Plan your essay. Outline introduction, two body paragraphs, and conclusion. Note your key ideas and examples.</li>
            <li><strong>25-28 minutes:</strong> Write your essay. Aim for 260-280 words.</li>
            <li><strong>3-4 minutes:</strong> Review and edit. Check coherence, grammar, vocabulary, and word count.</li>
          </ul>

          <h3>The Golden Rules</h3>

          <h4>1. Never Spend More Than 20 Minutes on Task 1</h4>
          <p>If you spend 30 minutes on Task 1, you will rush Task 2 — which costs you twice the marks. If you cannot finish Task 1 in 20 minutes, <strong>stop and move on</strong>. You will lose fewer marks for an incomplete Task 1 than for a rushed Task 2.</p>

          <h4>2. Always Write Task 2 First? Not Necessarily</h4>
          <p>Most experts recommend doing Task 2 first since it's worth more. However, if you find Task 1 easier and are confident you can complete it quickly, doing it second means you end on a high-note with your best work. <strong>The key is: know your plan and stick to it.</strong></p>

          <h4>3. Leave Time to Check</h4>
          <p>Aim to finish Task 2 with at least 3 minutes remaining. Use this time to:</p>
          <ul>
            <li>Count your words — are you over 150 (Task 1) or 250 (Task 2)?</li>
            <li>Check for repeated words — replace any obvious repetitions</li>
            <li>Read your conclusion — does it restate your position?</li>
            <li>Fix any obvious spelling mistakes or missing words</li>
          </ul>

          <h4>4. Don't Edit While Writing</h4>
          <p>Keep your pen/keyboard moving. If you make a mistake, put a small mark and continue. You have time to fix it in your final review. <strong>Don't cross out entire paragraphs</strong> — just add a line through and continue.</p>

          <h3>Practice Strategy</h3>

          <h4>Under Real Conditions</h4>
          <p>Every practice essay should be written under exam conditions:</p>
          <ul>
            <li>Use a timer — no cheating</li>
            <li>No dictionary, no notes, no interruptions</li>
            <li>Write by hand (if computer-based, practice on keyboard)</li>
            <li>Complete both tasks in one sitting</li>
          </ul>

          <h4>Track Your Timing</h4>
          <p>Keep a log of your practice sessions:</p>
          <table>
            <thead><tr><th>Date</th><th>Task</th><th>Time Spent</th><th>Word Count</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td>2024-01-15</td><td>Task 2</td><td>38 min</td><td>265</td><td>Rushed conclusion</td></tr>
              <tr><td>2024-01-15</td><td>Task 1</td><td>22 min</td><td>172</td><td>Went over time</td></tr>
            </tbody>
          </table>

          <h4>Identify Your Slow Points</h4>
          <ul>
            <li><strong>If planning takes too long:</strong> Practice outlining in 2 minutes — use a timer until it becomes habit</li>
            <li><strong>If writing is slow:</strong> Practice brainstorming ideas quickly. Keep a vocabulary notebook to reduce word-searching</li>
            <li><strong>If checking takes too long:</strong> Learn to spot errors while writing — read each sentence after completing it</li>
          </ul>

          <h3>What to Do If You Run Out of Time</h3>

          <h4>Task 1 Incomplete</h4>
          <ul>
            <li>You will lose marks for Task Achievement, but you can still score well in Lexical Resource and Grammatical Range</li>
            <li>Write a brief summary sentence at minimum</li>
            <li>Don't panic — Task 2 is more important</li>
          </ul>

          <h4>Task 2 Incomplete</h4>
          <ul>
            <li>Write a quick conclusion even if you have only 1 minute — conclusions are expected and can be brief</li>
            <li>A missing conclusion is a bigger problem than a brief one</li>
            <li>If truly desperate, even 1 sentence restating your position helps</li>
          </ul>

          <h3>Quick Reference: Your Exam Day Checklist</h3>
          <ul>
            <li>⏱️ Bring a watch — not all exam rooms have clocks</li>
            <li>📝 Before writing, spend exactly 2 minutes reading BOTH questions</li>
            <li>📋 Use the question paper for your plan — it's not marked</li>
            <li>✍️ Write legibly — unreadable handwriting loses marks</li>
            <li>📊 Task 1: minimum 150 words, aim for 160-180</li>
            <li>📝 Task 2: minimum 250 words, aim for 260-280</li>
            <li>🔄 Leave 3 minutes to review both responses</li>
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
