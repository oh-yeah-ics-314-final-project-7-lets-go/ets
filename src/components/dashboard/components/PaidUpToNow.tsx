import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
// import { useDrawingArea } from '@mui/x-charts/hooks';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';

interface PieCenterLabelProps {
  primaryText: string;
  secondaryText: string;
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
  // const { width, height, left, top } = useDrawingArea();
  // const primaryY = top + height / 2 - 10;
  // const secondaryY = primaryY + 24;

  return (
    <>
      {primaryText}
      {secondaryText}
    </>
  );
}

const colors = [
  'hsla(112, 75%, 64%, 1.00)',
  'hsla(0, 0%, 55%, 1.00)',
];

export default function PaidUpToNow(
  { paidUpToNow, originalContractAward }: { paidUpToNow: number; originalContractAward: number },
) {
  const paymentLeft = originalContractAward - paidUpToNow;
  const data = [
    { label: 'Contact Paid', value: paidUpToNow },
    { label: 'Payment Left', value: paymentLeft },
  ];
  
  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Contract Paid Up To Now
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PieChart
            colors={colors}
            margin={{
              left: 80,
              right: 80,
              top: 80,
              bottom: 80,
            }}
            series={[
              {
                data,
                innerRadius: 30,
                outerRadius: 100,
                paddingAngle: 5,
                cornerRadius: 5,
                startAngle: -90,
                endAngle: 90,
                highlightScope: { fade: 'global', highlight: 'item' },
              },
            ]}
            height={260}
            width={260}
            hideLegend
          >
            <PieCenterLabel primaryText="98.5K" secondaryText="Total" />
          </PieChart>
        </Box>
      </CardContent>
    </Card>
  );
}
