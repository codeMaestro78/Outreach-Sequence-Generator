# Automated Outreach Sequence Generator

A modern web application for creating and managing email outreach sequences with personalized templates and engagement tracking.

## Features

- Create and manage email templates with variable support
- Build multi-step outreach sequences
- Track sequence status and progress
- Contact management with engagement tracking
- Real-time analytics dashboard
- Modern, responsive UI with Material Design

## Tech Stack

### Backend
- FastAPI (Python)
- Pydantic for data validation
- Machine learning features with scikit-learn
- Natural language processing with NLTK and spaCy

### Frontend
- React
- Material-UI components
- React Router for navigation
- Axios for API communication

## Project Structure

```
.
├── backend/           # FastAPI backend
│   ├── main.py       # Main application file
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Setup

### Backend Setup
1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
cd backend
uvicorn main:app --reload
```

### Frontend Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when the backend server is running.

## Main Features

### Templates
- Create and manage email templates
- Support for personalized variables
- Template preview and testing

### Sequences
- Create multi-step outreach sequences
- Track sequence status (draft, active, paused, completed)
- Monitor sequence progress
- Send and manage sequences

### Dashboard
- Overview of active sequences
- Quick actions for common tasks
- Getting started guide
- Performance metrics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 