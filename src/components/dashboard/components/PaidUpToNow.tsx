import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

export default function PaidUpToNow(
  { paidUpToNow, originalContractAward }: { paidUpToNow: number; originalContractAward: number },
) {
  const paymentLeft = Math.abs(originalContractAward - paidUpToNow);
  const labels = ['Contract Paid', 'Original Contract Award'];
  const payments = [paidUpToNow, originalContractAward];
  const paymentPercentage = `${((paidUpToNow / originalContractAward) * 100).toFixed(2)}%`;
  const contractLabel = ((paidUpToNow < originalContractAward) ? 'Payment Left' : 'Overbudget');
  const currency = '$';
  const theme = useTheme();
  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        {/* <Typography component="h2" variant="subtitle2" gutterBottom>
          Contract Paid
        </Typography> */}
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              Contract Paid (
              {currency}
              )
            </Typography>
            <Chip size="small" color="error" label={paymentPercentage} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {contractLabel}
            :
            {currency}
            {paymentLeft.toLocaleString()}
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'band',
              categoryGapRatio: 0.5,
              data: labels,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={[{ type: 'bar', id: 'base', data: payments, label: currency }]}
          height={250}
          margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          hideLegend
        />
      </CardContent>
    </Card>
  );
}
