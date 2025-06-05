import React, { useState, useEffect } from "react";
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  MoreVert as MoreVertIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import axios from "axios";

const TemplateCard = ({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" component="div">
            {template.name}
          </Typography>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Typography color="text.secondary" gutterBottom>
          {template.subject}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {template.content}
          </Typography>
        </Box>
        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {template.variables?.map((variable) => (
            <Chip
              key={variable}
              label={variable}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </CardContent>
      <CardActions>
        <Tooltip title="Preview">
          <IconButton size="small" onClick={() => onPreview(template)}>
            <PreviewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(template)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(template.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            onDuplicate(template);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onPreview(template);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <PreviewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Preview</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEdit(template);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete(template.id);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    variables: [],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const theme = useTheme();

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

  const handleOpen = () => {
    setFormData({
      name: "",
      subject: "",
      content: "",
      variables: [],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTemplate(null);
  };

  const handlePreviewOpen = (template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setSelectedTemplate(null);
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      variables: template.variables || [],
    });
    setOpen(true);
  };

  const handleDuplicate = async (template) => {
    try {
      const newTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
      };
      delete newTemplate.id;
      await axios.post("http://localhost:8000/templates/", newTemplate);
      setSuccess("Template duplicated successfully!");
      fetchTemplates();
    } catch (err) {
      setError("Failed to duplicate template");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await axios.delete(`http://localhost:8000/templates/${id}`);
        setSuccess("Template deleted successfully!");
        fetchTemplates();
      } catch (err) {
        setError("Failed to delete template");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTemplate) {
        await axios.put(
          `http://localhost:8000/templates/${selectedTemplate.id}`,
          formData
        );
        setSuccess("Template updated successfully!");
      } else {
        await axios.post("http://localhost:8000/templates/", formData);
        setSuccess("Template created successfully!");
      }
      handleClose();
      fetchTemplates();
    } catch (err) {
      setError("Failed to save template");
    }
  };

  const handleVariableAdd = () => {
    const variable = prompt("Enter variable name (e.g., {name}):");
    if (variable && !formData.variables.includes(variable)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variable],
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Email Templates
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Create and manage your email templates for outreach sequences
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 4 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Create New Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <TemplateCard
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onPreview={handlePreviewOpen}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? "Edit Template" : "Create New Template"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Template Name"
                  fullWidth
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Subject"
                  fullWidth
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Content"
                  fullWidth
                  multiline
                  rows={6}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle1">Variables:</Typography>
                  <Button
                    size="small"
                    onClick={handleVariableAdd}
                    startIcon={<AddIcon />}
                  >
                    Add Variable
                  </Button>
                </Box>
                <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {formData.variables.map((variable) => (
                    <Chip
                      key={variable}
                      label={variable}
                      onDelete={() =>
                        setFormData({
                          ...formData,
                          variables: formData.variables.filter(
                            (v) => v !== variable
                          ),
                        })
                      }
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
            >
              {selectedTemplate ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTemplate.name}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                Subject: {selectedTemplate.subject}
              </Typography>
              <Paper sx={{ p: 2, mt: 2, backgroundColor: "grey.50" }}>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {selectedTemplate.content}
                </Typography>
              </Paper>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Variables:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedTemplate.variables?.map((variable) => (
                    <Chip
                      key={variable}
                      label={variable}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Templates;
