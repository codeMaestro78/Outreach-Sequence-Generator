# Automated Outreach Sequence Generator

An intelligent outreach automation platform that helps you create, manage, and optimize your email outreach sequences.

## Features

- Create and manage email templates
- Build multi-step outreach sequences
- Track sequence performance and engagement
- Machine learning-powered response prediction
- Contact management with engagement scoring
- Real-time analytics and reporting

## Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy
- Scikit-learn
- PyTorch
- Transformers

### Frontend
- React
- Material-UI
- Axios
- Chart.js

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 