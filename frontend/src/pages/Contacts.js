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
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import axios from "axios";

const ContactCard = ({
  contact,
  onEdit,
  onDelete,
  onSendSequence,
  onRecordResponse,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseType, setResponseType] = useState("");
  const [responseContent, setResponseContent] = useState("");

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleResponseSubmit = async () => {
    try {
      await onRecordResponse(contact.id, responseType, responseContent);
      setResponseDialogOpen(false);
      setResponseType("");
      setResponseContent("");
    } catch (error) {
      console.error("Failed to record response:", error);
    }
  };

  const getEngagementColor = (score) => {
    if (score >= 0.7) return theme.palette.success.main;
    if (score >= 0.4) return theme.palette.warning.main;
    return theme.palette.error.main;
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
            {contact.name}
          </Typography>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            <EmailIcon sx={{ fontSize: 16, mr: 1, verticalAlign: "middle" }} />
            {contact.email}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            <BusinessIcon
              sx={{ fontSize: 16, mr: 1, verticalAlign: "middle" }}
            />
            {contact.company}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            <WorkIcon sx={{ fontSize: 16, mr: 1, verticalAlign: "middle" }} />
            {contact.position}
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Engagement Score
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={contact.engagement_score * 100}
              sx={{
                flexGrow: 1,
                mr: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                "& .MuiLinearProgress-bar": {
                  backgroundColor: getEngagementColor(contact.engagement_score),
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {Math.round(contact.engagement_score * 100)}%
            </Typography>
          </Box>
        </Box>
        {contact.last_contacted && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <ScheduleIcon
                sx={{ fontSize: 16, mr: 1, verticalAlign: "middle" }}
              />
              Last Contacted:{" "}
              {new Date(contact.last_contacted).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </CardContent>
      <CardActions>
        <Tooltip title="Record Response">
          <IconButton size="small" onClick={() => setResponseDialogOpen(true)}>
            <EmailIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(contact)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(contact.id)}>
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
            onSendSequence(contact);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Sequence</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setResponseDialogOpen(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Record Response</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEdit(contact);
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
            onDelete(contact.id);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={responseDialogOpen}
        onClose={() => setResponseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Response</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Response Type
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                variant={responseType === "positive" ? "contained" : "outlined"}
                color="success"
                onClick={() => setResponseType("positive")}
                startIcon={<CheckCircleIcon />}
              >
                Positive
              </Button>
              <Button
                variant={responseType === "neutral" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setResponseType("neutral")}
                startIcon={<AccessTimeIcon />}
              >
                Neutral
              </Button>
              <Button
                variant={responseType === "negative" ? "contained" : "outlined"}
                color="error"
                onClick={() => setResponseType("negative")}
                startIcon={<CancelIcon />}
              >
                Negative
              </Button>
            </Box>
            <TextField
              label="Response Content"
              fullWidth
              multiline
              rows={4}
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleResponseSubmit}
            disabled={!responseType || !responseContent}
          >
            Record Response
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    position: "",
    industry: "",
    company_size: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [similarContacts, setSimilarContacts] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/contacts/");
      setContacts(response.data);
    } catch (err) {
      setError("Failed to fetch contacts");
    }
  };

  const handleOpen = () => {
    setFormData({
      name: "",
      email: "",
      company: "",
      position: "",
      industry: "",
      company_size: "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedContact(null);
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      company: contact.company,
      position: contact.position,
      industry: contact.industry,
      company_size: contact.company_size,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await axios.delete(`http://localhost:8000/contacts/${id}`);
        setSuccess("Contact deleted successfully!");
        fetchContacts();
      } catch (err) {
        setError("Failed to delete contact");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedContact) {
        await axios.put(
          `http://localhost:8000/contacts/${selectedContact.id}`,
          formData
        );
        setSuccess("Contact updated successfully!");
      } else {
        await axios.post("http://localhost:8000/contacts/", formData);
        setSuccess("Contact created successfully!");
      }
      handleClose();
      fetchContacts();
    } catch (err) {
      setError("Failed to save contact");
    }
  };

  const handleRecordResponse = async (contactId, responseType, content) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/contacts/${contactId}/response`,
        { response_type: responseType, content }
      );
      setSuccess("Response recorded successfully!");
      fetchContacts();
      return response.data;
    } catch (err) {
      setError("Failed to record response");
      throw err;
    }
  };

  const handleSendSequence = async (contact) => {
    // Implement sequence sending logic
    console.log("Sending sequence to contact:", contact);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewSimilarContacts = async (contactId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/contacts/${contactId}/similar`
      );
      setSimilarContacts(response.data);
      setTabValue(1);
    } catch (err) {
      setError("Failed to fetch similar contacts");
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contacts
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Manage your contacts and track their engagement
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
          Add New Contact
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="All Contacts" />
        <Tab label="Similar Contacts" />
      </Tabs>

      {tabValue === 0 ? (
        <Grid container spacing={3}>
          {contacts.map((contact) => (
            <Grid item xs={12} sm={6} md={4} key={contact.id}>
              <ContactCard
                contact={contact}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSendSequence={handleSendSequence}
                onRecordResponse={handleRecordResponse}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {similarContacts.map((contact) => (
            <Grid item xs={12} sm={6} md={4} key={contact.id}>
              <ContactCard
                contact={contact}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSendSequence={handleSendSequence}
                onRecordResponse={handleRecordResponse}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedContact ? "Edit Contact" : "Add New Contact"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
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
                  label="Email"
                  fullWidth
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Company"
                  fullWidth
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Position"
                  fullWidth
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Industry"
                  fullWidth
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Company Size"
                  fullWidth
                  value={formData.company_size}
                  onChange={(e) =>
                    setFormData({ ...formData, company_size: e.target.value })
                  }
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedContact ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Contacts;
