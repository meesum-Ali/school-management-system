import { useState } from 'react';
import Head from 'next/head';
import { 
  Box, 
  Container, 
  Typography, 
  Stack, 
  Divider,
  Paper,
  FormControlLabel,
  Switch,
  Button as MuiButton,
} from '@mui/material';
import {
  Button,
  Card,
  Input,
  PasswordToggle,
  Select,
  Textarea,
} from '@/components/ui';

const UIShowcase = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
    { value: 'option4', label: 'Option 4' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Head>
        <title>UI Components Showcase</title>
      </Head>

      <Box mb={6}>
        <Typography variant="h4" component="h1" gutterBottom>
          UI Components Showcase
        </Typography>
        <Typography color="text.secondary">
          A showcase of reusable UI components built with Material-UI
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        {/* Buttons */}
        <Box>
          <Card title="Buttons">
            <Stack spacing={2} direction="column" alignItems="flex-start">
              <Stack spacing={2} direction="row" flexWrap="wrap" gap={2}>
                <Button variant="default">Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </Stack>

              <Stack spacing={2} direction="row" flexWrap="wrap" gap={2}>
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
              </Stack>

              <Stack spacing={2} direction="row" flexWrap="wrap" gap={2}>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </Stack>
            </Stack>
          </Card>
        </Box>

        {/* Inputs */}
        <Box>
          <Card title="Inputs">
            <Stack spacing={3}>
              <Input 
                label="Text Input" 
                placeholder="Enter text here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                fullWidth
              />
              
              <Input 
                label="Password Input"
                type={showPassword ? 'text' : 'password'}
                endAdornment={
                  <PasswordToggle 
                    show={showPassword} 
                    onToggle={() => setShowPassword(!showPassword)} 
                  />
                }
                placeholder="Enter password..."
                fullWidth
              />

              <Select
                label="Select Option"
                options={selectOptions}
                value={selectValue}
                onChange={(value) => setSelectValue(value as string)}
                placeholder="Select an option"
                showNoneOption
                fullWidth
              />

              <Textarea
                label="Textarea"
                placeholder="Enter multiline text here..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                minRows={3}
                fullWidth
              />
            </Stack>
          </Card>
        </Box>
      </Box>

      {/* Cards Section */}
      <Box sx={{ mt: 4 }}>
        <Card title="Card Variations">
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: '1fr 1fr', 
              md: '1fr 1fr 1fr' 
            }, 
            gap: 3 
          }}>
            <Card>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Default Card</Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a basic card with some sample content. Cards can contain any type of content.
                </Typography>
              </Box>
            </Card>
            <Card>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Card with Title</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  This card has a title and action buttons in the footer.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button size="sm">Action</Button>
                </Box>
              </Box>
            </Card>
            <Card
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>Styled Card</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Cards can be fully customized with custom styles and themes.
              </Typography>
            </Card>
          </Box>
        </Card>
      </Box>

      {/* Form Example */}
      <Box sx={{ mt: 4 }}>
        <Card title="Form Example">
          <Stack spacing={3} sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" textAlign="center">Sample Form</Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Input 
                label="First Name" 
                placeholder="John"
                required
                requiredError={!inputValue}
                fullWidth
              />
              <Input 
                label="Last Name" 
                placeholder="Doe"
                required
                fullWidth
              />
            </Box>

            <Input 
              label="Email" 
              type="email"
              placeholder="john.doe@example.com"
              required
              fullWidth
            />
            <Input 
              label="Password"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <PasswordToggle 
                  show={showPassword} 
                  onToggle={() => setShowPassword(!showPassword)} 
                />
              }
              required
              fullWidth
            />
            <Select
              label="Country"
              options={[
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'uk', label: 'United Kingdom' },
              ]}
              required
              showNoneOption
              noneOptionLabel="Select a country"
              fullWidth
            />
            <Textarea
              label="Bio"
              placeholder="Tell us about yourself..."
              minRows={4}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch 
                  checked={switchValue}
                  onChange={(e) => setSwitchValue(e.target.checked)}
                />
              }
              label="I agree to the terms and conditions"
            />
            <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
              <Button 
                variant="default"
                size="lg"
                disabled={!switchValue}
              >
                Submit
              </Button>
              <Button variant="outline">Cancel</Button>
            </Stack>
          </Stack>
        </Card>
      </Box>
    </Container>
  );
};

export default UIShowcase;
