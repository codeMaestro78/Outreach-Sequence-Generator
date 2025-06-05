import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import axios from "axios";

const StatCard = ({ title, value, icon, color, onClick }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[4],
        },
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: "50%",
              p: 1,
              mr: 2,
            }}
          >
            {React.cloneElement(icon, { sx: { color: color } })}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_sequences: 0,
    sent_sequences: 0,
    draft_sequences: 0,
    templates: 0,
    active_sequences: 0,
    total_contacts: 0,
    response_rate: 0,
    recent_sequences: [],
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/dashboard/stats");
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch dashboard statistics");
      // Initialize with default values if the API call fails
      setStats({
        total_sequences: 0,
        sent_sequences: 0,
        draft_sequences: 0,
        templates: 0,
        active_sequences: 0,
        total_contacts: 0,
        response_rate: 0,
        recent_sequences: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getSequenceStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <PlayArrowIcon color="success" />;
      case "paused":
        return <StopIcon color="warning" />;
      case "completed":
        return <CheckCircleIcon color="info" />;
      default:
        return <AccessTimeIcon color="action" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Your Outreach Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Monitor your outreach campaigns and track their performance
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Sequences"
            value={stats.total_sequences}
            icon={<EmailIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Sequences"
            value={stats.active_sequences}
            icon={<PlayArrowIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Contacts"
            value={stats.total_contacts}
            icon={<PeopleIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Response Rate"
            value={`${stats.response_rate}%`}
            icon={<TrendingUpIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Recent Sequences
            </Typography>
            {stats.recent_sequences && stats.recent_sequences.length > 0 ? (
              <List>
                {stats.recent_sequences.map((sequence) => (
                  <React.Fragment key={sequence.id}>
                    <ListItem
                      secondaryAction={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Tooltip title={sequence.status}>
                            <IconButton edge="end" size="small">
                              {getSequenceStatusIcon(sequence.status)}
                            </IconButton>
                          </Tooltip>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            {sequence.sent_count}/{sequence.total_steps} steps
                          </Typography>
                        </Box>
                      }
                    >
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={sequence.name}
                        secondary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ScheduleIcon
                              sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Created: {new Date(sequence.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No recent sequences found
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem>
                <Button
                  component={RouterLink}
                  to="/new-sequence"
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<AddIcon />}
                >
                  Create New Sequence
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  component={RouterLink}
                  to="/templates"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<DescriptionIcon />}
                >
                  Manage Templates
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  component={RouterLink}
                  to="/sequences"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<EmailIcon />}
                >
                  View All Sequences
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
