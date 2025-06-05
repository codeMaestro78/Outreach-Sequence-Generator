import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';

interface Template {
  id: number;
  name: string;
  subject: string;
  body: string;
}

const NewSequence = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | ''>('');
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    industry: '',
    company_size: '',
    recent_news: '',
  });
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Fetch templates
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('http://localhost:8000/templates/');
        setTemplates(response.data);
      } catch (err) {
        setError('Failed to fetch templates');
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const templateId = Number(event.target.value);
    setSelectedTemplate(templateId);
    
    if (templateId) {
      try {
        const response = await axios.post('http://localhost:8000/sequences/generate', {
          lead_data: leadData,
          template_id: templateId,
        });
        setPreview({
          subject: response.data.personalized_subject,
          body: response.data.personalized_body,
        });
      } catch (err) {
        setError('Failed to generate preview');
      }
    }
  };

  const handleLeadDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLeadData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/sequences/generate', {
        lead_data: leadData,
        template_id: selectedTemplate,
      });
      
      setSuccess('Sequence created successfully!');
      setPreview(null);
      setLeadData({
        name: '',
        email: '',
        company: '',
        position: '',
        industry: '',
        company_size: '',
        recent_news: '',
      });
      setSelectedTemplate('');
    } catch (err) {
      setError('Failed to create sequence');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Sequence
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Template"
                value={selectedTemplate}
                onChange={handleTemplateChange}
                required
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lead Name"
                name="name"
                value={leadData.name}
                onChange={handleLeadDataChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={leadData.email}
                onChange={handleLeadDataChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={leadData.company}
                onChange={handleLeadDataChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                name="position"
                value={leadData.position}
                onChange={handleLeadDataChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Industry"
                name="industry"
                value={leadData.industry}
                onChange={handleLeadDataChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Size"
                name="company_size"
                value={leadData.company_size}
                onChange={handleLeadDataChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recent News"
                name="recent_news"
                value={leadData.recent_news}
                onChange={handleLeadDataChange}
                multiline
                rows={2}
              />
            </Grid>

            {preview && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="h6" gutterBottom>
                    Preview
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Subject: {preview.subject}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {preview.body}
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Create Sequence
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NewSequence; 