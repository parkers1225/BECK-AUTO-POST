/**
 * AI Service for generating Facebook Marketplace descriptions
 * Supports OpenAI and Anthropic APIs
 */

class AIService {
  constructor() {
    this.apiKey = null;
    this.service = 'openai'; // 'openai' or 'anthropic'
  }

  /**
   * Initialize service with API key and service type
   */
  async initialize(apiKey, service = 'openai') {
    this.apiKey = apiKey;
    this.service = service;
  }

  /**
   * Generate Facebook Marketplace description
   * @param {Object} vehicleData - Vehicle data from CSV
   * @param {string} userPrompt - User's custom prompt
   * @returns {Promise<string>} Generated description
   */
  async generateDescription(vehicleData, userPrompt) {
    if (!this.apiKey) {
      throw new Error('API key not configured. Please set your API key in settings.');
    }

    const prompt = this.buildPrompt(vehicleData, userPrompt);

    if (this.service === 'openai') {
      return await this.generateWithOpenAI(prompt);
    } else if (this.service === 'anthropic') {
      return await this.generateWithAnthropic(prompt);
    } else {
      throw new Error(`Unsupported AI service: ${this.service}`);
    }
  }

  /**
   * Build prompt for AI generation
   */
  buildPrompt(vehicleData, userPrompt) {
    const vehicleInfo = `
Vehicle Information:
- Year: ${vehicleData.year || 'N/A'}
- Make: ${vehicleData.make || 'N/A'}
- Model: ${vehicleData.model || 'N/A'}
- Trim: ${vehicleData.trim || 'N/A'}
- Price: $${vehicleData.price || 'N/A'}
- Mileage: ${vehicleData.mileage || 'N/A'} ${vehicleData.mileageUnit || 'miles'}
- Color: ${vehicleData.color || 'N/A'}
- Transmission: ${vehicleData.transmission || 'N/A'}
- Fuel Type: ${vehicleData.fuelType || 'N/A'}
- Body Style: ${vehicleData.bodyStyle || 'N/A'}
- Drivetrain: ${vehicleData.drivetrain || 'N/A'}
- Condition: ${vehicleData.condition || 'N/A'}
- VIN: ${vehicleData.vin || 'N/A'}

${vehicleData.description ? `Original Description (NOTE: Ignore any dealership names, phone numbers, or business references in this):\n${vehicleData.description.substring(0, 1000)}` : ''}
`;

    return `You are an expert at writing engaging Facebook Marketplace listings for vehicles. 

${vehicleInfo}

User's specific requirements: ${userPrompt || 'Create an engaging, professional description optimized for Facebook Marketplace'}

CRITICAL REQUIREMENTS - MUST FOLLOW:
- NEVER mention dealership name, dealership business name, or the word "dealership" anywhere in the description
- NEVER include any phone number in the description (even if present in original description)
- If the original description contains dealership info or phone numbers, completely exclude them
- ALWAYS end with a call-to-action directing buyers to "DM me on Facebook for more details" or similar Facebook messaging instruction
- Optimize specifically for Facebook Marketplace format (use emojis sparingly, short paragraphs, clear sections)

Please generate a compelling Facebook Marketplace listing description that:
1. Starts with an attention-grabbing headline
2. Highlights key features and selling points
3. Uses proper formatting with bullet points and line breaks for readability
4. Includes relevant details about condition, mileage, and features
5. Ends with: "DM me on Facebook for more details" or similar Facebook messaging instruction
6. Is optimized for Facebook Marketplace's format and audience (short paragraphs, easy to scan)
7. Is concise but comprehensive (aim for 300-500 words)
8. Uses a friendly, personal tone (as if selling as an individual, not a business)

Generate only the description text, no additional commentary.`;
  }

  /**
   * Generate description using OpenAI API
   */
  async generateWithOpenAI(prompt) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a professional automotive copywriter specializing in Facebook Marketplace listings. NEVER mention dealership names or phone numbers. Always direct buyers to DM on Facebook for details.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      throw new Error(`Failed to generate description: ${error.message}`);
    }
  }

  /**
   * Generate description using Anthropic Claude API
   */
  async generateWithAnthropic(prompt) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0]?.text?.trim() || '';
    } catch (error) {
      throw new Error(`Failed to generate description: ${error.message}`);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIService;
}


