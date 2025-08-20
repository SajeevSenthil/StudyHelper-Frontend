# StudyHelper-Frontend

A Next.js 15 frontend application for the StudyHelper platform that provides AI-powered document summarization and quiz generation.

## Features

- **Document Summarization**: Upload and summarize documents using AI
- **Quiz Generation**: Generate quizzes from documents or topics
- **Interactive Quiz Taking**: Take quizzes with detailed results and scoring
- **Quiz Management**: Save quizzes with custom titles and view past results
- **Detailed Analytics**: View comprehensive quiz results with question-by-question breakdown
- **User Authentication**: Secure user login and session management

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SajeevSenthil/StudyHelper-Frontend.git
cd StudyHelper-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BACKEND_URL=http://localhost:8001
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                  # Next.js 13+ app directory
│   ├── api/             # API routes
│   ├── quiz/            # Quiz-related pages
│   ├── past-quizzes/    # Quiz history
│   └── ...              # Other pages
├── components/          # Reusable components
├── lib/                 # Utility functions and configurations
└── public/              # Static assets
```

## API Integration

The frontend integrates with the StudyHelper backend API for:
- Document summarization
- Quiz generation and management
- User quiz attempts and scoring
- Results analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
