import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';

interface DashboardStats {
  total_sequences: number;
  sent_sequences: number;
  draft_sequences: number;
  total_templates: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    total_sequences: 0,
    sent_sequences: 0,
    draft_sequences: 0,
    total_templates: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
    }
  };

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Sequences"
              value={stats.total_sequences}
              icon={<EmailIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Sent Sequences"
              value={stats.sent_sequences}
              icon={<EmailIcon color="success" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Draft Sequences"
              value={stats.draft_sequences}
              icon={<EmailIcon color="action" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Templates"
              value={stats.total_templates}
              icon={<DescriptionIcon color="primary" />}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/new-sequence')}
                >
                  New Sequence
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  onClick={() => navigate('/templates')}
                >
                  Manage Templates
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={() => navigate('/sequences')}
                >
                  View Sequences
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Getting Started
              </Typography>
              <Typography variant="body1" paragraph>
                1. Create email templates with personalized variables
              </Typography>
              <Typography variant="body1" paragraph>
                2. Generate sequences for your leads
              </Typography>
              <Typography variant="body1" paragraph>
                3. Preview and send your outreach emails
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/new-sequence')}
              >
                Start Now
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 