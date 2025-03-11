# News_Digest_App

## Overview
News Digest is a personalized news aggregation platform where users can browse, filter, and manage articles based on sentiment, likes, and saved status. The project was built using **Bolt.new** for the frontend and **Nhost** for authentication and database management.

## Features
- **Sentiment-Based Filtering:** Users can filter articles based on their sentiment (Positive, Neutral, Negative).
- **Save & Like Articles:** Users can save or like articles for later reading.
- **Search Functionality:** Allows users to search for articles based on keywords.
- **GraphQL Integration:** Fetches articles stored in the Nhost database.

## Important Note
The **n8n server provided is not working**, which means the automated article-fetching workflow could not be implemented. As a result, articles have to be manually added to the **Nhost database**. However, the frontend and backend are successfully linked, and if the **n8n server** was functional, the entire automation would have been completed.

## How the Automation Should Have Worked
If **n8n** was functional, the following steps would have been implemented:
1. **Scheduler in n8n:** A cron job to run at set intervals.
2. **Fetch Articles from GNews API:** Pull news data based on user preferences.
3. **Use OpenRouter for AI Analysis:** Perform sentiment analysis and generate article summaries.
4. **Store Articles in Nhost:** Automatically add articles to the database using a GraphQL mutation.
5. **Frontend Fetching:** The Bolt.new frontend would fetch and display articles dynamically.

## Bolt.new & Nhost Issue
Bolt.new does not support Nhost's environment variables natively. To work around this:
- Initially, the frontend was created using **Supabase**.
- Later, the project was manually converted to **Nhost**, integrating authentication and the database successfully.

## Getting Started
### Prerequisites
- Node.js & npm installed
- Nhost account
- GraphQL Client

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/news-digest.git
   cd news-digest
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file and add:
     ```sh
     VITE_NHOST_SUBDOMAIN=your-nhost-subdomain
     VITE_NHOST_REGION=your-nhost-region
     VITE_HASURA_ADMIN_SECRET=your-hasura-secret
     ```
4. Run the development server:
   ```sh
   npm run dev
   ```

## Future Improvements
- Fix the n8n server and integrate automation.
- Implement user-specific article recommendations.
- Improve the UI for a more seamless experience.

## Conclusion
This project demonstrates the potential of combining **Nhost**, **GraphQL**, and **Bolt.new** for a feature-rich news aggregation platform. With a working **n8n server**, full automation can be achieved, eliminating manual article entry.

---
**Author:** [Chirag Tank]  

