import React from 'react';
import { Container, Typography, Box, Divider } from '@mui/material';

const TermsAndConditions = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Terms and Conditions
      </Typography>
      
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          1. Acceptance of Terms
        </Typography>
        <Typography paragraph>
          By accessing and placing an order with Kingsman, you confirm that you are in agreement with
          and bound by the terms of service contained in the Terms & Conditions outlined below.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          2. Ordering Process
        </Typography>
        <Typography paragraph>
          • All orders are subject to availability and confirmation of the order price.
        </Typography>
        <Typography paragraph>
          • Orders below the minimum order amount will not be processed.
        </Typography>
        <Typography paragraph>
          • Delivery is limited to our specified delivery radius.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          3. Pricing and Payment
        </Typography>
        <Typography paragraph>
          • All prices are in USD and include applicable taxes.
        </Typography>
        <Typography paragraph>
          • We reserve the right to adjust prices without prior notice.
        </Typography>
        <Typography paragraph>
          • Payment is required at the time of ordering.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          4. Order Cancellation
        </Typography>
        <Typography paragraph>
          • Orders can be cancelled within 5 minutes of placement.
        </Typography>
        <Typography paragraph>
          • Orders that have begun preparation cannot be cancelled.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          5. Refund Policy
        </Typography>
        <Typography paragraph>
          • Refunds are processed for cancelled orders within 3-5 business days.
        </Typography>
        <Typography paragraph>
          • Quality issues must be reported within 30 minutes of delivery.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          6. Account Management
        </Typography>
        <Typography paragraph>
          • You are responsible for maintaining the confidentiality of your account.
        </Typography>
        <Typography paragraph>
          • We reserve the right to suspend accounts that violate our terms.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          7. Operating Hours
        </Typography>
        <Typography paragraph>
          • Orders can only be placed during our operating hours.
        </Typography>
        <Typography paragraph>
          • Operating hours are subject to change during holidays.
        </Typography>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          8. Modifications
        </Typography>
        <Typography paragraph>
          We reserve the right to modify these terms at any time. Changes will be effective immediately
          upon posting to the website.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="body2" color="text.secondary" align="center">
        Last updated: {new Date().toLocaleDateString()}
      </Typography>
    </Container>
  );
};

export default TermsAndConditions;