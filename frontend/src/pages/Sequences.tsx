import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';

interface Sequence {
  id: number;
  lead_name: string;
  lead_email: string;
  lead_company: string;
  lead_position: string;
  personalized_subject: string;
  personalized_body: string;
  status: string;
  created_at: string;
  sent_at: string | null;
}

const Sequences = () => {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    try {
      const response = await axios.get('http://localhost:8000/sequences/');
      setSequences(response.data);
    } catch (err) {
      setError('Failed to fetch sequences');
    }
  };

  const handlePreview = (sequence: Sequence) => {
    setSelectedSequence(sequence);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedSequence(null);
  };

  const handleSend = async (id: number) => {
    try {
      await axios.post(`http://localhost:8000/sequences/${id}/send`);
      setSuccess('Sequence sent successfully!');
      fetchSequences();
    } catch (err) {
      setError('Failed to send sequence');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Outreach Sequences
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

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lead</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Sent</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sequences.map((sequence) => (
                <TableRow key={sequence.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{sequence.lead_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sequence.lead_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{sequence.lead_company}</TableCell>
                  <TableCell>{sequence.lead_position}</TableCell>
                  <TableCell>
                    <Chip
                      label={sequence.status}
                      color={getStatusColor(sequence.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(sequence.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {sequence.sent_at
                      ? new Date(sequence.sent_at).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(sequence)}
                      sx={{ mr: 1 }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {sequence.status === 'draft' && (
                      <IconButton
                        size="small"
                        onClick={() => handleSend(sequence.id)}
                        color="primary"
                      >
                        <SendIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={previewOpen}
          onClose={handleClosePreview}
          maxWidth="md"
          fullWidth
        >
          {selectedSequence && (
            <>
              <DialogTitle>
                Preview Sequence
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    To: {selectedSequence.lead_email}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject: {selectedSequence.personalized_subject}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {selectedSequence.personalized_body}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClosePreview}>Close</Button>
                {selectedSequence.status === 'draft' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    onClick={() => {
                      handleSend(selectedSequence.id);
                      handleClosePreview();
                    }}
                  >
                    Send
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Sequences; 