import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const NewSequence = () => {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    steps: [],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get("http://localhost:8000/templates/");
      setTemplates(response.data);
    } catch (err) {
      setError("Failed to fetch templates");
    }
  };

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          template_id: "",
          delay_days: 1,
          order: formData.steps.length + 1,
        },
      ],
    });
  };

  const handleRemoveStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      steps: newSteps.map((step, i) => ({ ...step, order: i + 1 })),
    });
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:8000/sequences/", formData);
      setSuccess("Sequence created successfully!");
      setFormData({
        name: "",
        description: "",
        steps: [],
      });
    } catch (err) {
      setError("Failed to create sequence");
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
                fullWidth
                label="Sequence Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Sequence Steps</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddStep}
                >
                  Add Step
                </Button>
              </Box>

              <List>
                {formData.steps.map((step, index) => (
                  <ListItem
                    key={index}
                    divider
                    sx={{
                      bgcolor: "background.paper",
                      mb: 2,
                      borderRadius: 1,
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <FormControl fullWidth>
                          <InputLabel>Template</InputLabel>
                          <Select
                            value={step.template_id}
                            onChange={(e) =>
                              handleStepChange(
                                index,
                                "template_id",
                                e.target.value
                              )
                            }
                            required
                          >
                            {templates.map((template) => (
                              <MenuItem key={template.id} value={template.id}>
                                {template.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Delay (days)"
                          value={step.delay_days}
                          onChange={(e) =>
                            handleStepChange(
                              index,
                              "delay_days",
                              parseInt(e.target.value)
                            )
                          }
                          required
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveStep(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={formData.steps.length === 0}
              >
                Create Sequence
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NewSequence;
