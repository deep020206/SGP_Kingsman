import React from 'react';
import { Container, Typography, Box, Divider } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Privacy Policy
      </Typography>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          1. Information We Collect
        </Typography>
        <Typography paragraph>
          We collect information that you provide directly to us, including:
        </Typography>
        <Typography component="div" sx={{ pl: 2 }}>
          • Name and contact information<br />
          • Delivery address<br />
          • Order history<br />
          • Payment information<br />
          • Communication preferences
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          2. How We Use Your Information
        </Typography>
        <Typography paragraph>
          We use the information we collect to:
        </Typography>
        <Typography component="div" sx={{ pl: 2 }}>
          • Process your orders<br />
          • Send order confirmations and updates<br />
          • Improve our services<br />
          • Communicate about promotions<br />
          • Prevent fraud
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          3. Information Sharing
        </Typography>
        <Typography paragraph>
          We do not sell your personal information. We may share your information with:
        </Typography>
        <Typography component="div" sx={{ pl: 2 }}>
          • Delivery partners<br />
          • Payment processors<br />
          • Service providers<br />
          • Legal authorities when required
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          4. Data Security
        </Typography>
        <Typography paragraph>
          We implement appropriate security measures to protect your personal information, including:
        </Typography>
        <Typography component="div" sx={{ pl: 2 }}>
          • Encryption of sensitive data<br />
          • Regular security assessments<br />
          • Access controls<br />
          • Secure data storage
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          5. Your Rights
        </Typography>
        <Typography paragraph>
          You have the right to:
        </Typography>
        <Typography component="div" sx={{ pl: 2 }}>
          • Access your personal information<br />
          • Correct inaccurate information<br />
          • Request deletion of your information<br />
          • Opt-out of marketing communications
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          6. Cookies and Tracking
        </Typography>
        <Typography paragraph>
          We use cookies and similar technologies to:
        </Typography>
        <Typography component="div" sx={{ pl: 2 }}>
          • Remember your preferences<br />
          • Analyze site usage<br />
          • Enhance site functionality<br />
          • Provide personalized content
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          7. Changes to Privacy Policy
        </Typography>
        <Typography paragraph>
          We may update this privacy policy from time to time. We will notify you of any changes by
          posting the new privacy policy on this page.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          8. Contact Us
        </Typography>
        <Typography paragraph>
          If you have any questions about this privacy policy, please contact us at:
          privacy@kingsman.com
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="body2" color="text.secondary" align="center">
        Last updated: {new Date().toLocaleDateString()}
      </Typography>
    </Container>
  );
};

export default PrivacyPolicy;