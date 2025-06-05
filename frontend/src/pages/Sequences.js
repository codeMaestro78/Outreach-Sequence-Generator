import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";

const Sequences = () => {
  const [sequences, setSequences] = useState([]);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    try {
      const response = await axios.get("http://localhost:8000/sequences/");
      setSequences(response.data);
    } catch (err) {
      setError("Failed to fetch sequences");
    }
  };

  const handleOpen = (sequence) => {
    setSelectedSequence(sequence);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSequence(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/sequences/${id}`);
      setSuccess("Sequence deleted successfully!");
      fetchSequences();
    } catch (err) {
      setError("Failed to delete sequence");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      await axios.patch(`http://localhost:8000/sequences/${id}`, {
        status: newStatus,
      });
      setSuccess(
        `Sequence ${
          newStatus === "active" ? "activated" : "paused"
        } successfully!`
      );
      fetchSequences();
    } catch (err) {
      setError("Failed to update sequence status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      case "completed":
        return "info";
      default:
        return "default";
    }
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <CheckCircleIcon color="success" />;
      case "failed":
        return <DeleteIcon color="error" />;
      default:
        return <AccessTimeIcon color="action" />;
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">Outreach Sequences</Typography>
          <Button variant="contained" color="primary" href="/new-sequence">
            Create New Sequence
          </Button>
        </Box>

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

        <Grid container spacing={3}>
          {sequences.map((sequence) => (
            <Grid item xs={12} md={6} lg={4} key={sequence.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="div">
                      {sequence.name}
                    </Typography>
                    <Chip
                      label={sequence.status}
                      color={getStatusColor(sequence.status)}
                      size="small"
                    />
                  </Box>
                  <Typography color="text.secondary" gutterBottom>
                    {sequence.description}
                  </Typography>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {sequence.sent_count} of {sequence.total_steps}{" "}
                      steps
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(sequence.sent_count / sequence.total_steps) * 100}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(sequence)}
                    title="View Details"
                  >
                    <EmailIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleToggleStatus(sequence.id, sequence.status)
                    }
                    title={
                      sequence.status === "active"
                        ? "Pause Sequence"
                        : "Activate Sequence"
                    }
                  >
                    {sequence.status === "active" ? (
                      <StopIcon />
                    ) : (
                      <PlayArrowIcon />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    href={`/edit-sequence/${sequence.id}`}
                    title="Edit Sequence"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(sequence.id)}
                    color="error"
                    title="Delete Sequence"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          {selectedSequence && (
            <>
              <DialogTitle>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">{selectedSequence.name}</Typography>
                  <Chip
                    label={selectedSequence.status}
                    color={getStatusColor(selectedSequence.status)}
                    size="small"
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Typography color="text.secondary" paragraph>
                  {selectedSequence.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress: {selectedSequence.sent_count} of{" "}
                    {selectedSequence.total_steps} steps
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (selectedSequence.sent_count /
                        selectedSequence.total_steps) *
                      100
                    }
                    sx={{ mt: 1 }}
                  />
                </Box>
                <List>
                  {selectedSequence.steps.map((step, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getStepStatusIcon(step.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={step.template?.name || "Template not found"}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              Subject: {step.template?.subject || "N/A"}
                            </Typography>
                            <br />
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 0.5,
                              }}
                            >
                              <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2" component="span">
                                Delay: {step.delay_days} days
                              </Typography>
                              {step.sent_at && (
                                <>
                                  <Typography
                                    variant="body2"
                                    component="span"
                                    sx={{ mx: 1 }}
                                  >
                                    •
                                  </Typography>
                                  <Typography variant="body2" component="span">
                                    Sent:{" "}
                                    {new Date(
                                      step.sent_at
                                    ).toLocaleDateString()}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Sequences;
