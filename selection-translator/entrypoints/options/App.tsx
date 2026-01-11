import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { retryPolicy } from "../utils/retry";
import { DEFAULT_EXCLUDED_TAGS, excludedTagsStorage } from "../utils/storage";

function App() {
  const [excludedTags, setExcludedTags] = useState<string[] | null>(null);
  const [newTag, setNewTag] = useState("");
  const [errorText, setErrorText] = useState<string>("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const tags = await retryPolicy.execute(() =>
        excludedTagsStorage.getValue()
      );
      setExcludedTags(tags);
    };
    loadSettings();
  }, []);

  const handleAddTag = async () => {
    setErrorOpen(false);
    setSaved(false);

    const trimmedTag = newTag.trim().toLowerCase();

    if (!trimmedTag) {
      setErrorText("Please enter a tag name");
      setErrorOpen(true);
      return;
    }

    if (!/^[a-z][a-z0-9]*$/.test(trimmedTag)) {
      setErrorText(
        "Invalid tag name (only lowercase letters and numbers allowed)"
      );
      setErrorOpen(true);
      return;
    }

    if (excludedTags?.includes(trimmedTag)) {
      setErrorText("This tag is already registered");
      setErrorOpen(true);
      return;
    }

    const updatedTags = [...(excludedTags || []), trimmedTag];
    setExcludedTags(updatedTags);
    await retryPolicy.execute(() => excludedTagsStorage.setValue(updatedTags));
    setNewTag("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    setSaved(false);
    const updatedTags =
      excludedTags?.filter((tag) => tag !== tagToDelete) || [];
    setExcludedTags(updatedTags);
    await retryPolicy.execute(() => excludedTagsStorage.setValue(updatedTags));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetToDefault = async () => {
    setSaved(false);
    setExcludedTags(DEFAULT_EXCLUDED_TAGS);
    await retryPolicy.execute(() =>
      excludedTagsStorage.setValue(DEFAULT_EXCLUDED_TAGS)
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTag();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          DOM Click Translation - Excluded Tags
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Configure which HTML tags should be excluded from translation when
          using DOM Click feature. Text within the specified tags will not be
          translated.
        </Typography>

        {excludedTags === null ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Excluded Tags
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {excludedTags.length === 0 ? (
                  <Typography color="text.secondary">
                    No excluded tags configured
                  </Typography>
                ) : (
                  excludedTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`<${tag}>`}
                      onDelete={() => handleDeleteTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                )}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Add Tag
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g., div, span, table"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  error={!!errorOpen}
                />
                <Button variant="contained" onClick={handleAddTag}>
                  Add
                </Button>
              </Stack>
            </Box>

            <Box>
              <Button variant="outlined" onClick={handleResetToDefault}>
                Reset to Default
              </Button>
            </Box>

            <Box sx={{ mt: 4, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Tips:</strong>
                <br />
                • Default excluded tags: pre, code, script, style
                <br />
                • Tag names are automatically converted to lowercase
                <br />• Commonly excluded tags: pre, code, script, style, svg,
                textarea
              </Typography>
            </Box>
          </Stack>
        )}
      </Paper>

      <Snackbar
        open={saved}
        autoHideDuration={2000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSaved(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Settings saved successfully
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorText}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
