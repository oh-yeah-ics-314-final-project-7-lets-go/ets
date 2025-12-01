import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import { Issue, Severity } from '@prisma/client';

export default function PaidUpToNow({ paidUpToNow, originalContractAward}: { paidUpToNow: number;  originalContractAward: number }) {
  // const paymentLeft = originalContractAward - paidUpToNow;
  // const data = [
  //   { label: 'Contact Paid', value: paidUpToNow },
  //   { label: 'Payment Left', value: paymentLeft },
  // ];
  const paymentLeft = paidUpToNow - originalContractAward;
  const data = [
    { label: 'Contact Paid', value: originalContractAward },
    { label: 'Payment Left', value: paymentLeft },
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Issues
        </Typography>
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
              {issues.length}
              {' '}
              Issues
            </Typography>
            <Chip size="small" color="error" label="-8%" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            IV & V Observations
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'band',
              categoryGapRatio: 0.5,
              data: severityValues,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={[{ type: 'bar', id: 'base', data: severityCountValues }]}
          height={250}
          margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          hideLegend
        />
      </CardContent>
    </Card>
  );
}
