# SNOMED CT Endoscopic Procedures Lookup

A front-end application for searching and exploring endoscopic procedures in SNOMED CT terminology.

## Features

- Search for endoscopic procedures by term
- Filter results by organ system
- Filter results by procedure method
- View detailed information about each concept
- Explore synonyms, parent/child relationships, and attributes

## Technology Stack

- Next.js - React framework
- TypeScript - Type-safe JavaScript
- Shadcn UI - UI component library
- Tailwind CSS - Utility-first CSS framework

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Integration

This application integrates with the SNOMED CT Snowstorm API:

- API Documentation: [https://snowstorm.snomedtools.org/snowstorm/snomed-ct/swagger-ui/index.html](https://snowstorm.snomedtools.org/snowstorm/snomed-ct/swagger-ui/index.html)

## Search Parameters

The application allows for searching with the following parameters:

1. **Search Term**: Free text search for endoscopic procedures
2. **Organ System**: Filter results by specific organ systems
3. **Procedure Method**: Filter results by specific procedure methods

## Project Structure

- `app/` - Next.js app directory
  - `components/` - React components
  - `lib/` - Utility functions, types, and API handlers
  - `data/` - Mock data for development
  
## License

This project is released under the MIT License.
