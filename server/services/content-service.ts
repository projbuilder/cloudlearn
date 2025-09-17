interface ContentSource {
  name: string;
  baseUrl: string;
  apiKey?: string;
}

class ContentService {
  private sources: ContentSource[] = [
    { name: 'OpenStax', baseUrl: 'https://openstax.org/api/v2' },
    { name: 'Wikipedia', baseUrl: 'https://en.wikipedia.org/api/rest_v1' },
    { name: 'MIT OCW', baseUrl: 'https://ocw.mit.edu/api' },
    { name: 'Khan Academy', baseUrl: 'https://www.khanacademy.org/api/v1' },
    { name: 'arXiv', baseUrl: 'https://export.arxiv.org/api' },
  ];

  async searchContent(query: string, subject: string): Promise<any[]> {
    const results: any[] = [];

    try {
      // Search OpenStax content
      const openstaxResults = await this.searchOpenStax(query, subject);
      results.push(...openstaxResults);

      // Search Wikipedia
      const wikipediaResults = await this.searchWikipedia(query);
      results.push(...wikipediaResults);

      // Search arXiv for advanced topics
      if (subject === 'mathematics' || subject === 'computer_science') {
        const arxivResults = await this.searchArxiv(query, subject);
        results.push(...arxivResults);
      }

    } catch (error) {
      console.error('Content search error:', error);
      // Return fallback content
      return this.getFallbackContent(query, subject);
    }

    return results;
  }

  private async searchOpenStax(query: string, subject: string): Promise<any[]> {
    // Simulated OpenStax content - in production would use real API
    const sampleContent = {
      mathematics: [
        {
          title: "Linear Equations and Their Solutions",
          source: "OpenStax Algebra & Trigonometry",
          excerpt: "A linear equation in one variable can be written in the form ax + b = 0, where a and b are real numbers and a ≠ 0.",
          url: "https://openstax.org/books/algebra-and-trigonometry/pages/1-1-real-numbers-algebra-essentials",
          type: "textbook_section"
        },
        {
          title: "Quadratic Functions and Their Graphs",
          source: "OpenStax Algebra & Trigonometry", 
          excerpt: "A quadratic function is a function of the form f(x) = ax² + bx + c, where a, b, and c are real numbers and a ≠ 0.",
          url: "https://openstax.org/books/algebra-and-trigonometry/pages/5-1-quadratic-functions",
          type: "textbook_section"
        }
      ],
      computer_science: [
        {
          title: "Python Programming Basics",
          source: "OpenStax Introduction to Programming",
          excerpt: "Python is a high-level programming language that emphasizes code readability and simplicity.",
          url: "https://openstax.org/books/introduction-to-programming/pages/1-1-what-is-programming",
          type: "textbook_section"
        }
      ]
    };

    return sampleContent[subject as keyof typeof sampleContent] || [];
  }

  private async searchWikipedia(query: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return [{
          title: data.title,
          source: "Wikipedia",
          excerpt: data.extract,
          url: data.content_urls?.desktop?.page,
          type: "encyclopedia_article"
        }];
      }
    } catch (error) {
      console.error('Wikipedia search error:', error);
    }

    return [];
  }

  private async searchArxiv(query: string, subject: string): Promise<any[]> {
    // Simulated arXiv results - in production would use real API
    const sampleArxiv = [
      {
        title: "Advances in Federated Learning for Educational Applications",
        source: "arXiv",
        excerpt: "This paper presents novel approaches to federated learning in educational contexts, focusing on privacy-preserving personalization.",
        url: "https://arxiv.org/abs/2301.00000",
        type: "research_paper"
      }
    ];

    return query.includes('federated') || query.includes('machine learning') ? sampleArxiv : [];
  }

  private getFallbackContent(query: string, subject: string): any[] {
    return [{
      title: `Offline Content: ${query}`,
      source: "Local Cache",
      excerpt: "This content is available in offline mode. Connect to the internet for more comprehensive results.",
      url: "#",
      type: "fallback"
    }];
  }

  async generateQuizContent(topic: string, difficulty: number): Promise<any> {
    // Generate quiz questions from content
    const content = await this.searchContent(topic, 'mathematics');
    
    return {
      topic,
      difficulty,
      questions: await this.extractQuestions(content, difficulty),
      sources: content.map(c => c.source)
    };
  }

  private async extractQuestions(content: any[], difficulty: number): Promise<any[]> {
    // Simulate question extraction from content
    const sampleQuestions = [
      {
        stem: "What is the standard form of a quadratic function?",
        options: [
          "f(x) = ax + b",
          "f(x) = ax² + bx + c",
          "f(x) = a/x + b",
          "f(x) = √(ax + b)"
        ],
        correctIndex: 1,
        explanation: "A quadratic function is always in the form f(x) = ax² + bx + c where a ≠ 0.",
        difficulty,
        tags: ["quadratic_functions", "standard_form"]
      }
    ];

    return sampleQuestions;
  }

  async getTutorContext(topic: string): Promise<any> {
    const content = await this.searchContent(topic, 'mathematics');
    
    return {
      topic,
      context: content,
      sources: content.map(c => ({ name: c.source, url: c.url })),
      relatedTopics: this.getRelatedTopics(topic)
    };
  }

  private getRelatedTopics(topic: string): string[] {
    const relatedMap: Record<string, string[]> = {
      'quadratic': ['linear equations', 'parabolas', 'factoring', 'completing the square'],
      'linear': ['slope', 'systems of equations', 'graphing', 'inequalities'],
      'python': ['variables', 'functions', 'loops', 'data structures']
    };

    for (const [key, topics] of Object.entries(relatedMap)) {
      if (topic.toLowerCase().includes(key)) {
        return topics;
      }
    }

    return [];
  }
}

export const contentService = new ContentService();
