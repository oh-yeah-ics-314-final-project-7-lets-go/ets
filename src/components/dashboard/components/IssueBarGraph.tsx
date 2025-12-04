import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import { Issue, Severity } from '@prisma/client';

const severityKeys = Object.keys(Severity);
const severityList = severityKeys.map((key) => Severity[key as keyof typeof Severity]);

console.log('Severity List:', severityList);

// Temporary testing data
const issues: Issue[] = [
  {
    id: 1,
    firstRaised: new Date(),
    updatedAt: new Date(),
    projectId: 1,
    creatorId: 1,
    title: 'Issue with Project Alpha',
    description: 'Description of this issue',
    remedy: 'Fix the problem',
    severity: 'HIGH',
    likelihood: 'MEDIUM',
    status: 'OPEN',
  },
  {
    id: 2,
    firstRaised: new Date(),
    updatedAt: new Date(),
    projectId: 1,
    creatorId: 1,
    title: 'Another Issue with Project Alpha',
    description: 'Another description',
    remedy: 'Address the concern',
    severity: 'LOW',
    likelihood: 'HIGH',
    status: 'OPEN',
  },
  {
    id: 3,
    firstRaised: new Date(),
    updatedAt: new Date(),
    projectId: 1,
    creatorId: 1,
    title: 'Another Issue with Project Alpha',
    description: 'Another description',
    remedy: 'Address the concern',
    severity: 'MEDIUM',
    likelihood: 'HIGH',
    status: 'OPEN',
  },
  {
    id: 4,
    firstRaised: new Date(),
    updatedAt: new Date(),
    projectId: 1,
    creatorId: 1,
    title: 'Another Issue with Project Alpha',
    description: 'Another description',
    remedy: 'Address the concern',
    severity: 'MEDIUM',
    likelihood: 'HIGH',
    status: 'OPEN',
  },
];
const severityCountsDict: { [key in Severity]: number } = {
  LOW: 0,
  MEDIUM: 0,
  HIGH: 0,
};
console.log('Initial Severity Counts:', severityCountsDict);

for (const issue of issues) {
  severityCountsDict[issue.severity]++;
}
const severityCountValues: number[] = Object.values(severityCountsDict);

const severityValues = issues.map((issue) => issue.severity);
console.log('Severity Values:', severityValues);

export default function PageViewsBarChart() {
  const theme = useTheme();
  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
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
